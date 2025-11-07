import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    categoryId: v.id("kaumono_categories"),
    title: v.string(),
    details: v.optional(v.string()),
    reminderTime: v.optional(v.number()),
    isReminderEnabled: v.optional(v.boolean()),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[create] ========== Mutation開始 ==========');
    console.log('[create] categoryId:', args.categoryId);
    console.log('[create] title:', args.title);
    console.log('[create] userId:', args.userId);
    console.log('[create] タイムスタンプ:', new Date().toISOString());

    const category = await ctx.db.get(args.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[create] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    // 現在のアイテム数を取得してsortOrderを設定
    const items = await ctx.db
      .query("kaumono_items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    console.log('[create] 既存アイテム数:', items.length);

    const itemId = await ctx.db.insert("kaumono_items", {
      appId: "kaumono",
      categoryId: args.categoryId,
      title: args.title,
      details: args.details,
      reminderTime: args.reminderTime,
      isReminderEnabled: args.isReminderEnabled,
      done: false,
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
    categoryId: v.id("kaumono_categories"),
    userId: v.id("kaumono_users"),
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
      .query("kaumono_items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    console.log('[getByCategory] ✅ items found:', items.length);
    console.log('[getByCategory] アイテム一覧:', items.map(i => ({
      id: i._id,
      title: i.title,
      done: i.done,
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

    // 新しいものを上に表示（createdAtの降順）
    itemsWithUser.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    console.log('[getByCategory] 返却アイテム数:', itemsWithUser.length);
    console.log('[getByCategory] ========== クエリ完了 ==========');

    return itemsWithUser;
  },
});

// ユーザーの全アイテムを取得（カテゴリなしを含む）
export const getByUser = query({
  args: {
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    // ユーザーがメンバーとして参加している全カテゴリを取得
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

    // すべてのカテゴリのアイテムを取得
    const allItems = await ctx.db
      .query("kaumono_items")
      .filter((q) =>
        q.or(
          ...categoryIds.map((catId) => q.eq(q.field("categoryId"), catId)),
          // カテゴリなしのアイテム（createdByが自分）
          q.and(
            q.eq(q.field("createdBy"), args.userId),
            q.eq(q.field("categoryId"), undefined as any)
          )
        )
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

    // 新しいものを上に表示（createdAtの降順）
    itemsWithUser.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    return itemsWithUser;
  },
});

export const toggleDone = mutation({
  args: {
    id: v.id("kaumono_items"),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[toggleDone] ========== Mutation開始 ==========');
    console.log('[toggleDone] itemId:', args.id);
    console.log('[toggleDone] userId:', args.userId);
    console.log('[toggleDone] タイムスタンプ:', new Date().toISOString());

    const item = await ctx.db.get(args.id);
    console.log('[toggleDone] item:', item ? { id: item._id, title: item.title, done: item.done } : null);

    if (!item || !item.categoryId) {
      console.log('[toggleDone] ❌ アイテムが見つかりません');
      throw new Error("アイテムが見つかりません");
    }

    const category = await ctx.db.get(item.categoryId);
    console.log('[toggleDone] category:', category ? { id: category._id, name: category.name } : null);

    if (!category || !category.memberIds.includes(args.userId)) {
      console.log('[toggleDone] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    const newDoneState = !item.done;
    console.log('[toggleDone] done状態変更:', item.done, '->', newDoneState);

    await ctx.db.patch(args.id, {
      done: newDoneState,
      updatedAt: Date.now(),
    });

    console.log('[toggleDone] ✅ トグル成功');
    console.log('[toggleDone] ========== Mutation完了 ==========');
  },
});

export const update = mutation({
  args: {
    id: v.id("kaumono_items"),
    title: v.string(),
    details: v.optional(v.string()),
    reminderTime: v.optional(v.number()),
    isReminderEnabled: v.optional(v.boolean()),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[update] ========== Mutation開始 ==========');
    console.log('[update] itemId:', args.id);
    console.log('[update] title:', args.title);
    console.log('[update] details:', args.details);
    console.log('[update] userId:', args.userId);
    console.log('[update] タイムスタンプ:', new Date().toISOString());

    const item = await ctx.db.get(args.id);
    console.log('[update] 既存item:', item ? { id: item._id, title: item.title } : null);

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
      details: args.details,
      reminderTime: args.reminderTime,
      isReminderEnabled: args.isReminderEnabled,
      updatedAt: Date.now(),
    });

    console.log('[update] ✅ 更新成功');
    console.log('[update] ========== Mutation完了 ==========');
  },
});

export const remove = mutation({
  args: {
    id: v.id("kaumono_items"),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[remove] ========== Mutation開始 ==========');
    console.log('[remove] itemId:', args.id);
    console.log('[remove] userId:', args.userId);
    console.log('[remove] タイムスタンプ:', new Date().toISOString());

    const item = await ctx.db.get(args.id);
    console.log('[remove] item:', item ? { id: item._id, title: item.title } : null);

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