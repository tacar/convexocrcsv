import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * ポーリング用: カテゴリとアイテムの最新更新タイムスタンプを返す
 * iOS側はこれを定期的に呼び出して、変更があったか確認できる
 */
export const getLatestUpdates = query({
  args: {
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[getLatestUpdates] ========== クエリ開始 ==========');
    console.log('[getLatestUpdates] userId:', args.userId);
    console.log('[getLatestUpdates] タイムスタンプ:', new Date().toISOString());

    // ユーザーのカテゴリを取得
    const ownCategories = await ctx.db
      .query("kaumono_categories")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();

    const allCategories = await ctx.db
      .query("kaumono_categories")
      .collect();

    const memberCategories = allCategories.filter((cat) =>
      cat.memberIds.includes(args.userId) && cat.ownerId !== args.userId
    );

    const userCategories = [...ownCategories, ...memberCategories];
    const categoryIds = userCategories.map((cat) => cat._id);

    console.log('[getLatestUpdates] ユーザーのカテゴリ数:', userCategories.length);

    // カテゴリの最新更新タイムスタンプ
    let latestCategoryUpdate = 0;
    for (const cat of userCategories) {
      const timestamp = cat.updatedAt || cat.createdAt;
      if (timestamp > latestCategoryUpdate) {
        latestCategoryUpdate = timestamp;
      }
    }

    // 各カテゴリのアイテムの最新更新タイムスタンプ
    let latestItemUpdate = 0;
    const itemUpdates: { [categoryId: string]: number } = {};

    for (const categoryId of categoryIds) {
      const items = await ctx.db
        .query("kaumono_items")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();

      let categoryLatest = 0;
      for (const item of items) {
        const timestamp = item.updatedAt || item.createdAt;
        if (timestamp > categoryLatest) {
          categoryLatest = timestamp;
        }
      }

      itemUpdates[categoryId] = categoryLatest;
      if (categoryLatest > latestItemUpdate) {
        latestItemUpdate = categoryLatest;
      }
    }

    const result = {
      latestCategoryUpdate,
      latestItemUpdate,
      itemUpdatesByCategory: itemUpdates,
      categoryCount: userCategories.length,
      serverTime: Date.now(),
    };

    console.log('[getLatestUpdates] 結果:');
    console.log('  カテゴリ最終更新:', latestCategoryUpdate, '(', new Date(latestCategoryUpdate).toISOString(), ')');
    console.log('  アイテム最終更新:', latestItemUpdate, '(', new Date(latestItemUpdate).toISOString(), ')');
    console.log('  カテゴリ数:', userCategories.length);
    console.log('  サーバー時刻:', Date.now(), '(', new Date().toISOString(), ')');
    console.log('[getLatestUpdates] ========== クエリ完了 ==========');

    return result;
  },
});
