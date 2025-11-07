必ず日本語で返答、
指示以外の場所は変更しない。

日本語で返答
画面は指示に従って作成すること

よく読め、勝手に変更するな
Vite
Reect
TypeScript
TailwindCSS
を使って
基本機能を作って
buildエラーをチェックすること

チェックリスト

Firebase
API Web DB側
データ形式
convexの設定
.env
全ての設定ファイル
テーブルの頭につける文字

Firebaseのコンソールで次をチェック
Authentication
設定
承認済みドメイン
tacarz.workers.dev
mylastwork.net


仕様
現在の構成のまま

ログイン後
カテゴリを作成

画像を読み込み
ドラッグまたはクリックでアップロード
内容をtableに保存

利用するAPIは次の通り

curl -s "https://ait.tacarz.workers.dev/image" \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64_encoded_image>", "mimeType":
"image/jpeg"}'


データ、tableは以前のものを残す。
変更削除はしない。追加で作成

googleログイン
設定は.env

デプロイ先
cloudflare workers
ocrcsv

DB
convex
project名ocrcsv

convexの設定
npx convex dev
https://conocrcsv.mylastwork.net/

react routerを使え

今回のアプリはocrcsv
テーブル名の前にocrcsv_を作る

各テーブルにappidをつける

DATA_SCHEMA.md
title 説明
content プロンプト内容

本番で共有したいので
cloudflare workers
ocrcsv


Firebase許可ドメイン
tacarz.workers.dev
mylastwork.net


Firebaseの設定

  apiKey: "AIzaSyBHgeWGvXFROnJ13iPji1BDM3RcJz9SnAA",
authDomain: "ocrcsv-bec19.firebaseapp.com",
projectId: "ocrcsv-bec19",
storageBucket: "ocrcsv-bec19.firebasestorage.app",
messagingSenderId: "42194999993",
appId: "1:42194999993:web:db78ab11ec491eda8a5968",
measurementId: "G-QKGEEKK253"


convexの設定

convex
Project Name
ocrcsv
Project Slug
ocrcsv

Production Deploy Keys

prod:hidden-seal-783|eyJ2MiI6Ijk4ZTllMTk4YWYzNjRjOTNiYTU3NGE2OTcyZDRkNTNhIn0=

production 

https://hidden-seal-783.convex.site
https://hidden-seal-783.convex.cloud






1. convex/backup.ts -
Convexバックアップクエリ関数
2. scripts/backup-convex.mjs -
バックアップ実行スクリプト

今後のバックアップ方法




## タスク実行の4段階フロー

### 1. 要件定義
- `.claude_workflow/complete.md`が存在すれば参照
- 目的の明確化、現状把握、成功基準の設定
- `.claude_workflow/requirements.md`に文書化
- **必須確認**: 「要件定義フェーズが完了しました。設計フェーズに進んでよろしいですか？」

### 2. 設計
- **必ず`.claude_workflow/requirements.md`を読み込んでから開始**
- アプローチ検討、実施手順決定、問題点の特定
- `.claude_workflow/design.md`に文書化
- **必須確認**: 「設計フェーズが完了しました。タスク化フェーズに進んでよろしいですか？」

### 3. タスク化
- **必ず`.claude_workflow/design.md`を読み込んでから開始**
- タスクを実行可能な単位に分解、優先順位設定
- `.claude_workflow/tasks.md`に文書化
- **必須確認**: 「タスク化フェーズが完了しました。実行フェーズに進んでよろしいですか？」

### 4. 実行
- **必ず`.claude_workflow/tasks.md`を読み込んでから開始**
- タスクを順次実行、進捗を`.claude_workflow/tasks.md`に更新
- 各タスク完了時に報告

## 実行ルール
### ファイル操作
- 新規タスク開始時: 既存ファイルの**内容を全て削除して白紙から書き直す**
- ファイル編集前に必ず現在の内容を確認

### フェーズ管理
- 各段階開始時: 「前段階のmdファイルを読み込みました」と報告
- 各段階の最後に、期待通りの結果になっているか確認
- 要件定義なしにいきなり実装を始めない

### 実行方針
- 段階的に進める: 一度に全てを変更せず、小さな変更を積み重ねる
- 複数のタスクを同時並行で進めない
- エラーは解決してから次へ進む
- エラーを無視して次のステップに進まない
- 指示にない機能を勝手に追加しない
