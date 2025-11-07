import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========== ocrcsv用テーブル ==========
  ocrcsv_users: defineTable({
    appId: v.string(),
    externalId: v.optional(v.string()),
    displayName: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_external", ["externalId"])
    .index("by_app_and_external", ["appId", "externalId"]),

  ocrcsv_categories: defineTable({
    appId: v.string(),
    name: v.string(),
    ownerId: v.id("ocrcsv_users"),
    memberIds: v.array(v.id("ocrcsv_users")),
    joinTokenHash: v.optional(v.string()),
    joinTokenExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_token", ["joinTokenHash"])
    .index("by_app", ["appId"])
    .index("by_app_and_owner", ["appId", "ownerId"]),

  ocrcsv_images: defineTable({
    appId: v.string(),
    categoryId: v.id("ocrcsv_categories"),
    fileName: v.string(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    ocrResult: v.string(),
    mimeType: v.string(),
    createdBy: v.id("ocrcsv_users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    // CSV出力用の列データ（OCR結果を改行で分割した各行）
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
  })
    .index("by_category", ["categoryId"])
    .index("by_app_and_category", ["appId", "categoryId"])
    .index("by_category_and_order", ["categoryId", "sortOrder"]),
});