import { ConvexHttpClient } from "convex/browser";

const convexUrl = "https://brazen-anteater-770.convex.cloud";
const client = new ConvexHttpClient(convexUrl);

async function main() {
  console.log("=== 共有プロンプトの確認 ===");
  console.log("Convex URL:", convexUrl);

  try {
    // テスト用のダミーユーザーIDを使用（実際のユーザーでなくてもgetSharedItemsは動作する）
    const testUserId = "k17f6nme4kdsjk6jyd0awdjh057txpfe"; // ReiのユーザーID

    console.log("\n共有プロンプトを取得中...");
    const sharedItems = await client.query("promptItems:getSharedItems", { userId: testUserId });

    console.log(`\n✅ ${sharedItems.length}件の共有プロンプトが見つかりました\n`);

    // Reiが投稿したプロンプトのみをフィルタ
    const reiPrompts = sharedItems.filter(item => item.createdByName === "Rei");
    console.log(`📝 Reiが投稿したプロンプト: ${reiPrompts.length}件\n`);

    reiPrompts.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   内容: ${item.content}`);
      console.log(`   投稿者: ${item.createdByName}`);
      console.log(`   カテゴリ: ${item.categoryName}`);
      console.log(`   投稿日時: ${new Date(item.createdAt).toLocaleString("ja-JP")}`);
      console.log("");
    });

    console.log("=== 確認完了！ ===");
    console.log("これらのプロンプトは「みんなのリスト」で表示されます");

  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
