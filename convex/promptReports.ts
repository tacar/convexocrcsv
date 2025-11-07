import { mutation } from "./_generated/server";
import { v } from "convex/values";

// 通報を作成
export const create = mutation({
  args: {
    promptItemId: v.string(),
    reportedByUserId: v.string(),
    reason: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { promptItemId, reportedByUserId, reason, details } = args;

    console.log("[promptReports.create] 通報を作成", {
      promptItemId,
      reportedByUserId,
      reason,
    });

    const reportId = await ctx.db.insert("prompt_reports", {
      appId: "promptmemo",
      promptItemId,
      reportedByUserId,
      reason,
      details,
      status: "pending", // 初期状態はpending
      createdAt: Date.now(),
    });

    console.log("[promptReports.create] 通報を作成しました", { reportId });

    return reportId;
  },
});
