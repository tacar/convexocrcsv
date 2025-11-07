import { mutation } from "./_generated/server";
import { v } from "convex/values";

// 管理者のメールアドレス
const ADMIN_EMAILS = ["tacarz@gmail.com"];

// 管理者チェック関数
async function isAdmin(ctx: any, firebaseUid: string): Promise<boolean> {
  const user = await ctx.db
    .query("prompt_users")
    .withIndex("by_app_and_external", (q: any) =>
      q.eq("appId", "prompt").eq("externalId", firebaseUid)
    )
    .first();

  if (!user) {
    return false;
  }

  return ADMIN_EMAILS.includes(user.email);
}

// 管理者用: 投稿者名を指定してプロンプトを作成
export const createWithAuthor = mutation({
  args: {
    categoryId: v.id("prompt_categories"),
    title: v.string(),
    content: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    isShared: v.optional(v.boolean()),
    authorName: v.string(), // 投稿者名
    adminUserId: v.string(), // 管理者のFirebase UID
  },
  handler: async (ctx, args) => {
    const { categoryId, title, content, imageUrls, isShared, authorName, adminUserId } = args;

    // 管理者権限チェック
    const adminCheck = await isAdmin(ctx, adminUserId);
    if (!adminCheck) {
      throw new Error("管理者権限が必要です");
    }

    console.log("[createWithAuthor] 投稿者名でユーザーを検索または作成:", authorName);

    // 投稿者名でユーザーを検索
    let authorUser = await ctx.db
      .query("prompt_users")
      .filter((q) =>
        q.and(
          q.eq(q.field("appId"), "prompt"),
          q.eq(q.field("displayName"), authorName)
        )
      )
      .first();

    // ユーザーが存在しない場合は作成
    if (!authorUser) {
      console.log("[createWithAuthor] ユーザーが存在しないため作成します");
      const newUserId = await ctx.db.insert("prompt_users", {
        appId: "prompt",
        externalId: `admin_created_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        displayName: authorName,
        email: `${authorName.toLowerCase().replace(/\s/g, '_')}@admin.local`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      authorUser = await ctx.db.get(newUserId);
    }

    if (!authorUser) {
      throw new Error("ユーザーの作成に失敗しました");
    }

    console.log("[createWithAuthor] 投稿者ユーザーID:", authorUser._id);

    // カテゴリの権限チェック
    const category = await ctx.db.get(categoryId);
    if (!category) {
      throw new Error("カテゴリが見つかりません");
    }

    // 現在のアイテム数を取得してsortOrderを設定
    const items = await ctx.db
      .query("prompt_items")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();

    console.log("[createWithAuthor] プロンプトを作成中...");

    const itemId = await ctx.db.insert("prompt_items", {
      appId: "prompt",
      categoryId: categoryId,
      title: title,
      content: content,
      done: false,
      isShared: isShared || false,
      usageCount: 0,
      imageUrls: imageUrls,
      createdBy: authorUser._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sortOrder: items.length,
    });

    console.log("[createWithAuthor] ✅ プロンプト作成成功:", itemId);

    return itemId;
  },
});

// 管理者用: 投稿者名を変更してプロンプトを更新
export const updateWithAuthor = mutation({
  args: {
    id: v.id("prompt_items"),
    title: v.string(),
    content: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    isShared: v.optional(v.boolean()),
    authorName: v.string(), // 投稿者名
    adminUserId: v.string(), // 管理者のFirebase UID
  },
  handler: async (ctx, args) => {
    const { id, title, content, imageUrls, isShared, authorName, adminUserId } = args;

    // 管理者権限チェック
    const adminCheck = await isAdmin(ctx, adminUserId);
    if (!adminCheck) {
      throw new Error("管理者権限が必要です");
    }

    console.log("[updateWithAuthor] 投稿者名でユーザーを検索または作成:", authorName);

    // 投稿者名でユーザーを検索
    let authorUser = await ctx.db
      .query("prompt_users")
      .filter((q) =>
        q.and(
          q.eq(q.field("appId"), "prompt"),
          q.eq(q.field("displayName"), authorName)
        )
      )
      .first();

    // ユーザーが存在しない場合は作成
    if (!authorUser) {
      console.log("[updateWithAuthor] ユーザーが存在しないため作成します");
      const newUserId = await ctx.db.insert("prompt_users", {
        appId: "prompt",
        externalId: `admin_created_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        displayName: authorName,
        email: `${authorName.toLowerCase().replace(/\s/g, '_')}@admin.local`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      authorUser = await ctx.db.get(newUserId);
    }

    if (!authorUser) {
      throw new Error("ユーザーの作成に失敗しました");
    }

    console.log("[updateWithAuthor] プロンプトを更新中...");

    await ctx.db.patch(id, {
      title: title,
      content: content,
      imageUrls: imageUrls,
      isShared: isShared,
      createdBy: authorUser._id,
      updatedAt: Date.now(),
    });

    console.log("[updateWithAuthor] ✅ プロンプト更新成功");

    return { success: true };
  },
});
