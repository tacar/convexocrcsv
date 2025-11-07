# 要件定義書

## 1. 目的
- 画像をアップロードし、OCR処理を行って内容をCSV形式で保存・管理できるアプリを実装する
- 既存のプロンプトメモアプリの構成を維持しながら、OCR機能を追加する

## 2. 現状把握

### 現在の実装状態
- **技術スタック**: Vite, React, TypeScript, TailwindCSS, React Router
- **DB**: Convex (現在: brazen-anteater-770)
- **認証**: Firebase Authentication (現在: prompt-50cab)
- **デプロイ先**: Cloudflare Workers (予定: ocrcsv)

### 既存のテーブル
- `kaumono_*` (買い物アプリ用)
- `prompt_*` (プロンプトメモアプリ用)

## 3. 要求仕様

### 3.1 アプリ名
- **ocrcsv**

### 3.2 必須機能
1. **Googleログイン**
   - Firebase Authentication使用

2. **カテゴリ管理**
   - カテゴリの作成・削除
   - ログイン後にカテゴリを作成可能

3. **画像アップロード機能**
   - ドラッグ&ドロップ
   - クリックでファイル選択
   - 画像形式: JPEG, PNG

4. **OCR処理**
   - API: `https://ait.tacarz.workers.dev/image`
   - リクエスト形式:
     ```json
     {
       "image": "<base64_encoded_image>",
       "mimeType": "image/jpeg"
     }
     ```

5. **データ保存**
   - OCR結果をConvexのテーブルに保存
   - カテゴリ別に管理

### 3.3 データベース設計

#### テーブル命名規則
- すべてのテーブルに `ocrcsv_` プレフィックスを付ける
- 各テーブルに `appId` フィールドを追加

#### 必要なテーブル
1. **ocrcsv_users**
   - appId, externalId, displayName, email, name, createdAt, updatedAt

2. **ocrcsv_categories**
   - appId, name, ownerId, memberIds, createdAt, updatedAt

3. **ocrcsv_images**（新規）
   - appId, categoryId, fileName, imageUrl, ocrResult, mimeType, createdBy, createdAt, updatedAt

### 3.4 設定情報

#### Firebase設定（CLAUDE.mdより）
```
apiKey: "AIzaSyBHgeWGvXFROnJ13iPji1BDM3RcJz9SnAA"
authDomain: "ocrcsv-bec19.firebaseapp.com"
projectId: "ocrcsv-bec19"
storageBucket: "ocrcsv-bec19.firebasestorage.app"
messagingSenderId: "42194999993"
appId: "1:42194999993:web:db78ab11ec491eda8a5968"
measurementId: "G-QKGEEKK253"
```

#### Convex設定（CLAUDE.mdより）
```
Project Name: ocrcsv
Project Slug: ocrcsv
Production Deploy Key: prod:hidden-seal-783|eyJ2MiI6Ijk4ZTllMTk4YWYzNjRjOTNiYTU3NGE2OTcyZDRkNTNhIn0=
Production URL: https://hidden-seal-783.convex.site
```

#### 承認済みドメイン
- tacarz.workers.dev
- mylastwork.net

### 3.5 デプロイ先
- Cloudflare Workers: ocrcsv
- URL: https://ocrcsv.tacarz.workers.dev (予想)
- または: https://conocrcsv.mylastwork.net/

## 4. 成功基準

### 4.1 機能要件
- [x] ログイン機能が動作する
- [ ] カテゴリの作成・削除ができる
- [ ] 画像をドラッグ&ドロップでアップロードできる
- [ ] 画像をクリックでアップロードできる
- [ ] OCR APIが呼び出され、結果が取得できる
- [ ] OCR結果がConvexに保存される
- [ ] カテゴリ別にOCR結果を表示できる

### 4.2 技術要件
- [ ] Firebase設定が更新されている
- [ ] Convex設定が更新されている
- [ ] ocrcsv_* テーブルが作成されている
- [ ] ビルドエラーがない
- [ ] `npm run build` が成功する

### 4.3 データ保護
- [ ] 既存データ（kaumono_*, prompt_*）は削除しない
- [ ] 既存テーブルは変更しない
- [ ] 追加のみで構成する

## 5. 制約条件

### 5.1 開発ルール
- **指示以外の場所は変更しない**
- **勝手に変更するな**
- **段階的に進める**（一度に全てを変更しない）
- **エラーは解決してから次へ進む**
- **指示にない機能を勝手に追加しない**

### 5.2 データ保護
- 既存のテーブル（kaumono_*, prompt_*）は削除・変更しない
- 追加で作成のみ

## 6. 備考
- React Routerを使用
- 日本語で返答すること
