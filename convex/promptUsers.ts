import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreateUser = mutation({
  args: {
    externalId: v.string(),
    displayName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("prompt_users")
      .withIndex("by_app_and_external", (q) =>
        q.eq("appId", "prompt").eq("externalId", args.externalId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        email: args.email,
        updatedAt: Date.now(),
      });
      // iOS側が期待する形式で返す
      return {
        userId: existing._id,
        displayName: args.displayName,
        isNewUser: false,
      };
    }

    const newUserId = await ctx.db.insert("prompt_users", {
      appId: "prompt",
      externalId: args.externalId,
      displayName: args.displayName,
      email: args.email,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // iOS側が期待する形式で返す
    return {
      userId: newUserId,
      displayName: args.displayName,
      isNewUser: true,
    };
  },
});

export const getUserByExternalId = query({
  args: {
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prompt_users")
      .withIndex("by_app_and_external", (q) =>
        q.eq("appId", "prompt").eq("externalId", args.externalId)
      )
      .first();
  },
});

// displayNameを更新する
export const updateDisplayName = mutation({
  args: {
    externalId: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[updateDisplayName] ========== Mutation開始 ==========");
    console.log("[updateDisplayName] externalId:", args.externalId);
    console.log("[updateDisplayName] displayName:", args.displayName);

    const user = await ctx.db
      .query("prompt_users")
      .withIndex("by_app_and_external", (q) =>
        q.eq("appId", "prompt").eq("externalId", args.externalId)
      )
      .first();

    console.log("[updateDisplayName] ユーザー検索結果:", user ? {
      _id: user._id,
      email: user.email,
      旧displayName: user.displayName
    } : "見つかりません");

    if (!user) {
      console.log("[updateDisplayName] ❌ ユーザーが見つかりません");
      throw new Error("ユーザーが見つかりません");
    }

    await ctx.db.patch(user._id, {
      displayName: args.displayName,
      updatedAt: Date.now(),
    });

    console.log("[updateDisplayName] ✅ displayName更新成功");
    console.log("[updateDisplayName] ========== Mutation完了 ==========");

    return {
      success: true,
      displayName: args.displayName,
    };
  },
});
