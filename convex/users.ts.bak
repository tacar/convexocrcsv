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
      .query("kaumono_users")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        externalId: args.externalId,
        displayName: args.displayName,
        email: args.email,
      });
      return existing._id;
    }

    return await ctx.db.insert("kaumono_users", {
      appId: "kaumono",
      externalId: args.externalId,
      displayName: args.displayName,
      email: args.email,
    });
  },
});

export const getUserByExternalId = query({
  args: {
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kaumono_users")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});