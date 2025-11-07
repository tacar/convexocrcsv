# タスク一覧

## 進捗状況
- ⏳ 未着手
- 🔄 作業中
- ✅ 完了

---

## フェーズ1: 設定更新

### タスク1-1: .envファイルの更新 ⏳
**内容**:
- Firebase設定をCLAUDE.mdの内容に更新
- Convex設定をCLAUDE.mdの内容に更新

**ファイル**: `.env`

**変更内容**:
```env
CONVEX_DEPLOYMENT=prod:hidden-seal-783
CONVEX_DEPLOY_KEY=prod:hidden-seal-783|eyJ2MiI6Ijk4ZTllMTk4YWYzNjRjOTNiYTU3NGE2OTcyZDRkNTNhIn0=
VITE_CONVEX_URL=https://hidden-seal-783.convex.cloud

VITE_FIREBASE_API_KEY=AIzaSyBHgeWGvXFROnJ13iPji1BDM3RcJz9SnAA
VITE_FIREBASE_AUTH_DOMAIN=ocrcsv-bec19.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ocrcsv-bec19
VITE_FIREBASE_STORAGE_BUCKET=ocrcsv-bec19.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=42194999993
VITE_FIREBASE_APP_ID=1:42194999993:web:db78ab11ec491eda8a5968
VITE_FIREBASE_MEASUREMENT_ID=G-QKGEEKK253
```

**検証**:
- [ ] .envファイルが更新されている

---

### タスク1-2: convex/schema.tsにocrcsv_*テーブルを追加 ⏳
**内容**:
- 既存のスキーマ定義を**削除せず**、末尾に`ocrcsv_users`, `ocrcsv_categories`, `ocrcsv_images`を追加

**ファイル**: `convex/schema.ts`

**追加内容**:
```typescript
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
```

**検証**:
- [ ] 既存テーブル（kaumono_*, prompt_*）が削除されていない
- [ ] 新規テーブル（ocrcsv_*）が追加されている
- [ ] TypeScriptエラーが出ていない

---

## フェーズ2: Convex API実装

### タスク2-1: convex/ocrcsvUsers.ts を作成 ⏳
**内容**:
- ユーザー管理API
- `getOrCreateUser` mutation
- `getUserByExternalId` query

**ファイル**: `convex/ocrcsvUsers.ts`

**実装内容**:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const APP_ID = "ocrcsv";

export const getOrCreateUser = mutation({
  args: {
    externalId: v.string(),
    displayName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // 既存ユーザーを検索
    const existing = await ctx.db
      .query("ocrcsv_users")
      .withIndex("by_app_and_external", (q) =>
        q.eq("appId", APP_ID).eq("externalId", args.externalId)
      )
      .first();

    if (existing) {
      return { userId: existing._id };
    }

    // 新規ユーザー作成
    const userId = await ctx.db.insert("ocrcsv_users", {
      appId: APP_ID,
      externalId: args.externalId,
      displayName: args.displayName,
      email: args.email,
      createdAt: Date.now(),
    });

    return { userId };
  },
});

export const getUserByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ocrcsv_users")
      .withIndex("by_app_and_external", (q) =>
        q.eq("appId", APP_ID).eq("externalId", args.externalId)
      )
      .first();
  },
});
```

**検証**:
- [ ] ファイルが作成されている
- [ ] TypeScriptエラーがない

---

### タスク2-2: convex/ocrcsvCategories.ts を作成 ⏳
**内容**:
- カテゴリ管理API
- `create`, `getByUser`, `update`, `remove` 関数

**ファイル**: `convex/ocrcsvCategories.ts`

**実装内容**:
```typescript
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
```

**検証**:
- [ ] ファイルが作成されている
- [ ] TypeScriptエラーがない

---

### タスク2-3: convex/ocrcsvImages.ts を作成 ⏳
**内容**:
- 画像・OCR結果管理API
- `create`, `getByCategoryId`, `remove`, `generateUploadUrl` 関数

**ファイル**: `convex/ocrcsvImages.ts`

**実装内容**:
```typescript
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
```

**検証**:
- [ ] ファイルが作成されている
- [ ] TypeScriptエラーがない

---

## フェーズ3: UI実装

### タスク3-1: src/pages/OCRDashboardPage.tsx を作成 ⏳
**内容**:
- カテゴリ一覧画面
- カテゴリの作成・編集・削除機能

**ファイル**: `src/pages/OCRDashboardPage.tsx`

**参考**: `src/pages/DashboardPage.tsx` をベースに、API呼び出しを `ocrcsvCategories` に変更

**検証**:
- [ ] ファイルが作成されている
- [ ] カテゴリ一覧が表示される
- [ ] カテゴリ作成ができる

---

### タスク3-2: src/components/ImageUploadZone.tsx を作成 ⏳
**内容**:
- ドラッグ&ドロップエリア
- クリックでファイル選択
- ローディング表示

**ファイル**: `src/components/ImageUploadZone.tsx`

**実装内容**:
```typescript
import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onUpload, loading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        await onUpload(file);
      } else {
        alert('JPEG または PNG 形式の画像のみアップロード可能です');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
      } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Upload size={48} className="mx-auto mb-4 text-gray-400" />
      {loading ? (
        <p className="text-gray-600">OCR処理中...</p>
      ) : (
        <>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            画像をドラッグ&ドロップ
          </p>
          <p className="text-sm text-gray-500">または、クリックして選択</p>
          <p className="text-xs text-gray-400 mt-2">JPEG, PNG対応</p>
        </>
      )}
    </div>
  );
};
```

**検証**:
- [ ] ファイルが作成されている
- [ ] ドラッグ&ドロップが機能する
- [ ] クリックでファイル選択が機能する

---

### タスク3-3: src/components/OCRResultCard.tsx を作成 ⏳
**内容**:
- OCR結果をカード形式で表示
- 画像サムネイル、テキスト、コピー・削除ボタン

**ファイル**: `src/components/OCRResultCard.tsx`

**実装内容**:
```typescript
import React from 'react';
import { Copy, Trash2 } from 'lucide-react';

interface OCRResultCardProps {
  image: {
    _id: string;
    fileName: string;
    imageUrl: string | null;
    ocrResult: string;
    createdAt: number;
  };
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

export const OCRResultCard: React.FC<OCRResultCardProps> = ({ image, onDelete, onCopy }) => {
  return (
    <div className="bg-white rounded-lg shadow border p-4">
      {image.imageUrl && (
        <img
          src={image.imageUrl}
          alt={image.fileName}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}
      <div className="mb-3">
        <p className="text-sm text-gray-500 mb-1">{image.fileName}</p>
        <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{image.ocrResult}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onCopy(image.ocrResult)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          <Copy size={14} />
          コピー
        </button>
        <button
          onClick={() => onDelete(image._id)}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
```

**検証**:
- [ ] ファイルが作成されている
- [ ] 画像が表示される
- [ ] OCR結果が表示される
- [ ] コピーボタンが機能する

---

### タスク3-4: src/pages/OCRCategoryPage.tsx を作成 ⏳
**内容**:
- 画像アップロードと OCR 処理
- OCR結果一覧表示

**ファイル**: `src/pages/OCRCategoryPage.tsx`

**実装内容**: （長いため概要のみ）
- `ImageUploadZone` コンポーネントを使用
- 画像選択時に以下の処理:
  1. FileReader で Base64 エンコード
  2. OCR API (`https://ait.tacarz.workers.dev/image`) に送信
  3. `generateUploadUrl` でアップロードURLを取得
  4. Convex Storage に画像をアップロード
  5. `ocrcsvImages.create` でDBに保存
- `OCRResultCard` コンポーネントで結果一覧を表示

**検証**:
- [ ] ファイルが作成されている
- [ ] 画像アップロードが機能する
- [ ] OCR処理が正常に完了する
- [ ] 結果が一覧表示される

---

### タスク3-5: src/contexts/AuthContext.tsx を更新 ⏳
**内容**:
- `ocrcsvUsers` APIを使用するように変更
- 既存のprompt_users APIはそのまま保持

**ファイル**: `src/contexts/AuthContext.tsx`

**変更内容**:
- AuthContextを複製して `OCRAuthContext` を作成
- または、既存のAuthContextに `useOCRAuth` を追加

**検証**:
- [ ] OCR用の認証が機能する
- [ ] 既存のprompt認証も機能する

---

## フェーズ4: ルーティング更新

### タスク4-1: src/App.tsx にOCR用ルートを追加 ⏳
**内容**:
- OCR用のルートを追加
- 既存のルートは削除しない

**ファイル**: `src/App.tsx`

**追加内容**:
```typescript
// 既存のルートに追加
{
  path: "/ocr",
  element: <PrivateRoute />,
  children: [
    {
      index: true,
      element: <OCRDashboardPage />
    },
    {
      path: "category/:categoryId",
      element: <OCRCategoryPage />
    }
  ]
}
```

または、ルートパス `/` を OCR に変更する場合は、既存のルートを `/prompt` などに移動。

**検証**:
- [ ] OCR用のルートが追加されている
- [ ] 既存のルートが削除されていない
- [ ] ルーティングが正常に動作する

---

## フェーズ5: テスト・ビルド

### タスク5-1: 動作確認 ⏳
**内容**:
- ローカル環境で動作確認
- 各機能が正常に動作することを確認

**確認項目**:
- [ ] ログインができる
- [ ] カテゴリの作成・編集・削除ができる
- [ ] 画像のアップロードができる
- [ ] OCR処理が正常に完了する
- [ ] OCR結果が表示される
- [ ] 画像の削除ができる

---

### タスク5-2: ビルドエラーチェック ⏳
**内容**:
- `npm run build` を実行してビルドエラーがないか確認

**実行コマンド**:
```bash
npm run build
```

**検証**:
- [ ] ビルドが成功する
- [ ] TypeScriptエラーがない
- [ ] ESLintエラーがない

---

## 最終確認

### データ保護確認 ⏳
**内容**:
- 既存データが削除されていないことを確認

**確認項目**:
- [ ] `kaumono_*` テーブルが存在する
- [ ] `prompt_*` テーブルが存在する
- [ ] 既存データが消えていない

---

## 備考

### 実装順序の注意
1. 必ずフェーズ順に進める
2. 各タスク完了後に動作確認
3. エラーが出たら次に進まない
4. 一度に複数のタスクを同時に行わない

### エラー発生時
- エラーメッセージを確認
- 該当箇所を修正
- 再度動作確認
- 次のタスクに進む

### 完了条件
- すべてのタスクが ✅ になっていること
- `npm run build` が成功すること
- 既存データが保護されていること
