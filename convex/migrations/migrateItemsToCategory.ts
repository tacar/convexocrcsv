import { internalMutation } from "../_generated/server";

export const migrateItemsToCategory = internalMutation({
  args: {},
  handler: async (ctx) => {
    // すべてのアイテムを取得
    const items = await ctx.db.query("kaumono_items").collect();

    let updated = 0;
    for (const item of items) {
      // @ts-ignore - listIdが存在する古いデータを処理
      if (item.listId && !item.categoryId) {
        // @ts-ignore
        const list = await ctx.db.get(item.listId);
        if (list) {
          await ctx.db.patch(item._id, {
            // @ts-ignore
            categoryId: list.categoryId,
          });
          updated++;
        }
      }
    }

    return { updated, total: items.length };
  },
});
