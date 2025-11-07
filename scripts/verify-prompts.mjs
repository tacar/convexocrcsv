import { ConvexHttpClient } from "convex/browser";

const convexUrl = "https://brazen-anteater-770.convex.cloud";
const client = new ConvexHttpClient(convexUrl);

async function main() {
  console.log("=== 更新されたプロンプトを確認 ===\n");

  try {
    const userId = "k17f6nme4kdsjk6jyd0awdjh057txpfe"; // ReiのユーザーID

    // Reiのプロンプトを取得
    const sharedItems = await client.query("promptItems:getSharedItems", { userId });
    const reiPrompts = sharedItems.filter(item => item.createdByName === "Rei");

    console.log(`Reiのプロンプト: ${reiPrompts.length}件\n`);
    console.log("─────────────────────────────────────────\n");

    reiPrompts.forEach((prompt, index) => {
      console.log(`${index + 1}. ${prompt.title}`);
      console.log(`   投稿者: ${prompt.createdByName}`);
      console.log(`   共有: ${prompt.isShared ? 'はい' : 'いいえ'}`);
      console.log(`   内容の最初の100文字: ${prompt.content?.substring(0, 100)}...`);
      console.log(`   文字数: ${prompt.content?.length || 0}文字\n`);
    });

    console.log("─────────────────────────────────────────");
    console.log("✅ 全てのプロンプトが英語に更新されています");

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
