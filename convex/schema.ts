import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  kaumono_users: defineTable({
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

  kaumono_categories: defineTable({
    appId: v.string(),
    name: v.string(),
    ownerId: v.id("kaumono_users"),
    memberIds: v.array(v.id("kaumono_users")),
    joinTokenHash: v.optional(v.string()),
    joinTokenExpiresAt: v.optional(v.number()), // 招待トークンの有効期限（タイムスタンプ）
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_token", ["joinTokenHash"])
    .index("by_app", ["appId"])
    .index("by_app_and_owner", ["appId", "ownerId"]),

  kaumono_items: defineTable({
    appId: v.string(),
    categoryId: v.id("kaumono_categories"),
    listId: v.optional(v.string()), // 古いデータ用（削除予定）
    title: v.string(),
    done: v.boolean(),
    createdBy: v.id("kaumono_users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    details: v.optional(v.string()),
    reminderTime: v.optional(v.number()), // 通知時刻（タイムスタンプ）
    isReminderEnabled: v.optional(v.boolean()), // 通知on/off
  })
    .index("by_category", ["categoryId"])
    .index("by_app_and_category", ["appId", "categoryId"])
    .index("by_category_and_done", ["categoryId", "done"])
    .index("by_category_and_order", ["categoryId", "sortOrder"]),

  // ========== prompt用テーブル ==========
  prompt_users: defineTable({
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

  prompt_categories: defineTable({
    appId: v.string(),
    name: v.string(),
    ownerId: v.id("prompt_users"),
    memberIds: v.array(v.id("prompt_users")),
    joinTokenHash: v.optional(v.string()),
    joinTokenExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_token", ["joinTokenHash"])
    .index("by_app", ["appId"])
    .index("by_app_and_owner", ["appId", "ownerId"]),

  prompt_items: defineTable({
    appId: v.string(),
    categoryId: v.id("prompt_categories"),
    title: v.string(),
    content: v.optional(v.string()), // プロンプトの本文内容
    done: v.optional(v.boolean()), // 完了状態
    isShared: v.optional(v.boolean()), // 共有状態（みんなに公開）
    usageCount: v.optional(v.number()), // 使用回数
    imageUrls: v.optional(v.array(v.string())), // 画像URL配列
    createdBy: v.id("prompt_users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  })
    .index("by_category", ["categoryId"])
    .index("by_app_and_category", ["appId", "categoryId"])
    .index("by_category_and_order", ["categoryId", "sortOrder"])
    .index("by_shared", ["isShared"]),

  // 通報用テーブル
  prompt_reports: defineTable({
    appId: v.string(),
    promptItemId: v.string(), // 通報対象のプロンプトID（Convex ID）
    reportedByUserId: v.string(), // 通報したユーザーのFirebase UID
    reason: v.string(), // 通報理由（spam, inappropriate, copyright, other）
    details: v.optional(v.string()), // 詳細説明
    status: v.string(), // 処理状態（pending, reviewed, resolved）
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptItemId"])
    .index("by_status", ["status"])
    .index("by_app", ["appId"]),
});