import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    categoryId: v.id("prompt_categories"),
    title: v.string(),
    content: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    isShared: v.optional(v.boolean()),
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[create] ========== Mutation開始 ==========');
    console.log('[create] categoryId:', args.categoryId);
    console.log('[create] title:', args.title);
    console.log('[create] isShared:', args.isShared);
    console.log('[create] imageUrls:', args.imageUrls);
    console.log('[create] userId:', args.userId);
    console.log('[create] タイムスタンプ:', new Date().toISOString());

    const category = await ctx.db.get(args.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[create] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    // 現在のアイテム数を取得してsortOrderを設定
    const items = await ctx.db
      .query("prompt_items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    console.log('[create] 既存アイテム数:', items.length);

    const itemId = await ctx.db.insert("prompt_items", {
      appId: "prompt",
      categoryId: args.categoryId,
      title: args.title,
      content: args.content,
      done: false,
      isShared: args.isShared || false,
      usageCount: 0,
      imageUrls: args.imageUrls,
      createdBy: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sortOrder: items.length,
    });

    console.log('[create] ✅ アイテム作成成功 itemId:', itemId);
    console.log('[create] ========== Mutation完了 ==========');
    return itemId;
  },
});

export const getByCategory = query({
  args: {
    categoryId: v.id("prompt_categories"),
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[getByCategory] ========== クエリ開始 ==========');
    console.log('[getByCategory] categoryId:', args.categoryId);
    console.log('[getByCategory] userId:', args.userId);
    console.log('[getByCategory] タイムスタンプ:', new Date().toISOString());

    const category = await ctx.db.get(args.categoryId);
    console.log('[getByCategory] category:', category ? { id: category._id, name: category.name } : null);
    console.log('[getByCategory] category.memberIds:', category?.memberIds);
    console.log('[getByCategory] userId in memberIds?', category?.memberIds?.includes(args.userId));

    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[getByCategory] ❌ 権限なし - 空配列を返す');
      console.log('[getByCategory] ========== クエリ完了（権限なし） ==========');
      return [];
    }

    const items = await ctx.db
      .query("prompt_items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    console.log('[getByCategory] ✅ items found:', items.length);
    console.log('[getByCategory] アイテム一覧:', items.map(i => ({
      id: i._id,
      title: i.title,
      usageCount: i.usageCount,
      createdAt: new Date(i.createdAt).toISOString()
    })));

    const itemsWithUser = await Promise.all(
      items.map(async (item) => {
        const user = await ctx.db.get(item.createdBy);
        return {
          ...item,
          createdByName: user?.displayName || "不明",
        };
      })
    );

    // sortOrderまたは作成日時でソート
    itemsWithUser.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      return b.createdAt - a.createdAt;
    });

    console.log('[getByCategory] 返却アイテム数:', itemsWithUser.length);
    console.log('[getByCategory] ========== クエリ完了 ==========');

    return itemsWithUser;
  },
});

// ユーザーの全アイテムを取得
export const getByUser = query({
  args: {
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    // ユーザーがメンバーとして参加している全カテゴリを取得
    const ownCategories = await ctx.db
      .query("prompt_categories")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();

    const allCategories = await ctx.db
      .query("prompt_categories")
      .collect();

    const memberCategories = allCategories.filter((cat) =>
      cat.memberIds.includes(args.userId) && cat.ownerId !== args.userId
    );

    const userCategories = [...ownCategories, ...memberCategories];
    const categoryIds = userCategories.map((cat) => cat._id);

    // すべてのカテゴリのアイテムを取得
    const allItems = await ctx.db
      .query("prompt_items")
      .filter((q) =>
        q.or(...categoryIds.map((catId) => q.eq(q.field("categoryId"), catId)))
      )
      .collect();

    const itemsWithUser = await Promise.all(
      allItems.map(async (item) => {
        const user = await ctx.db.get(item.createdBy);
        return {
          ...item,
          createdByName: user?.displayName || "不明",
        };
      })
    );

    // sortOrderまたは作成日時でソート
    itemsWithUser.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      return b.createdAt - a.createdAt;
    });

    return itemsWithUser;
  },
});

// 使用回数を増やす
export const incrementUsage = mutation({
  args: {
    id: v.id("prompt_items"),
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[incrementUsage] ========== Mutation開始 ==========');
    console.log('[incrementUsage] itemId:', args.id);
    console.log('[incrementUsage] userId:', args.userId);

    const item = await ctx.db.get(args.id);
    if (!item || !item.categoryId) {
      console.log('[incrementUsage] ❌ アイテムが見つかりません');
      throw new Error("アイテムが見つかりません");
    }

    const category = await ctx.db.get(item.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[incrementUsage] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    const currentCount = item.usageCount || 0;
    console.log('[incrementUsage] 現在の使用回数:', currentCount, '→', currentCount + 1);

    await ctx.db.patch(args.id, {
      usageCount: currentCount + 1,
      updatedAt: Date.now(),
    });

    console.log('[incrementUsage] ✅ 使用回数更新成功');
    console.log('[incrementUsage] ========== Mutation完了 ==========');
  },
});

export const update = mutation({
  args: {
    id: v.id("prompt_items"),
    title: v.string(),
    content: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    isShared: v.optional(v.boolean()),
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[update] ========== Mutation開始 ==========');
    console.log('[update] itemId:', args.id);
    console.log('[update] title:', args.title);
    console.log('[update] isShared:', args.isShared);
    console.log('[update] imageUrls:', args.imageUrls);
    console.log('[update] userId:', args.userId);

    const item = await ctx.db.get(args.id);
    if (!item || !item.categoryId) {
      console.log('[update] ❌ アイテムが見つかりません');
      throw new Error("アイテムが見つかりません");
    }

    const category = await ctx.db.get(item.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[update] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      content: args.content,
      imageUrls: args.imageUrls,
      isShared: args.isShared,
      updatedAt: Date.now(),
    });

    console.log('[update] ✅ 更新成功');
    console.log('[update] ========== Mutation完了 ==========');
  },
});

export const toggleDone = mutation({
  args: {
    id: v.id("prompt_items"),
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[toggleDone] ========== Mutation開始 ==========');
    console.log('[toggleDone] itemId:', args.id);
    console.log('[toggleDone] userId:', args.userId);

    const item = await ctx.db.get(args.id);
    if (!item || !item.categoryId) {
      console.log('[toggleDone] ❌ アイテムが見つかりません');
      throw new Error("アイテムが見つかりません");
    }

    const category = await ctx.db.get(item.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[toggleDone] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    const newDoneState = !item.done;
    console.log('[toggleDone] 状態変更:', item.done, '→', newDoneState);

    await ctx.db.patch(args.id, {
      done: newDoneState,
      updatedAt: Date.now(),
    });

    console.log('[toggleDone] ✅ 状態更新成功');
    console.log('[toggleDone] ========== Mutation完了 ==========');
  },
});

export const toggleShared = mutation({
  args: {
    id: v.id("prompt_items"),
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[toggleShared] ========== Mutation開始 ==========');
    console.log('[toggleShared] itemId:', args.id);
    console.log('[toggleShared] userId:', args.userId);

    const item = await ctx.db.get(args.id);
    if (!item || !item.categoryId) {
      console.log('[toggleShared] ❌ アイテムが見つかりません');
      throw new Error("アイテムが見つかりません");
    }

    const category = await ctx.db.get(item.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[toggleShared] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    const newSharedState = !item.isShared;
    console.log('[toggleShared] 状態変更:', item.isShared, '→', newSharedState);

    await ctx.db.patch(args.id, {
      isShared: newSharedState,
      updatedAt: Date.now(),
    });

    console.log('[toggleShared] ✅ 共有状態更新成功');
    console.log('[toggleShared] ========== Mutation完了 ==========');
  },
});

export const remove = mutation({
  args: {
    id: v.id("prompt_items"),
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[remove] ========== Mutation開始 ==========');
    console.log('[remove] itemId:', args.id);
    console.log('[remove] userId:', args.userId);

    const item = await ctx.db.get(args.id);
    if (!item || !item.categoryId) {
      console.log('[remove] ❌ アイテムが見つかりません');
      throw new Error("アイテムが見つかりません");
    }

    const category = await ctx.db.get(item.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[remove] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    await ctx.db.delete(args.id);

    // カテゴリのupdatedAtを更新（削除を検知できるようにする）
    await ctx.db.patch(item.categoryId, {
      updatedAt: Date.now(),
    });

    console.log('[remove] ✅ 削除成功（カテゴリも更新）');
    console.log('[remove] ========== Mutation完了 ==========');
  },
});

// 共有アイテムを取得（全ユーザーが閲覧可能）
export const getSharedItems = query({
  args: {
    userId: v.id("prompt_users"),
  },
  handler: async (ctx, args) => {
    console.log('[getSharedItems] ========== クエリ開始 ==========');
    console.log('[getSharedItems] userId:', args.userId);

    const items = await ctx.db
      .query("prompt_items")
      .withIndex("by_shared", (q) => q.eq("isShared", true))
      .collect();

    console.log('[getSharedItems] ✅ 共有アイテム数:', items.length);

    const itemsWithUser = await Promise.all(
      items.map(async (item) => {
        const user = await ctx.db.get(item.createdBy);
        const category = await ctx.db.get(item.categoryId);
        return {
          ...item,
          createdByName: user?.displayName || "不明",
          createdByFirebaseUID: user?.externalId || null,
          categoryName: category?.name || "不明",
        };
      })
    );

    // 作成日時でソート（新しい順）
    itemsWithUser.sort((a, b) => b.createdAt - a.createdAt);

    console.log('[getSharedItems] 返却アイテム数:', itemsWithUser.length);
    console.log('[getSharedItems] ========== クエリ完了 ==========');

    return itemsWithUser;
  },
});
