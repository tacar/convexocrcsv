import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[create] ========== Mutation開始 ==========');
    console.log('[create] name:', args.name);
    console.log('[create] userId:', args.userId);
    console.log('[create] タイムスタンプ:', new Date().toISOString());

    const categoryId = await ctx.db.insert("kaumono_categories", {
      appId: "kaumono",
      name: args.name,
      ownerId: args.userId,
      memberIds: [args.userId],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log('[create] ✅ カテゴリ作成成功 categoryId:', categoryId);
    console.log('[create] ========== Mutation完了 ==========');
    return categoryId;
  },
});

export const getByUser = query({
  args: {
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[getByUser] ========== クエリ開始 ==========');
    console.log('[getByUser] userId:', args.userId);
    console.log('[getByUser] タイムスタンプ:', new Date().toISOString());

    const ownCategories = await ctx.db
      .query("kaumono_categories")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();

    console.log('[getByUser] 所有カテゴリ数:', ownCategories.length);

    const memberCategories = await ctx.db
      .query("kaumono_categories")
      .filter((q) => q.neq(q.field("ownerId"), args.userId))
      .collect();

    console.log('[getByUser] メンバーカテゴリ候補数:', memberCategories.length);

    const filteredMemberCategories = memberCategories.filter((cat) =>
      cat.memberIds.includes(args.userId)
    );

    console.log('[getByUser] フィルタ後メンバーカテゴリ数:', filteredMemberCategories.length);

    const result = [...ownCategories, ...filteredMemberCategories];
    console.log('[getByUser] 合計返却カテゴリ数:', result.length);
    console.log('[getByUser] カテゴリ一覧:', result.map(c => ({ id: c._id, name: c.name })));
    console.log('[getByUser] ========== クエリ完了 ==========');

    return result;
  },
});

export const update = mutation({
  args: {
    id: v.id("kaumono_categories"),
    name: v.string(),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[update] ========== Mutation開始 ==========');
    console.log('[update] categoryId:', args.id);
    console.log('[update] name:', args.name);
    console.log('[update] userId:', args.userId);
    console.log('[update] タイムスタンプ:', new Date().toISOString());

    const category = await ctx.db.get(args.id);
    console.log('[update] 既存category:', category ? { id: category._id, name: category.name, ownerId: category.ownerId } : null);

    if (!category || category.ownerId !== args.userId) {
      console.log('[update] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    console.log('[update] ✅ カテゴリ更新成功');
    console.log('[update] ========== Mutation完了 ==========');
  },
});

export const remove = mutation({
  args: {
    id: v.id("kaumono_categories"),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[remove] ========== Mutation開始 ==========');
    console.log('[remove] categoryId:', args.id);
    console.log('[remove] userId:', args.userId);
    console.log('[remove] タイムスタンプ:', new Date().toISOString());

    const category = await ctx.db.get(args.id);
    console.log('[remove] category:', category ? { id: category._id, name: category.name } : null);

    if (!category || category.ownerId !== args.userId) {
      console.log('[remove] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    // カテゴリ内のアイテムを削除
    const items = await ctx.db
      .query("kaumono_items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    console.log('[remove] 関連アイテム数:', items.length);

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
    console.log('[remove] ✅ カテゴリ削除成功（アイテム含む）');
    console.log('[remove] ========== Mutation完了 ==========');
  },
});

export const generateInviteToken = mutation({
  args: {
    categoryId: v.id("kaumono_categories"),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[generateInviteToken] ========== Mutation開始 ==========');
    console.log('[generateInviteToken] categoryId:', args.categoryId);
    console.log('[generateInviteToken] userId:', args.userId);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.ownerId !== args.userId) {
      console.log('[generateInviteToken] ❌ 権限なし');
      throw new Error("権限がありません");
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const tokenHash = btoa(token);

    // 24時間後の有効期限を設定
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

    await ctx.db.patch(args.categoryId, {
      joinTokenHash: tokenHash,
      joinTokenExpiresAt: expiresAt,
    });

    console.log('[generateInviteToken] ✅ トークン生成成功');
    console.log('[generateInviteToken] 有効期限:', new Date(expiresAt).toISOString());
    console.log('[generateInviteToken] ========== Mutation完了 ==========');

    return token;
  },
});

export const acceptInvite = mutation({
  args: {
    token: v.string(),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[acceptInvite] ========== Mutation開始 ==========');
    console.log('[acceptInvite] token:', args.token);
    console.log('[acceptInvite] userId:', args.userId);

    const tokenHash = btoa(args.token);
    const category = await ctx.db
      .query("kaumono_categories")
      .withIndex("by_token", (q) => q.eq("joinTokenHash", tokenHash))
      .first();

    if (!category) {
      console.log('[acceptInvite] ❌ カテゴリが見つかりません');
      throw new Error("無効な招待リンクです");
    }

    // 有効期限チェック
    if (category.joinTokenExpiresAt && Date.now() > category.joinTokenExpiresAt) {
      console.log('[acceptInvite] ❌ 招待リンクの有効期限が切れています');
      console.log('[acceptInvite] 期限:', new Date(category.joinTokenExpiresAt).toISOString());
      throw new Error("招待リンクの有効期限が切れています（24時間）");
    }

    if (!category.memberIds.includes(args.userId)) {
      await ctx.db.patch(category._id, {
        memberIds: [...category.memberIds, args.userId],
      });
      console.log('[acceptInvite] ✅ メンバー追加成功');
    } else {
      console.log('[acceptInvite] ⚠️ 既にメンバーです');
    }

    console.log('[acceptInvite] ========== Mutation完了 ==========');
    return category._id;
  },
});

export const getCategoryWithMembers = query({
  args: {
    categoryId: v.id("kaumono_categories"),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category || !category.memberIds.includes(args.userId)) {
      return null;
    }

    const members = await Promise.all(
      category.memberIds.map(async (memberId) => {
        const user = await ctx.db.get(memberId);
        return {
          _id: memberId,
          displayName: user?.displayName || "不明",
          email: user?.email || "",
          isOwner: memberId === category.ownerId,
        };
      })
    );

    return {
      ...category,
      members,
    };
  },
});

export const removeMember = mutation({
  args: {
    categoryId: v.id("kaumono_categories"),
    targetUserId: v.id("kaumono_users"),
    executorUserId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("カテゴリが見つかりません");
    }

    // オーナー権限チェック
    if (category.ownerId !== args.executorUserId) {
      throw new Error("オーナーのみがメンバーを除名できます");
    }

    // 自分自身は除名できない
    if (args.targetUserId === args.executorUserId) {
      throw new Error("自分自身を除名することはできません");
    }

    // 対象ユーザーがメンバーかチェック
    if (!category.memberIds.includes(args.targetUserId)) {
      throw new Error("指定されたユーザーはこのカテゴリのメンバーではありません");
    }

    // memberIdsから対象ユーザーを削除
    const newMemberIds = category.memberIds.filter(id => id !== args.targetUserId);

    await ctx.db.patch(args.categoryId, {
      memberIds: newMemberIds,
    });

    return { success: true };
  },
});

export const leaveCategory = mutation({
  args: {
    categoryId: v.id("kaumono_categories"),
    userId: v.id("kaumono_users"),
  },
  handler: async (ctx, args) => {
    console.log('[leaveCategory] ========== Mutation開始 ==========');
    console.log('[leaveCategory] categoryId:', args.categoryId);
    console.log('[leaveCategory] userId:', args.userId);
    console.log('[leaveCategory] タイムスタンプ:', new Date().toISOString());

    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      console.log('[leaveCategory] ❌ カテゴリが見つかりません');
      throw new Error("カテゴリが見つかりません");
    }

    console.log('[leaveCategory] カテゴリ名:', category.name);
    console.log('[leaveCategory] オーナーID:', category.ownerId);
    console.log('[leaveCategory] 現在のメンバー数:', category.memberIds.length);

    // オーナーは脱退できない
    if (category.ownerId === args.userId) {
      console.log('[leaveCategory] ❌ オーナーは脱退できません');
      throw new Error("オーナーはカテゴリから脱退できません");
    }

    // ユーザーがメンバーかチェック
    if (!category.memberIds.includes(args.userId)) {
      console.log('[leaveCategory] ❌ メンバーではありません');
      throw new Error("このカテゴリのメンバーではありません");
    }

    // memberIdsから自分を削除
    const newMemberIds = category.memberIds.filter(id => id !== args.userId);

    await ctx.db.patch(args.categoryId, {
      memberIds: newMemberIds,
      updatedAt: Date.now(),
    });

    console.log('[leaveCategory] ✅ 脱退成功');
    console.log('[leaveCategory] 残りメンバー数:', newMemberIds.length);
    console.log('[leaveCategory] ========== Mutation完了 ==========');

    return { success: true };
  },
});