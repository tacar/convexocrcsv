import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 管理者のメールアドレス
const ADMIN_EMAILS = ["tacarz@gmail.com"];

// 管理者チェック関数（Firebase UIDからメールアドレスをチェック）
async function isAdmin(ctx: any, firebaseUid: string): Promise<boolean> {
  // Firebase UIDからprompt_usersを検索
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

// 管理者用: 全ユーザーを取得（スクリプト用）
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("prompt_users")
      .filter((q) => q.eq(q.field("appId"), "prompt"))
      .collect();

    return users.map(user => ({
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      externalId: user.externalId,
    }));
  },
});

// 管理者用: 共有状態を変更（共有解除）
export const updateSharedStatus = mutation({
  args: {
    promptItemId: v.id("prompt_items"),
    isShared: v.boolean(),
    adminUserId: v.string(), // Firebase UID
  },
  handler: async (ctx, args) => {
    const { promptItemId, isShared, adminUserId } = args;

    // 管理者権限チェック
    const adminCheck = await isAdmin(ctx, adminUserId);
    if (!adminCheck) {
      throw new Error("管理者権限が必要です");
    }

    console.log("[promptItems_admin.updateSharedStatus] 共有状態を変更", {
      promptItemId,
      isShared,
    });

    await ctx.db.patch(promptItemId, {
      isShared,
      updatedAt: Date.now(),
    });

    console.log("[promptItems_admin.updateSharedStatus] 共有状態を変更しました");

    return { success: true };
  },
});

// 管理者用: 通報された投稿の一覧を取得
export const getReportedPrompts = query({
  args: {
    adminUserId: v.string(), // Firebase UID
  },
  handler: async (ctx, args) => {
    const { adminUserId } = args;

    // 管理者権限チェック
    const adminCheck = await isAdmin(ctx, adminUserId);
    if (!adminCheck) {
      throw new Error("管理者権限が必要です");
    }

    // 未処理の通報を取得
    const reports = await ctx.db
      .query("prompt_reports")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // 各通報に対応する投稿情報を取得
    const promptsWithReports = await Promise.all(
      reports.map(async (report) => {
        // prompt_items から投稿を取得（IDが文字列の場合）
        const allPrompts = await ctx.db.query("prompt_items").collect();
        const prompt = allPrompts.find((p) => p._id.toString() === report.promptItemId);

        if (!prompt) {
          return null;
        }

        // 投稿者の情報を取得
        const user = await ctx.db.get(prompt.createdBy);

        return {
          report,
          prompt: {
            ...prompt,
            createdByName: user?.displayName || "不明",
          },
        };
      })
    );

    return promptsWithReports.filter((item) => item !== null);
  },
});
