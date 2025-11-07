# 設計書

## 1. アーキテクチャ設計

### 1.1 全体構成
```
┌─────────────────┐
│   React App     │
│  (TypeScript)   │
└────────┬────────┘
         │
         ├─── Firebase Auth (Google認証)
         │
         ├─── Convex DB (ocrcsv_* テーブル)
         │
         └─── OCR API (https://ait.tacarz.workers.dev/image)
```

### 1.2 技術スタック（変更なし）
- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: TailwindCSS
- **ルーティング**: React Router
- **DB**: Convex
- **認証**: Firebase Authentication
- **デプロイ**: Cloudflare Workers

## 2. データベース設計

### 2.1 新規テーブル定義

#### ocrcsv_users
```typescript
{
  appId: v.string(),              // "ocrcsv"
  externalId: v.optional(v.string()), // Firebase UID
  displayName: v.optional(v.string()),
  email: v.string(),
  name: v.optional(v.string()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}
// インデックス:
// - by_external: [externalId]
// - by_app_and_external: [appId, externalId]
```

#### ocrcsv_categories
```typescript
{
  appId: v.string(),              // "ocrcsv"
  name: v.string(),               // カテゴリ名
  ownerId: v.id("ocrcsv_users"),
  memberIds: v.array(v.id("ocrcsv_users")),
  joinTokenHash: v.optional(v.string()),
  joinTokenExpiresAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
}
// インデックス:
// - by_owner: [ownerId]
// - by_token: [joinTokenHash]
// - by_app: [appId]
// - by_app_and_owner: [appId, ownerId]
```

#### ocrcsv_images（新規）
```typescript
{
  appId: v.string(),              // "ocrcsv"
  categoryId: v.id("ocrcsv_categories"),
  fileName: v.string(),           // ファイル名
  imageStorageId: v.optional(v.id("_storage")), // Convex Storageに保存した画像ID
  ocrResult: v.string(),          // OCR結果のテキスト
  mimeType: v.string(),           // "image/jpeg" or "image/png"
  createdBy: v.id("ocrcsv_users"),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  sortOrder: v.optional(v.number()),
}
// インデックス:
// - by_category: [categoryId]
// - by_app_and_category: [appId, categoryId]
// - by_category_and_order: [categoryId, sortOrder]
```

### 2.2 既存テーブル（変更なし）
- `kaumono_*` テーブル群
- `prompt_*` テーブル群

すべて保持し、変更・削除しない。

## 3. 画面設計

### 3.1 画面フロー
```
┌──────────────┐
│ LoginPage    │ (Google認証)
└──────┬───────┘
       │ ログイン後
       ↓
┌──────────────┐
│ Dashboard    │ カテゴリ一覧
│ (ocrcsv版)   │ - カテゴリ作成ボタン
└──────┬───────┘ - カテゴリカード一覧
       │ カテゴリ選択
       ↓
┌──────────────┐
│ CategoryPage │ 画像一覧
│ (ocrcsv版)   │ - 画像アップロードエリア
└──────────────┘ - OCR結果一覧表示
```

### 3.2 各画面の詳細設計

#### 3.2.1 LoginPage（既存を活用）
- **パス**: `/login`
- **機能**: Googleログイン
- **変更点**: Firebaseの設定を更新するのみ

#### 3.2.2 DashboardPage（OCR版）
- **パス**: `/`
- **機能**:
  - カテゴリ一覧表示
  - カテゴリ作成
  - カテゴリ編集・削除
- **API呼び出し**:
  - `api.ocrcsvCategories.getByUser`
  - `api.ocrcsvCategories.create`
  - `api.ocrcsvCategories.update`
  - `api.ocrcsvCategories.remove`

#### 3.2.3 OCRCategoryPage（新規）
- **パス**: `/category/:categoryId`
- **機能**:
  1. **画像アップロードエリア**
     - ドラッグ&ドロップゾーン
     - クリックでファイル選択
     - 対応形式: JPEG, PNG
  2. **OCR処理**
     - 画像をBase64エンコード
     - OCR API呼び出し
     - ローディング表示
  3. **OCR結果一覧**
     - カード形式で表示
     - サムネイル画像
     - OCR結果テキスト
     - コピーボタン
     - 削除ボタン
- **API呼び出し**:
  - `api.ocrcsvImages.create`
  - `api.ocrcsvImages.getByCategoryId`
  - `api.ocrcsvImages.remove`
  - 外部OCR API: `https://ait.tacarz.workers.dev/image`

## 4. Convex API設計

### 4.1 新規ファイル構成
```
convex/
├── ocrcsvUsers.ts        # ユーザー管理
├── ocrcsvCategories.ts   # カテゴリ管理
└── ocrcsvImages.ts       # 画像・OCR結果管理
```

### 4.2 主要な関数

#### ocrcsvUsers.ts
- `getOrCreateUser(externalId, displayName, email)` - mutation
- `getUserByExternalId(externalId)` - query

#### ocrcsvCategories.ts
- `create(name, userId)` - mutation
- `getByUser(userId)` - query
- `update(id, name, userId)` - mutation
- `remove(id, userId)` - mutation

#### ocrcsvImages.ts
- `create(categoryId, fileName, imageStorageId, ocrResult, mimeType, userId)` - mutation
- `getByCategoryId(categoryId)` - query
- `remove(id, userId)` - mutation
- `generateUploadUrl()` - mutation (Convex Storageへのアップロード用)

### 4.3 Convex Storage利用
画像ファイルはConvex Storageに保存します。
- `generateUploadUrl()` でアップロードURLを取得
- ブラウザから直接画像をアップロード
- Storage IDを `ocrcsv_images` テーブルに保存

## 5. OCR API連携設計

### 5.1 API仕様
- **エンドポイント**: `https://ait.tacarz.workers.dev/image`
- **メソッド**: POST
- **ヘッダー**: `Content-Type: application/json`
- **リクエストボディ**:
```json
{
  "image": "<base64_encoded_image>",
  "mimeType": "image/jpeg" or "image/png"
}
```

### 5.2 処理フロー
```
1. ユーザーが画像をドロップ/選択
   ↓
2. FileReaderでBase64エンコード
   ↓
3. OCR APIに送信
   ↓
4. OCR結果を受信
   ↓
5. 画像をConvex Storageにアップロード
   ↓
6. ocrcsv_imagesテーブルに保存
   (fileName, imageStorageId, ocrResult, mimeType)
```

### 5.3 エラーハンドリング
- ファイル形式チェック（JPEG, PNG以外は拒否）
- ファイルサイズ制限（例: 10MB以下）
- API呼び出し失敗時のリトライ
- エラーメッセージの表示

## 6. コンポーネント設計

### 6.1 新規コンポーネント

#### ImageUploadZone.tsx
```typescript
props: {
  onUpload: (file: File) => Promise<void>
  loading: boolean
}
```
- ドラッグ&ドロップエリア
- クリックでファイル選択
- ローディング表示

#### OCRResultCard.tsx
```typescript
props: {
  image: {
    _id: string
    fileName: string
    imageStorageId: string
    ocrResult: string
    createdAt: number
  }
  onDelete: (id: string) => void
  onCopy: (text: string) => void
}
```
- 画像サムネイル表示
- OCR結果テキスト表示
- コピーボタン
- 削除ボタン

### 6.2 既存コンポーネント活用
- `Toast.tsx` - 通知表示
- `ConfirmDialog.tsx` - 削除確認
- `NotificationContext.tsx` - トースト通知管理

## 7. ルーティング設計

### 7.1 ルート構成（App.tsx更新）
```typescript
{
  path: "/login",
  element: <LoginPage />
},
{
  path: "/",
  element: <PrivateRoute />,
  children: [
    {
      index: true,
      element: <OCRDashboardPage />  // OCR版ダッシュボード
    },
    {
      path: "category/:categoryId",
      element: <OCRCategoryPage />   // OCR画像管理
    }
  ]
}
```

### 7.2 既存ルートの扱い
既存のプロンプトアプリのルートは**そのまま保持**します。
OCRアプリのルートは別に追加します。

## 8. 設定ファイルの更新

### 8.1 .env
```env
# Convex設定（更新）
CONVEX_DEPLOYMENT=prod:hidden-seal-783
CONVEX_DEPLOY_KEY=prod:hidden-seal-783|eyJ2MiI6Ijk4ZTllMTk4YWYzNjRjOTNiYTU3NGE2OTcyZDRkNTNhIn0=
VITE_CONVEX_URL=https://hidden-seal-783.convex.cloud

# Firebase設定（更新）
VITE_FIREBASE_API_KEY=AIzaSyBHgeWGvXFROnJ13iPji1BDM3RcJz9SnAA
VITE_FIREBASE_AUTH_DOMAIN=ocrcsv-bec19.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ocrcsv-bec19
VITE_FIREBASE_STORAGE_BUCKET=ocrcsv-bec19.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=42194999993
VITE_FIREBASE_APP_ID=1:42194999993:web:db78ab11ec491eda8a5968
VITE_FIREBASE_MEASUREMENT_ID=G-QKGEEKK253
```

### 8.2 convex/schema.ts
既存のスキーマに `ocrcsv_*` テーブルを追加します。

### 8.3 wrangler.toml
デプロイ設定の更新（必要に応じて）

## 9. 実装手順（概要）

### フェーズ1: 設定更新
1. .envファイルのFirebase/Convex設定を更新
2. convex/schema.tsに `ocrcsv_*` テーブルを追加

### フェーズ2: Convex API実装
3. ocrcsvUsers.ts 作成
4. ocrcsvCategories.ts 作成
5. ocrcsvImages.ts 作成

### フェーズ3: UI実装
6. OCRDashboardPage.tsx 作成（カテゴリ一覧）
7. OCRCategoryPage.tsx 作成（画像アップロード・OCR処理）
8. ImageUploadZone.tsx 作成
9. OCRResultCard.tsx 作成

### フェーズ4: ルーティング更新
10. App.tsxにOCR用ルートを追加

### フェーズ5: テスト・ビルド
11. 動作確認
12. `npm run build` でビルドエラーチェック

## 10. 問題点・リスク

### 10.1 技術的リスク
1. **OCR API の信頼性**
   - APIがダウンした場合のフォールバック
   - レート制限の可能性
   - **対策**: エラーハンドリング強化、リトライロジック

2. **画像サイズ制限**
   - Base64エンコード時のメモリ消費
   - Convex Storageの容量制限
   - **対策**: クライアント側で画像圧縮

3. **既存データとの分離**
   - `appId` による分離が正しく機能するか
   - **対策**: テーブルプレフィックス（ocrcsv_）で明確に分離

### 10.2 データ保護
- 既存テーブル（kaumono_*, prompt_*）は絶対に変更しない
- schema.ts編集時に既存定義を削除しないよう注意

### 10.3 Firebase設定の競合
- 既存のpromptアプリと異なるFirebase設定に更新
- 既存ユーザーがログアウトされる可能性
- **対策**: 段階的な移行、またはアプリを完全に分離

## 11. 設計の検証ポイント

### 11.1 機能要件
- [ ] カテゴリの作成・削除ができる
- [ ] 画像をドラッグ&ドロップでアップロードできる
- [ ] OCR APIが正常に動作する
- [ ] OCR結果がConvexに保存される
- [ ] 画像がConvex Storageに保存される

### 11.2 非機能要件
- [ ] レスポンス時間: OCR処理は5秒以内
- [ ] UI/UX: 既存のデザインと統一感を保つ
- [ ] エラー表示: ユーザーにわかりやすいメッセージ

### 11.3 データ保護
- [ ] 既存データが消えていない
- [ ] 既存テーブルが変更されていない
- [ ] `appId` による分離が機能している

## 12. 設計の前提条件

1. **既存アプリの動作を維持**
   - promptアプリは引き続き動作する
   - kaumonoアプリも引き続き動作する

2. **段階的な実装**
   - 一度に全てを変更しない
   - 各フェーズごとに動作確認

3. **エラーは即座に解決**
   - ビルドエラーが出たら次に進まない
   - 実行時エラーも同様

## 13. 次のステップ

設計完了後、タスク化フェーズに進みます。
この設計書をもとに、具体的な実装タスクを洗い出します。
