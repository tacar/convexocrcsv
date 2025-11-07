import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const APP_ID = "ocrcsv";

export const getOrCreateUser = mutation({
  args: {
    externalId: v.string(),
    displayName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // 既存ユーザーを検索
    const existing = await ctx.db
      .query("ocrcsv_users")
      .withIndex("by_app_and_external", (q) =>
        q.eq("appId", APP_ID).eq("externalId", args.externalId)
      )
      .first();

    if (existing) {
      return { userId: existing._id };
    }

    // 新規ユーザー作成
    const userId = await ctx.db.insert("ocrcsv_users", {
      appId: APP_ID,
      externalId: args.externalId,
      displayName: args.displayName,
      email: args.email,
      createdAt: Date.now(),
    });

    return { userId };
  },
});

export const getUserByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ocrcsv_users")
      .withIndex("by_app_and_external", (q) =>
        q.eq("appId", APP_ID).eq("externalId", args.externalId)
      )
      .first();
  },
});
