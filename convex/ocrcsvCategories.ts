import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const APP_ID = "ocrcsv";

export const create = mutation({
  args: {
    name: v.string(),
    userId: v.id("ocrcsv_users"),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("ocrcsv_categories", {
      appId: APP_ID,
      name: args.name,
      ownerId: args.userId,
      memberIds: [args.userId],
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

export const getByUser = query({
  args: { userId: v.id("ocrcsv_users") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("ocrcsv_categories")
      .withIndex("by_app", (q) => q.eq("appId", APP_ID))
      .collect();

    // メンバーに含まれるカテゴリのみ返す
    return categories.filter((cat) => cat.memberIds.includes(args.userId));
  },
});

export const update = mutation({
  args: {
    id: v.id("ocrcsv_categories"),
    name: v.string(),
    userId: v.id("ocrcsv_users"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category || category.ownerId !== args.userId) {
      throw new Error("権限がありません");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("ocrcsv_categories"),
    userId: v.id("ocrcsv_users"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category || category.ownerId !== args.userId) {
      throw new Error("権限がありません");
    }

    // 関連する画像も削除
    const images = await ctx.db
      .query("ocrcsv_images")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    for (const image of images) {
      await ctx.db.delete(image._id);
    }

    await ctx.db.delete(args.id);
  },
});
