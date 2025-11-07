import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const APP_ID = "ocrcsv";

export const create = mutation({
  args: {
    categoryId: v.id("ocrcsv_categories"),
    fileName: v.string(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    ocrResult: v.string(),
    mimeType: v.string(),
    userId: v.id("ocrcsv_users"),
    column1: v.optional(v.string()),
    column2: v.optional(v.string()),
    column3: v.optional(v.string()),
    column4: v.optional(v.string()),
    column5: v.optional(v.string()),
    column6: v.optional(v.string()),
    column7: v.optional(v.string()),
    column8: v.optional(v.string()),
    column9: v.optional(v.string()),
    column10: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("ocrcsv_images", {
      appId: APP_ID,
      categoryId: args.categoryId,
      fileName: args.fileName,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      ocrResult: args.ocrResult,
      mimeType: args.mimeType,
      createdBy: args.userId,
      createdAt: Date.now(),
      sortOrder: Date.now(),
      column1: args.column1,
      column2: args.column2,
      column3: args.column3,
      column4: args.column4,
      column5: args.column5,
      column6: args.column6,
      column7: args.column7,
      column8: args.column8,
      column9: args.column9,
      column10: args.column10,
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

    // imageUrlがない場合はStorage URLを取得（後方互換性）
    return await Promise.all(
      images.map(async (image) => ({
        ...image,
        imageUrl: image.imageUrl || (image.imageStorageId
          ? await ctx.storage.getUrl(image.imageStorageId)
          : null),
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

    // R2の画像は削除しない（将来的にWorkerでR2削除APIを実装可能）
    await ctx.db.delete(args.id);
  },
});
