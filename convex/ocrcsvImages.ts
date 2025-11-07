import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const APP_ID = "ocrcsv";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    categoryId: v.id("ocrcsv_categories"),
    fileName: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    ocrResult: v.string(),
    mimeType: v.string(),
    userId: v.id("ocrcsv_users"),
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("ocrcsv_images", {
      appId: APP_ID,
      categoryId: args.categoryId,
      fileName: args.fileName,
      imageStorageId: args.imageStorageId,
      ocrResult: args.ocrResult,
      mimeType: args.mimeType,
      createdBy: args.userId,
      createdAt: Date.now(),
      sortOrder: Date.now(),
    });

    return imageId;
  },
});

export const getByCategoryId = query({
  args: { categoryId: v.id("ocrcsv_categories") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("ocrcsv_images")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .order("desc")
      .collect();

    // Storage URLを追加
    return await Promise.all(
      images.map(async (image) => ({
        ...image,
        imageUrl: image.imageStorageId
          ? await ctx.storage.getUrl(image.imageStorageId)
          : null,
      }))
    );
  },
});

export const remove = mutation({
  args: {
    id: v.id("ocrcsv_images"),
    userId: v.id("ocrcsv_users"),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image || image.createdBy !== args.userId) {
      throw new Error("権限がありません");
    }

    // Storage から画像を削除
    if (image.imageStorageId) {
      await ctx.storage.delete(image.imageStorageId);
    }

    await ctx.db.delete(args.id);
  },
});
