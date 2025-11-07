/**
 * Convex HTTP API用のクライアント
 * URL、POST内容をログ出力します
 */

import { convexApiClient } from './apiClient';
import type { Id } from '../../convex/_generated/dataModel';

// ===== リクエスト/レスポンス型定義 =====

export interface CreateCategoryRequest {
  name: string;
  userId: Id<'prompt_users'>;
}

export interface UpdateCategoryRequest {
  name: string;
  userId: Id<'prompt_users'>;
}

export interface CreateListRequest {
  categoryId: Id<'prompt_categories'>;
  title: string;
  userId: Id<'prompt_users'>;
}

export interface UpdateListRequest {
  title: string;
  userId: Id<'prompt_users'>;
}

export interface CreateItemRequest {
  listId: Id<'prompt_categories'>;
  title: string;
  details?: string;
  userId: Id<'prompt_users'>;
}

export interface UpdateItemRequest {
  title?: string;
  details?: string;
  userId: Id<'prompt_users'>;
}

export interface ToggleItemRequest {
  itemId: Id<'prompt_items'>;
  userId: Id<'prompt_users'>;
}

export interface GetOrCreateUserRequest {
  email: string;
  name: string;
  photoUrl?: string;
}

// ===== API関数 =====

/**
 * カテゴリ一覧取得
 */
export const getCategories = async (userId: Id<'prompt_users'>) => {
  const response = await convexApiClient.get(`/api/v1/categories?userId=${userId}`);
  return response.data;
};

/**
 * カテゴリ作成
 */
export const createCategory = async (data: CreateCategoryRequest) => {
  const response = await convexApiClient.post('/api/v1/categories', data);
  return response.data;
};

/**
 * カテゴリ更新
 */
export const updateCategory = async (
  categoryId: Id<'prompt_categories'>,
  data: UpdateCategoryRequest
) => {
  const response = await convexApiClient.patch(`/api/v1/categories/${categoryId}`, data);
  return response.data;
};

/**
 * カテゴリ削除
 */
export const deleteCategory = async (
  categoryId: Id<'prompt_categories'>,
  userId: Id<'prompt_users'>
) => {
  const response = await convexApiClient.delete(
    `/api/v1/categories/${categoryId}?userId=${userId}`
  );
  return response.data;
};

/**
 * リスト一覧取得
 */
export const getLists = async (
  categoryId: Id<'prompt_categories'>,
  userId: Id<'prompt_users'>
) => {
  const response = await convexApiClient.get(
    `/api/v1/lists?categoryId=${categoryId}&userId=${userId}`
  );
  return response.data;
};

/**
 * リスト作成
 */
export const createList = async (data: CreateListRequest) => {
  const response = await convexApiClient.post('/api/v1/lists', data);
  return response.data;
};

/**
 * リスト更新
 */
export const updateList = async (listId: Id<'prompt_categories'>, data: UpdateListRequest) => {
  const response = await convexApiClient.patch(`/api/v1/lists/${listId}`, data);
  return response.data;
};

/**
 * リスト削除
 */
export const deleteList = async (listId: Id<'prompt_categories'>, userId: Id<'prompt_users'>) => {
  const response = await convexApiClient.delete(`/api/v1/lists/${listId}?userId=${userId}`);
  return response.data;
};

/**
 * アイテム一覧取得
 */
export const getItems = async (listId: Id<'prompt_categories'>, userId: Id<'prompt_users'>) => {
  const response = await convexApiClient.get(
    `/api/v1/items?listId=${listId}&userId=${userId}`
  );
  return response.data;
};

/**
 * アイテム作成
 */
export const createItem = async (data: CreateItemRequest) => {
  const response = await convexApiClient.post('/api/v1/items', data);
  return response.data;
};

/**
 * アイテム更新
 */
export const updateItem = async (itemId: Id<'prompt_items'>, data: UpdateItemRequest) => {
  const response = await convexApiClient.patch(`/api/v1/items/${itemId}`, data);
  return response.data;
};

/**
 * アイテムの完了/未完了を切り替え
 */
export const toggleItem = async (data: ToggleItemRequest) => {
  const response = await convexApiClient.post('/api/v1/items/toggle', data);
  return response.data;
};

/**
 * アイテム削除
 */
export const deleteItem = async (itemId: Id<'prompt_items'>, userId: Id<'prompt_users'>) => {
  const response = await convexApiClient.delete(`/api/v1/items/${itemId}?userId=${userId}`);
  return response.data;
};

/**
 * ユーザー作成/取得
 */
export const getOrCreateUser = async (data: GetOrCreateUserRequest) => {
  const response = await convexApiClient.post('/api/v1/users/getOrCreate', data);
  return response.data;
};
