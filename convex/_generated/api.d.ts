/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as backup from "../backup.js";
import type * as categories from "../categories.js";
import type * as http from "../http.js";
import type * as items from "../items.js";
import type * as migrations_migrateItemsToCategory from "../migrations/migrateItemsToCategory.js";
import type * as ocrcsvCategories from "../ocrcsvCategories.js";
import type * as ocrcsvImages from "../ocrcsvImages.js";
import type * as ocrcsvUsers from "../ocrcsvUsers.js";
import type * as promptCategories from "../promptCategories.js";
import type * as promptItems from "../promptItems.js";
import type * as promptItems_admin from "../promptItems_admin.js";
import type * as promptItems_admin_create from "../promptItems_admin_create.js";
import type * as promptReports from "../promptReports.js";
import type * as promptUsers from "../promptUsers.js";
import type * as storage from "../storage.js";
import type * as sync from "../sync.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  backup: typeof backup;
  categories: typeof categories;
  http: typeof http;
  items: typeof items;
  "migrations/migrateItemsToCategory": typeof migrations_migrateItemsToCategory;
  ocrcsvCategories: typeof ocrcsvCategories;
  ocrcsvImages: typeof ocrcsvImages;
  ocrcsvUsers: typeof ocrcsvUsers;
  promptCategories: typeof promptCategories;
  promptItems: typeof promptItems;
  promptItems_admin: typeof promptItems_admin;
  promptItems_admin_create: typeof promptItems_admin_create;
  promptReports: typeof promptReports;
  promptUsers: typeof promptUsers;
  storage: typeof storage;
  sync: typeof sync;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
