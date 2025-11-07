# OCR CSV API仕様書

## 概要

OCR CSV アプリケーションのAPI仕様書です。画像アップロード、OCR処理、データ管理機能を提供します。

## ベースURL

- **本番環境**: `https://ocrcsv.tacarz.workers.dev`
- **Convex API**: `https://hidden-seal-783.convex.cloud`

## 認証

### Firebase Authentication

このアプリケーションはFirebase Authenticationを使用します。

**Firebase設定**
```json
{
  "apiKey": "AIzaSyBHgeWGvXFROnJ13iPji1BDM3RcJz9SnAA",
  "authDomain": "ocrcsv-bec19.firebaseapp.com",
  "projectId": "ocrcsv-bec19",
  "storageBucket": "ocrcsv-bec19.firebasestorage.app",
  "messagingSenderId": "42194999993",
  "appId": "1:42194999993:web:db78ab11ec491eda8a5968"
}
```

**認証方法**
- Googleログイン
- 匿名ログイン

認証トークンをConvex APIリクエストのヘッダーに含める必要があります。

---

## API エンドポイント

### 1. ユーザー管理

#### 1.1 ユーザーを取得または作成

**Convex関数**: `api.ocrcsvUsers.getOrCreateUser`

**パラメータ**:
```typescript
{
  externalId: string;      // Firebase UID
  email: string;           // メールアドレス
  displayName?: string;    // 表示名（オプション）
}
```

**レスポンス**:
```typescript
{
  _id: Id<"ocrcsv_users">;
  appId: string;           // "ocrcsv"
  externalId: string;      // Firebase UID
  email: string;
  displayName?: string;
  name?: string;
  createdAt: number;
  updatedAt?: number;
}
```

#### 1.2 ユーザーをIDで取得

**Convex関数**: `api.ocrcsvUsers.getUserByExternalId`

**パラメータ**:
```typescript
{
  externalId: string;      // Firebase UID
}
```

**レスポンス**: ユーザーオブジェクト（存在しない場合はnull）

---

### 2. カテゴリ管理

#### 2.1 カテゴリを作成

**Convex関数**: `api.ocrcsvCategories.create`

**パラメータ**:
```typescript
{
  name: string;            // カテゴリ名
  userId: Id<"ocrcsv_users">;  // ユーザーID
}
```

**レスポンス**: カテゴリID

#### 2.2 ユーザーのカテゴリ一覧を取得

**Convex関数**: `api.ocrcsvCategories.getByUser`

**パラメータ**:
```typescript
{
  userId: Id<"ocrcsv_users">;  // ユーザーID
}
```

**レスポンス**:
```typescript
Array<{
  _id: Id<"ocrcsv_categories">;
  appId: string;           // "ocrcsv"
  name: string;            // カテゴリ名
  ownerId: Id<"ocrcsv_users">;
  memberIds: Id<"ocrcsv_users">[];
  joinTokenHash?: string;
  joinTokenExpiresAt?: number;
  createdAt: number;
  updatedAt?: number;
}>
```

#### 2.3 カテゴリを更新

**Convex関数**: `api.ocrcsvCategories.update`

**パラメータ**:
```typescript
{
  id: Id<"ocrcsv_categories">;  // カテゴリID
  name: string;                  // 新しいカテゴリ名
  userId: Id<"ocrcsv_users">;   // ユーザーID（権限確認用）
}
```

**レスポンス**: なし

#### 2.4 カテゴリを削除

**Convex関数**: `api.ocrcsvCategories.remove`

**パラメータ**:
```typescript
{
  id: Id<"ocrcsv_categories">;  // カテゴリID
  userId: Id<"ocrcsv_users">;   // ユーザーID（権限確認用）
}
```

**レスポンス**: なし

**注意**: カテゴリを削除すると、関連する画像データも全て削除されます。

---

### 3. 画像・OCR管理

#### 3.1 画像をアップロード（Workers API）

**エンドポイント**: `POST /api/upload`

**リクエスト**:
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```
  image: File (画像ファイル)
  ```

**レスポンス**:
```json
{
  "url": "https://ocrcsv.tacarz.workers.dev/images/1234567890-abc123.jpg",
  "filename": "1234567890-abc123.jpg"
}
```

**エラーレスポンス**:
```json
{
  "error": "エラーメッセージ"
}
```

#### 3.2 画像を取得（Workers API）

**エンドポイント**: `GET /images/:filename`

**パラメータ**:
- `filename`: 画像ファイル名

**レスポンス**: 画像データ（バイナリ）

**ヘッダー**:
- `Content-Type`: 画像のMIMEタイプ（例: `image/jpeg`）
- `Cache-Control`: `public, max-age=31536000`

#### 3.3 OCRデータを保存

**Convex関数**: `api.ocrcsvImages.create`

**パラメータ**:
```typescript
{
  categoryId: Id<"ocrcsv_categories">;  // カテゴリID
  fileName: string;                      // ファイル名
  imageUrl: string;                      // R2の画像URL
  ocrResult: string;                     // OCR結果（生データ）
  mimeType: string;                      // MIMEタイプ
  userId: Id<"ocrcsv_users">;           // ユーザーID
  column1?: string;                      // 1列目（OCR結果の1行目）
  column2?: string;                      // 2列目
  column3?: string;                      // 3列目
  column4?: string;                      // 4列目
  column5?: string;                      // 5列目
  column6?: string;                      // 6列目
  column7?: string;                      // 7列目
  column8?: string;                      // 8列目
  column9?: string;                      // 9列目
  column10?: string;                     // 10列目
}
```

**レスポンス**: 画像ID

**注意**:
- OCR結果は改行で分割して最大10列に自動分割されます
- `column1`〜`column10`は、OCR結果を改行で分割した各行に対応します

#### 3.4 カテゴリの画像一覧を取得

**Convex関数**: `api.ocrcsvImages.getByCategoryId`

**パラメータ**:
```typescript
{
  categoryId: Id<"ocrcsv_categories">;  // カテゴリID
}
```

**レスポンス**:
```typescript
Array<{
  _id: Id<"ocrcsv_images">;
  appId: string;           // "ocrcsv"
  categoryId: Id<"ocrcsv_categories">;
  fileName: string;        // ファイル名
  imageUrl: string | null; // 画像URL
  ocrResult: string;       // OCR結果
  mimeType: string;        // MIMEタイプ
  createdBy: Id<"ocrcsv_users">;
  createdAt: number;
  updatedAt?: number;
  sortOrder?: number;
  column1?: string;        // CSV列1
  column2?: string;        // CSV列2
  column3?: string;        // CSV列3
  column4?: string;        // CSV列4
  column5?: string;        // CSV列5
  column6?: string;        // CSV列6
  column7?: string;        // CSV列7
  column8?: string;        // CSV列8
  column9?: string;        // CSV列9
  column10?: string;       // CSV列10
}>
```

画像は作成日時の降順で返されます。

#### 3.5 画像を削除

**Convex関数**: `api.ocrcsvImages.remove`

**パラメータ**:
```typescript
{
  id: Id<"ocrcsv_images">;      // 画像ID
  userId: Id<"ocrcsv_users">;   // ユーザーID（権限確認用）
}
```

**レスポンス**: なし

**エラー**: 権限がない場合は「権限がありません」エラー

---

### 4. OCR処理

#### 4.1 OCR API（外部サービス）

**エンドポイント**: `https://ait.tacarz.workers.dev/image`

**リクエスト**:
```bash
POST https://ait.tacarz.workers.dev/image
Content-Type: application/json

{
  "image": "<base64_encoded_image>",
  "mimeType": "image/jpeg"
}
```

**パラメータ**:
- `image`: Base64エンコードされた画像データ
- `mimeType`: 画像のMIMEタイプ（`image/jpeg`, `image/png`など）

**レスポンス**:
```json
{
  "text": "OCRで認識されたテキスト",
  "result": "OCRで認識されたテキスト"
}
```

または、詳細な結果：
```json
{
  "source": "gpt-4o-mini",
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "OCRで認識されたテキスト"
          }
        ]
      },
      "finishReason": "stop"
    }
  ]
}
```

---

## データフロー

### 画像アップロード〜OCR処理の流れ

1. **画像をBase64に変換**
   ```typescript
   const reader = new FileReader();
   reader.readAsDataURL(file);
   const base64 = result.split(',')[1]; // data:image/jpeg;base64, を除去
   ```

2. **OCR APIを呼び出し**
   ```typescript
   const response = await fetch('https://ait.tacarz.workers.dev/image', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       image: base64,
       mimeType: file.type
     })
   });
   const { text } = await response.json();
   ```

3. **画像をR2にアップロード**
   ```typescript
   const formData = new FormData();
   formData.append('image', file);

   const uploadResponse = await fetch('/api/upload', {
     method: 'POST',
     body: formData
   });
   const { url: imageUrl } = await uploadResponse.json();
   ```

4. **OCR結果を改行で分割**
   ```typescript
   const lines = ocrResult.split('\n').filter(line => line.trim() !== '');
   const columnData: Record<string, string | undefined> = {};
   for (let i = 0; i < 10; i++) {
     if (i < lines.length) {
       columnData[`column${i + 1}`] = lines[i].trim();
     }
   }
   ```

5. **Convexに保存**
   ```typescript
   await createImage({
     categoryId,
     fileName: file.name,
     imageUrl,
     ocrResult,
     mimeType: file.type,
     userId,
     ...columnData
   });
   ```

---

## CSVエクスポート

カテゴリ内の全画像データをCSV形式でエクスポートできます。

**CSVフォーマット**:
```csv
ファイル名,列1,列2,列3,列4,列5,列6,列7,列8,列9,列10
"image1.jpg","データ1","データ2","データ3",...
"image2.jpg","データ1","データ2","データ3",...
```

- BOM付きUTF-8でエクスポート（Excel対応）
- カンマ区切り、ダブルクォートでエスケープ

**実装例**:
```typescript
const headers = ['ファイル名', '列1', '列2', '列3', '列4', '列5', '列6', '列7', '列8', '列9', '列10'];
const rows = images.map(image => [
  image.fileName,
  image.column1 || '',
  image.column2 || '',
  // ... column10まで
]);
const csvContent = [
  headers.join(','),
  ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
].join('\n');
const bom = '\uFEFF';
const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
```

---

## エラーハンドリング

### Convexエラー

Convex関数は例外をスローします：

```typescript
try {
  await mutation(...);
} catch (error) {
  console.error(error.message);
  // "権限がありません" など
}
```

### Workers APIエラー

HTTPステータスコードとJSONエラーを返します：

**400 Bad Request**:
```json
{
  "error": "No image file provided"
}
```

**404 Not Found**:
```json
{
  "error": "Image not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Error message",
  "details": "Stack trace"
}
```

---

## セキュリティ

### 認証

- すべてのConvex関数はFirebase認証トークンが必要
- Workers APIは認証不要（public）だが、画像URLは推測困難

### 権限

- カテゴリの作成者のみが更新・削除可能
- 画像の作成者のみが削除可能

### CORS

すべてのAPIでCORSが有効化されています：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 制限事項

- 画像ファイルサイズ: 制限なし（推奨: 10MB以下）
- OCR結果の列数: 最大10列
- 対応画像形式: JPEG, PNG

---

## サンプルコード（iOS Swift）

### 1. Firebase認証

```swift
import FirebaseAuth

// Googleログイン
func signInWithGoogle() async throws {
    // Google Sign-In implementation
    let result = try await Auth.auth().signIn(with: credential)
    let user = result.user
    let idToken = try await user.getIDToken()
}

// 匿名ログイン
func signInAnonymously() async throws {
    let result = try await Auth.auth().signInAnonymously()
    let idToken = try await result.user.getIDToken()
}
```

### 2. Convex API呼び出し

```swift
import Foundation

struct ConvexClient {
    let baseURL = "https://hidden-seal-783.convex.cloud"

    func callMutation<T: Decodable>(
        _ functionName: String,
        args: [String: Any],
        idToken: String
    ) async throws -> T {
        let url = URL(string: "\(baseURL)/api/mutation")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(idToken)", forHTTPHeaderField: "Authorization")

        let body: [String: Any] = [
            "path": functionName,
            "args": [args]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(T.self, from: data)
    }

    func callQuery<T: Decodable>(
        _ functionName: String,
        args: [String: Any],
        idToken: String
    ) async throws -> T {
        let url = URL(string: "\(baseURL)/api/query")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(idToken)", forHTTPHeaderField: "Authorization")

        let body: [String: Any] = [
            "path": functionName,
            "args": [args]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### 3. 画像アップロード

```swift
func uploadImage(_ image: UIImage) async throws -> String {
    let url = URL(string: "https://ocrcsv.tacarz.workers.dev/api/upload")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"

    let boundary = UUID().uuidString
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"image\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
    body.append(image.jpegData(compressionQuality: 0.8)!)
    body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

    request.httpBody = body

    let (data, _) = try await URLSession.shared.data(for: request)
    let response = try JSONDecoder().decode(UploadResponse.self, from: data)
    return response.url
}

struct UploadResponse: Decodable {
    let url: String
    let filename: String
}
```

### 4. OCR処理

```swift
func performOCR(on image: UIImage) async throws -> String {
    let url = URL(string: "https://ait.tacarz.workers.dev/image")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let imageData = image.jpegData(compressionQuality: 0.8)!
    let base64 = imageData.base64EncodedString()

    let body: [String: Any] = [
        "image": base64,
        "mimeType": "image/jpeg"
    ]
    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, _) = try await URLSession.shared.data(for: request)
    let response = try JSONDecoder().decode(OCRResponse.self, from: data)
    return response.text
}

struct OCRResponse: Decodable {
    let text: String
}
```

### 5. 完全なフロー例

```swift
func uploadAndProcessImage(_ image: UIImage, categoryId: String, userId: String) async throws {
    // 1. OCR処理
    let ocrResult = try await performOCR(on: image)

    // 2. 画像をR2にアップロード
    let imageUrl = try await uploadImage(image)

    // 3. OCR結果を改行で分割
    let lines = ocrResult.components(separatedBy: "\n")
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }

    var args: [String: Any] = [
        "categoryId": categoryId,
        "fileName": "image_\(Date().timeIntervalSince1970).jpg",
        "imageUrl": imageUrl,
        "ocrResult": ocrResult,
        "mimeType": "image/jpeg",
        "userId": userId
    ]

    // 列データを追加
    for (index, line) in lines.prefix(10).enumerated() {
        args["column\(index + 1)"] = line
    }

    // 4. Convexに保存
    let idToken = try await Auth.auth().currentUser?.getIDToken() ?? ""
    let client = ConvexClient()
    let _: String = try await client.callMutation(
        "ocrcsvImages:create",
        args: args,
        idToken: idToken
    )
}
```

---

## 変更履歴

### 2025-11-07
- 初版作成
- R2画像ストレージ対応
- CSV出力用の10列フィールド追加
- iOS向けサンプルコード追加
