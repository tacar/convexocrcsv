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
    imageStorageId: v.optional(v.id("_storage")),
    ocrResult: v.string(),
    mimeType: v.string(),
    createdBy: v.id("ocrcsv_users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  })
    .index("by_category", ["categoryId"])
    .index("by_app_and_category", ["appId", "categoryId"])
    .index("by_category_and_order", ["categoryId", "sortOrder"]),
});