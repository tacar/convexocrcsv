import { ConvexHttpClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";

// 環境変数からConvex URLを取得
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.argv[2];

if (!CONVEX_URL) {
  console.error("エラー: CONVEX_URLが指定されていません");
  console.log("使い方: node backup-convex.mjs <CONVEX_URL>");
  console.log("または: VITE_CONVEX_URL環境変数を設定してください");
  process.exit(1);
}

async function backupData() {
  console.log(`Convex URLに接続中: ${CONVEX_URL}`);
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log("データをエクスポート中...");
    const data = await client.query("backup:exportAllData", {});

    // バックアップディレクトリを作成
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // タイムスタンプ付きのファイル名を生成
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const envName = CONVEX_URL.includes("brazen-anteater") ? "production" : "development";
    const filename = `convex-backup-${envName}-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // データをJSONファイルに保存
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log("\n=== バックアップ完了 ===");
    console.log(`環境: ${envName}`);
    console.log(`保存先: ${filepath}`);
    console.log(`\nデータ件数:`);
    console.log(`  - ユーザー: ${data.counts.users}件`);
    console.log(`  - カテゴリ: ${data.counts.categories}件`);
    console.log(`  - アイテム: ${data.counts.items}件`);
    console.log(`\nエクスポート日時: ${new Date(data.exportedAt).toLocaleString("ja-JP")}`);
  } catch (error) {
    console.error("エラー:", error.message);
    process.exit(1);
  }
}

backupData();
