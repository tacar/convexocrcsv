import { query } from "./_generated/server";

// すべてのテーブルのデータをバックアップ
export const exportAllData = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("kaumono_users").collect();
    const categories = await ctx.db.query("kaumono_categories").collect();
    const items = await ctx.db.query("kaumono_items").collect();

    return {
      exportedAt: Date.now(),
      tables: {
        kaumono_users: users,
        kaumono_categories: categories,
        kaumono_items: items,
      },
      counts: {
        users: users.length,
        categories: categories.length,
        items: items.length,
      },
    };
  },
});
