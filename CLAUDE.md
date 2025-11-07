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

仕様

現在のアプリのまま
下記を読んでpromptに変更する。

データ、tableは以前のものを残す。
追加で作成

googleログイン

設定は.env

google

デプロイ先
cloudflare workers
prompt

DB
convex
project名app

convexの設定
npx convex dev
https://conprompt.mylastwork.net/

react routerを使え

convex
Project Name
app
Project Slug
app-d0e95

同じDBを利用

今回のアプリはprompt
prompt用のテーブルを作成
テーブル名の前にprompt_を作る

各テーブルにappidをつける
今回のアプリはprompt


todoは

prompt

DATA_SCHEMA.md
title 説明
content プロンプト内容

本番で共有したいので
cloudflare workers
prompt


Firebase許可ドメイン
tacarz.workers.dev
mylastwork.net


Firebaseの設定


  apiKey: "AIzaSyBJGI9dO5RXMVKNnJFziuDJc2bxzGu7QPA",
authDomain: "prompt-50cab.firebaseapp.com",
projectId: "prompt-50cab",
storageBucket: "prompt-50cab.firebasestorage.app",
messagingSenderId: "393087321775",
appId: "1:393087321775:web:3e6a733637d57edf4db65a",
measurementId: "G-9MZNXZ1PRX"


convexの設定

production 
prod:brazen-anteater-770|eyJ2MiI6ImVmNWFmZDdkNTg3YzRhYjlhMTQxMTYxOTU4MThjOThkIn0=
development
https://perceptive-avocet-282.convex.cloud
https://perceptive-avocet-282.convex.site

production 
https://brazen-anteater-770.convex.cloud
https://brazen-anteater-770.convex.site

development
https://perceptive-avocet-282.convex.cloud
https://perceptive-avocet-282.convex.site


Production
Development
切替え方法は？


Production
Development
同期させるには？



1. convex/backup.ts -
Convexバックアップクエリ関数
2. scripts/backup-convex.mjs -
バックアップ実行スクリプト

今後のバックアップ方法

次回バックアップを取得する際は、以下のコマ
ンドを実行してください：

node scripts/backup-convex.mjs
https://brazen-anteater-770.convex.cloud






API経由だとリアルタイムでどうきされない
iOSでもconvexを使うべきだな


1. Convexのhttp.tsを無効化
  - カスタムHTTP APIルート（/api/v1/*）を削除
  - Convex標準のFunctions API（/api/query,
/api/mutation）を有効化
2. TodoAPIManagerを元に戻し
  - ConvexClient経由で標準Functions APIを使用
  - パス形式: "module:function" （コロン形式）
3. Convexデプロイ完了
  - https://brazen-anteater-770.convex.cloud
に変更が反映



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
