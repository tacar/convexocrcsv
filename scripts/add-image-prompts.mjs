import { ConvexHttpClient } from "convex/browser";

const convexUrl = "https://brazen-anteater-770.convex.cloud";
const client = new ConvexHttpClient(convexUrl);

// 画像生成プロンプト10個
const imagePrompts = [
  {
    title: "夕暮れの未来都市",
    content: "夕焼けに染まる高層ビル群、空飛ぶ車、ネオンサイン、サイバーパンクな雰囲気、詳細で鮮やかな色彩、8K高画質"
  },
  {
    title: "魔法の図書館",
    content: "天井まで届く本棚、浮遊する本、暖かい光、ファンタジックな雰囲気、魔法の輝き、神秘的"
  },
  {
    title: "桜と和風建築",
    content: "満開の桜、日本庭園、古い寺院、静かな春の朝、桃色の花びら、伝統的な日本建築"
  },
  {
    title: "宇宙ステーション内部",
    content: "未来的なコントロールパネル、宇宙飛行士、窓から見える地球、SF、リアルな照明、広い視野"
  },
  {
    title: "水彩画風の自然",
    content: "森の中の小川、柔らかい光、水彩画タッチ、癒しの雰囲気、パステルカラー、優しい印象"
  },
  {
    title: "スチームパンクカフェ",
    content: "歯車装飾、真鍮素材、ビクトリア朝風インテリア、暖かい照明、レトロフューチャー、細密な装飾"
  },
  {
    title: "海底都市",
    content: "ドーム状の建物、泳ぐ魚、青い光、幻想的な海底世界、バイオルミネセンス、神秘的な深海"
  },
  {
    title: "秋の田舎道",
    content: "黄金色の稲穂、田舎の風景、夕方の温かい光、穏やかな田園風景、ノスタルジックな雰囲気"
  },
  {
    title: "ドラゴンと騎士",
    content: "壮大な戦い、中世ヨーロッパ風、ファンタジー、ダイナミックな構図、炎のブレス、英雄的"
  },
  {
    title: "雨の街角",
    content: "ネオンの反射、傘をさす人々、都会的でムーディーな夜景、雨に濡れた路面、シネマティック"
  }
];

async function main() {
  console.log("=== 画像生成プロンプト投稿スクリプト ===");
  console.log("Convex URL:", convexUrl);

  try {
    // 1. ユーザー「Rei」を取得または作成
    console.log("\n1. ユーザー「Rei」を作成中...");
    const userResult = await client.mutation("promptUsers:getOrCreateUser", {
      externalId: "rei_script_user_001",
      displayName: "Rei",
      email: "rei@example.com"
    });

    console.log("ユーザー作成完了:", userResult);
    const userId = userResult.userId;

    // 2. カテゴリを取得または作成
    console.log("\n2. カテゴリ「画像生成プロンプト」を作成中...");
    const categories = await client.query("promptCategories:getByUser", { userId });

    let categoryId;
    const existingCategory = categories.find(cat => cat.name === "画像生成プロンプト");

    if (existingCategory) {
      categoryId = existingCategory._id;
      console.log("既存カテゴリを使用:", categoryId);
    } else {
      categoryId = await client.mutation("promptCategories:create", {
        name: "画像生成プロンプト",
        userId
      });
      console.log("新規カテゴリ作成:", categoryId);
    }

    // 3. プロンプト10個を投稿
    console.log("\n3. プロンプト10個を投稿中...");

    for (let i = 0; i < imagePrompts.length; i++) {
      const prompt = imagePrompts[i];
      console.log(`\n[${i + 1}/10] 投稿中: ${prompt.title}`);

      const itemId = await client.mutation("promptItems:create", {
        categoryId,
        title: prompt.title,
        content: prompt.content,
        isShared: true, // みんなのリストで表示
        userId
      });

      console.log(`✅ 投稿成功: ${itemId}`);
    }

    console.log("\n=== 全ての投稿が完了しました！ ===");
    console.log("「みんなのリスト」で確認できます");

  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
