# TODO共有アプリ API仕様書

## 概要
このドキュメントは、TODO共有アプリのConvex API仕様を定義します。
iOS/Android/Webクライアントから共通で使用できます。

## 接続情報

### Production環境

**2つの異なるエンドポイント**:

1. **標準Convex API** (query/mutation用):
   - **URL**: `https://brazen-anteater-770.convex.cloud`
   - **用途**: 通常のquery/mutation呼び出し
   - **例**: `promptCategories:getByUser`, `promptItems:create` など

2. **HTTP Router API** (カスタムHTTPエンドポイント用):
   - **URL**: `https://brazen-anteater-770.convex.site`
   - **用途**: convex/http.ts で定義されたカスタムエンドポイント
   - **例**: `/promptItems/uploadShared`, `/promptUsers/getOrCreateUser` など

### 認証
- Firebase Authentication を使用
- FirebaseのIDトークンを取得後、Convexのユーザーと紐付け

---

## データモデル

### prompt_users（ユーザー）
```typescript
{
  _id: Id<"prompt_users">,
  appId: "prompt",
  externalId?: string,        // FirebaseのUID
  displayName?: string,       // 表示名
  email: string,              // メールアドレス
  name?: string,
  createdAt?: number,
  updatedAt?: number
}
```

### prompt_categories（カテゴリ/TODOリスト）
```typescript
{
  _id: Id<"prompt_categories">,
  appId: "prompt",
  name: string,                              // カテゴリ名
  ownerId: Id<"prompt_users">,              // オーナーのユーザーID
  memberIds: Id<"prompt_users">[],          // メンバーのユーザーIDリスト
  joinTokenHash?: string,                   // 招待トークンのハッシュ
  joinTokenExpiresAt?: number,              // 招待トークンの有効期限
  createdAt: number,
  updatedAt?: number
}
```

### prompt_items（TODOアイテム）
```typescript
{
  _id: Id<"prompt_items">,
  appId: "prompt",
  categoryId: Id<"prompt_categories">,     // 所属するカテゴリID
  title: string,                            // TODOのタイトル
  content?: string,                         // 詳細（現在未使用）
  done?: boolean,                           // 完了状態
  isShared?: boolean,                       // 共有状態（みんなに公開）
  usageCount?: number,                      // 使用回数（現在未使用）
  imageUrls?: string[],                     // 画像URL配列（現在未使用）
  createdBy: Id<"prompt_users">,           // 作成者のユーザーID
  createdAt: number,                        // 作成日時（UnixTime）
  updatedAt?: number,                       // 更新日時（UnixTime）
  sortOrder?: number                        // ソート順
}
```

---

## API エンドポイント

### 1. ユーザー管理（promptUsers）

#### 1.1 ユーザーの取得または作成
```typescript
// Mutation: promptUsers.getOrCreate
args: {
  externalId: string,      // FirebaseのUID
  email: string,
  displayName?: string
}
returns: Id<"prompt_users">
```

**説明**: Firebaseで認証したユーザーをConvexに登録または既存ユーザーを取得

**エラー**:
- メールアドレスが不正な場合: Error("Invalid email")

---

### 2. カテゴリ管理（promptCategories）

#### 2.1 ユーザーのカテゴリ一覧取得
```typescript
// Query: promptCategories.getByUser
args: {
  userId: Id<"prompt_users">
}
returns: Array<{
  _id: Id<"prompt_categories">,
  appId: string,
  name: string,
  ownerId: Id<"prompt_users">,
  memberIds: Id<"prompt_users">[],
  createdAt: number,
  updatedAt?: number
}>
```

**説明**: ユーザーがオーナーまたはメンバーとして参加している全カテゴリを取得

#### 2.2 カテゴリとメンバー情報の取得
```typescript
// Query: promptCategories.getCategoryWithMembers
args: {
  categoryId: Id<"prompt_categories">,
  userId: Id<"prompt_users">
}
returns: {
  _id: Id<"prompt_categories">,
  appId: string,
  name: string,
  ownerId: Id<"prompt_users">,
  memberIds: Id<"prompt_users">[],
  createdAt: number,
  updatedAt?: number,
  members: Array<{
    _id: Id<"prompt_users">,
    displayName?: string,
    email: string
  }>
}
```

**説明**: カテゴリ情報とそのメンバーの詳細情報を取得

**エラー**:
- 権限なし: Error("権限がありません")

#### 2.3 カテゴリの作成
```typescript
// Mutation: promptCategories.create
args: {
  name: string,
  userId: Id<"prompt_users">
}
returns: Id<"prompt_categories">
```

**説明**: 新しいカテゴリを作成。作成者がオーナーかつ最初のメンバーになる

#### 2.4 カテゴリ名の更新
```typescript
// Mutation: promptCategories.update
args: {
  id: Id<"prompt_categories">,
  name: string,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: カテゴリ名を変更

**エラー**:
- 権限なし（メンバーでない）: Error("権限がありません")

#### 2.5 カテゴリの削除
```typescript
// Mutation: promptCategories.remove
args: {
  id: Id<"prompt_categories">,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: カテゴリとそのカテゴリに属する全TODOアイテムを削除

**エラー**:
- 権限なし（オーナーでない）: Error("オーナーのみが削除できます")

#### 2.6 招待トークンの生成
```typescript
// Mutation: promptCategories.generateInviteToken
args: {
  categoryId: Id<"prompt_categories">,
  userId: Id<"prompt_users">
}
returns: string  // 招待トークン（8文字）
```

**説明**: カテゴリへの招待リンク用トークンを生成（7日間有効）

**エラー**:
- 権限なし: Error("権限がありません")

#### 2.7 招待トークンで参加
```typescript
// Mutation: promptCategories.joinByToken
args: {
  token: string,
  userId: Id<"prompt_users">
}
returns: Id<"prompt_categories">
```

**説明**: 招待トークンを使ってカテゴリに参加

**エラー**:
- トークンが無効: Error("招待リンクが無効です")
- トークンが期限切れ: Error("招待リンクの有効期限が切れています")

#### 2.8 メンバーを削除（オーナー機能）
```typescript
// Mutation: promptCategories.removeMember
args: {
  categoryId: Id<"prompt_categories">,
  memberUserId: Id<"prompt_users">,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: カテゴリからメンバーを削除（オーナーのみ実行可能）

**エラー**:
- 権限なし: Error("オーナーのみが削除できます")
- オーナー自身を削除しようとした: Error("オーナーは削除できません")

#### 2.9 カテゴリから退出
```typescript
// Mutation: promptCategories.leaveCategory
args: {
  categoryId: Id<"prompt_categories">,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: カテゴリから退出（オーナーは退出不可）

**エラー**:
- オーナーが退出しようとした: Error("オーナーは退出できません")

---

### 3. TODOアイテム管理（promptItems）

#### 3.1 カテゴリのTODO一覧取得
```typescript
// Query: promptItems.getByCategory
args: {
  categoryId: Id<"prompt_categories">,
  userId: Id<"prompt_users">
}
returns: Array<{
  _id: Id<"prompt_items">,
  appId: string,
  categoryId: Id<"prompt_categories">,
  title: string,
  content?: string,
  done?: boolean,
  isShared?: boolean,
  usageCount?: number,
  imageUrls?: string[],
  createdBy: Id<"prompt_users">,
  createdAt: number,
  updatedAt?: number,
  sortOrder?: number,
  createdByName: string  // 作成者の表示名
}>
```

**説明**: カテゴリに属するTODOアイテムを取得（sortOrder順にソート）

**エラー**:
- 権限なし: 空配列を返す

#### 3.2 ユーザーの全TODO取得
```typescript
// Query: promptItems.getByUser
args: {
  userId: Id<"prompt_users">
}
returns: Array<{
  // getByCategory と同じ構造
}>
```

**説明**: ユーザーが参加している全カテゴリのTODOを取得

#### 3.3 共有TODOの取得（みんなのリスト）
```typescript
// Query: promptItems.getSharedItems
args: {
  userId: Id<"prompt_users">
}
returns: Array<{
  _id: Id<"prompt_items">,
  appId: string,
  categoryId: Id<"prompt_categories">,
  title: string,
  content?: string,
  done?: boolean,
  isShared: boolean,
  usageCount?: number,
  imageUrls?: string[],
  createdBy: Id<"prompt_users">,
  createdAt: number,
  updatedAt?: number,
  sortOrder?: number,
  createdByName: string,     // 作成者の表示名
  categoryName: string        // カテゴリ名
}>
```

**説明**: isShared=trueのTODOを全て取得（新しい順）

#### 3.4 TODOの作成
```typescript
// Mutation: promptItems.create
args: {
  categoryId: Id<"prompt_categories">,
  title: string,
  content?: string,
  imageUrls?: string[],
  isShared?: boolean,
  userId: Id<"prompt_users">
}
returns: Id<"prompt_items">
```

**説明**: 新しいTODOアイテムを作成

**エラー**:
- 権限なし（カテゴリのメンバーでない）: Error("権限がありません")

#### 3.5 TODOの更新
```typescript
// Mutation: promptItems.update
args: {
  id: Id<"prompt_items">,
  title: string,
  content?: string,
  imageUrls?: string[],
  isShared?: boolean,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: TODOアイテムの内容を更新

**エラー**:
- アイテムが見つからない: Error("アイテムが見つかりません")
- 権限なし: Error("権限がありません")

#### 3.6 TODO完了状態の切り替え
```typescript
// Mutation: promptItems.toggleDone
args: {
  id: Id<"prompt_items">,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: TODOの完了/未完了を切り替え

**エラー**:
- アイテムが見つからない: Error("アイテムが見つかりません")
- 権限なし: Error("権限がありません")

#### 3.7 TODO共有状態の切り替え
```typescript
// Mutation: promptItems.toggleShared
args: {
  id: Id<"prompt_items">,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: TODOの共有/非共有を切り替え

**エラー**:
- アイテムが見つからない: Error("アイテムが見つかりません")
- 権限なし: Error("権限がありません")

#### 3.8 使用回数のインクリメント
```typescript
// Mutation: promptItems.incrementUsage
args: {
  id: Id<"prompt_items">,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: TODOの使用回数を1増やす（現在未使用）

**エラー**:
- アイテムが見つからない: Error("アイテムが見つかりません")
- 権限なし: Error("権限がありません")

#### 3.9 TODOの削除
```typescript
// Mutation: promptItems.remove
args: {
  id: Id<"prompt_items">,
  userId: Id<"prompt_users">
}
returns: void
```

**説明**: TODOアイテムを削除

**エラー**:
- アイテムが見つからない: Error("アイテムが見つかりません")
- 権限なし: Error("権限がありません")

---

## 共有TODOのアップロード（HTTP API）

### ⚠️ 重要: エンドポイントURL

**HTTP APIエンドポイント**は `.convex.site` ドメインを使用します：
```
✅ 正しい: https://brazen-anteater-770.convex.site/promptItems/uploadShared
❌ 間違い: https://brazen-anteater-770.convex.cloud/promptItems/uploadShared
```

### エンドポイント
```
POST https://brazen-anteater-770.convex.site/promptItems/uploadShared
```

### リクエスト
- **Content-Type**: `application/json`
- **Body**:
```typescript
{
  content: string,      // プロンプト（必須）
  title?: string,       // 説明（オプション、未指定の場合はcontentの最初の50文字）
  category?: string,    // カテゴリ名（オプション、未指定の場合は「共有TODO」カテゴリ）
  userId: string,       // ユーザーID
  userName: string      // ユーザー名
}
```

### レスポンス（成功）
```typescript
{
  convexId: string,     // 作成されたTODOのID
  categoryId: string,   // カテゴリID
  title: string,        // 実際に使用されたタイトル
  success: true
}
```

### エラーレスポンス
```typescript
// contentが空の場合（400）
{
  error: "プロンプトは必須です",
  message: "プロンプト（content）を入力してください",
  success: false
}

// その他のエラー（500）
{
  error: string,
  success: false
}
```

### 動作
1. **content（プロンプト）が必須**: 空の場合は400エラーを返す
2. **title（説明）はオプション**: 未指定の場合はcontentの最初の50文字を使用
3. **category はオプション**: 未指定の場合は「共有TODO」カテゴリを自動作成・使用
4. **isShared = true**: 常に共有状態で作成される

---

## 画像アップロード（Cloudflare R2）

### エンドポイント
```
POST https://prompt.tacarz.workers.dev/api/upload
```

### リクエスト
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image`: 画像ファイル（File）

### レスポンス
```typescript
{
  url: string,        // 画像のURL（https://prompt.tacarz.workers.dev/images/xxx.jpg）
  filename: string    // ファイル名
}
```

### エラーレスポンス
```typescript
{
  error: string,
  details?: string,
  name?: string
}
```

### 画像の取得
```
GET https://prompt.tacarz.workers.dev/images/{filename}
```

**説明**: アップロードした画像をWorker経由で取得

---

## 招待リンク処理

### Web招待リンク
```
https://conprompt.mylastwork.net/invite/{token}
```

または

```
https://prompt.tacarz.workers.dev/invite/{token}
```

### Universal Links（iOS）
```
kaumono://invite/{token}
```

**設定**: Apple App Site Association は `/.well-known/apple-app-site-association` で配信

---

## iOS実装の推奨フロー

### 1. 初期化
```swift
// 1. Firebase認証
let user = Auth.auth().currentUser
let idToken = try await user?.getIDToken()

// 2. Convex初期化
let convex = ConvexClient(deploymentUrl: "https://brazen-anteater-770.convex.cloud")

// 3. ユーザー登録/取得
let userId = try await convex.mutation(
    "promptUsers:getOrCreate",
    args: [
        "externalId": user?.uid,
        "email": user?.email,
        "displayName": user?.displayName
    ]
)
```

### 2. カテゴリ一覧の取得
```swift
let categories = try await convex.query(
    "promptCategories:getByUser",
    args: ["userId": userId]
)
```

### 3. TODO一覧の取得（リアルタイム購読）
```swift
convex.subscribe(
    query: "promptItems:getByCategory",
    args: ["categoryId": categoryId, "userId": userId]
) { (items: [TodoItem]) in
    // UIを更新
}
```

### 4. TODOの作成
```swift
try await convex.mutation(
    "promptItems:create",
    args: [
        "categoryId": categoryId,
        "title": "新しいTODO",
        "isShared": false,
        "userId": userId
    ]
)
```

### 5. TODO完了の切り替え
```swift
try await convex.mutation(
    "promptItems:toggleDone",
    args: [
        "id": itemId,
        "userId": userId
    ]
)
```

### 6. 共有TODOの取得
```swift
let sharedItems = try await convex.query(
    "promptItems:getSharedItems",
    args: ["userId": userId]
)
```

### 7. 招待リンクの生成
```swift
let token = try await convex.mutation(
    "promptCategories:generateInviteToken",
    args: [
        "categoryId": categoryId,
        "userId": userId
    ]
)
let inviteUrl = "https://conprompt.mylastwork.net/invite/\(token)"
```

### 8. 招待リンクからの参加
```swift
// Universal Linkから取得したtoken
let categoryId = try await convex.mutation(
    "promptCategories:joinByToken",
    args: [
        "token": token,
        "userId": userId
    ]
)
```

---

## エラーハンドリング

### 一般的なエラー
- `"権限がありません"`: ユーザーがそのリソースにアクセスする権限がない
- `"アイテムが見つかりません"`: 指定されたIDのリソースが存在しない
- `"オーナーのみが削除できます"`: オーナー専用の操作を非オーナーが実行しようとした

### 推奨するエラーハンドリング
```swift
do {
    try await convex.mutation(...)
} catch ConvexError.permissionDenied {
    // 権限エラー
} catch ConvexError.notFound {
    // リソースが見つからない
} catch {
    // その他のエラー
}
```

---

## リアルタイム更新

Convexは自動的にリアルタイム更新を提供します。
`subscribe()` を使用することで、データの変更を即座に受け取ることができます。

```swift
// カテゴリ一覧を監視
let subscription = convex.subscribe(
    query: "promptCategories:getByUser",
    args: ["userId": userId]
) { (categories: [Category]) in
    // カテゴリが追加/変更/削除された時に自動的に呼ばれる
    self.updateUI(categories)
}

// 購読解除
subscription.cancel()
```

---

## セキュリティ

### 権限チェック
すべてのmutation/queryは以下の権限チェックを実施：
- カテゴリ操作: `category.memberIds.includes(userId)`
- TODO操作: カテゴリのメンバーシップをチェック
- 削除操作: オーナーのみ実行可能

### 招待トークン
- 8文字のランダムな文字列
- SHA256でハッシュ化して保存
- 7日間の有効期限

---

## パフォーマンス最適化

### インデックス
以下のインデックスが設定済み：
- `prompt_categories.by_owner`: オーナーでの検索
- `prompt_categories.by_token`: トークンでの検索
- `prompt_items.by_category`: カテゴリでの検索
- `prompt_items.by_shared`: 共有アイテムの検索

### ページング
現在は全件取得。大量のデータがある場合は将来的にページングを実装予定。

---

## トラブルシューティング

### 404 エラー: "No matching routes found"

**症状**: `/promptItems/uploadShared` を呼び出すと404エラーが返される

**原因と解決方法**:

1. **❌ 間違ったドメインを使用している**
   ```swift
   // ❌ 間違い - .convex.cloud は標準Convex API用
   let url = "https://brazen-anteater-770.convex.cloud/promptItems/uploadShared"

   // ✅ 正しい - .convex.site はHTTPルーター用
   let url = "https://brazen-anteater-770.convex.site/promptItems/uploadShared"
   ```

2. **Convex APIの2つの異なるエンドポイント**:
   - **標準Convex API** (`.convex.cloud`):
     - Convexの query/mutation を呼び出す
     - パス形式: `/api/query`, `/api/mutation`
     - 関数名形式: `"moduleName:functionName"` (コロン形式)

   - **HTTP Router API** (`.convex.site`):
     - カスタムHTTPエンドポイント用
     - パス形式: `/path/to/endpoint` (convex/http.ts で定義)
     - 外部アプリ（iOS/Android）からの直接呼び出し用

3. **iOS実装例（正しい方法）**:
   ```swift
   struct ConvexService {
       // HTTP APIエンドポイント用
       private let httpBaseURL = "https://brazen-anteater-770.convex.site"

       // 標準Convex API用
       private let convexClient = ConvexClient(
           deploymentUrl: "https://brazen-anteater-770.convex.cloud"
       )

       // uploadShared は HTTPルーターを使用
       func uploadSharedItem(content: String, title: String?, userId: String, userName: String) async throws {
           let url = URL(string: "\(httpBaseURL)/promptItems/uploadShared")!
           var request = URLRequest(url: url)
           request.httpMethod = "POST"
           request.setValue("application/json", forHTTPHeaderField: "Content-Type")

           let body: [String: Any] = [
               "content": content,
               "title": title ?? "",
               "userId": userId,
               "userName": userName
           ]
           request.httpBody = try JSONSerialization.data(withJSONObject: body)

           let (data, response) = try await URLSession.shared.data(for: request)
           // レスポンス処理...
       }

       // 通常のquery/mutationは標準Convex APIを使用
       func getCategories(userId: String) async throws -> [Category] {
           return try await convexClient.query(
               "promptCategories:getByUser",
               args: ["userId": userId]
           )
       }
   }
   ```

### デバッグ方法

**URLをログ出力して確認**:
```swift
print("📍 使用中のURL: \(url.absoluteString)")
// 出力が https://brazen-anteater-770.convex.site/promptItems/uploadShared であることを確認
```

**curlでテスト**:
```bash
# ✅ 成功するはず
curl -X POST https://brazen-anteater-770.convex.site/promptItems/uploadShared \
  -H "Content-Type: application/json" \
  -d '{
    "content": "テストTODO",
    "userId": "test123",
    "userName": "テストユーザー"
  }'

# ❌ 404が返るはず
curl -X POST https://brazen-anteater-770.convex.cloud/promptItems/uploadShared \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## バージョン情報
- **API Version**: 1.0.0
- **最終更新日**: 2025-01-05
- **Convex Version**: 1.27.3
