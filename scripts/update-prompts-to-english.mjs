import { ConvexHttpClient } from "convex/browser";

const convexUrl = "https://brazen-anteater-770.convex.cloud";
const client = new ConvexHttpClient(convexUrl);

// 管理者のFirebase UID（tacarz@gmail.comのUID）
// 注意: 実際のUIDを使用する必要があります
const ADMIN_UID = "YOUR_FIREBASE_UID_HERE";

// 英語版のプロンプト（タイトルマッピング）
const englishPrompts = {
  "夕暮れの未来都市": {
    title: "Sunset Future City",
    content: "A futuristic city with skyscrapers dyed in orange and pink gradient sunset colors. Building surfaces are covered with hologram displays, and neon signs are shining brightly. Transparent tube-shaped highways are layered multiple times in the air, and streamlined flying cars are crossing while leaving trails of light. Steam rises between the buildings, creating a cyberpunk atmosphere. On the ground, rain-wet streets shine in rainbow colors, and silhouettes of people walking on the sidewalk emerge in backlight. 8K ultra-high quality, ray tracing, cinematic lighting, detailed depiction, drawn with a magnificent composition like a sci-fi movie."
  },
  "魔法の図書館": {
    title: "Magic Library",
    content: "The interior of a fantastic magic library surrounded by huge bookshelves that extend endlessly to the ceiling. Old leather-bound grimoires float in the air, and pages turn automatically. Golden and purple magic light particles dance in the air, illuminating between the bookshelves. Spiral staircases overlap many times, and moonlight shines through arched windows. A huge crystal sphere floats in the center, with constellation-like light patterns rotating around it. A fireplace fire emits warm light, and quill pens and ink bottles are placed on wooden reading desks. Fantastic and mysterious atmosphere, soft lighting, Gothic architecture style, detailed decoration, composition with depth like a movie."
  },
  "桜と和風建築": {
    title: "Cherry Blossoms and Japanese Architecture",
    content: "A beautiful scenery of an old Japanese temple surrounded by cherry blossom trees in full bloom. In the early morning of a quiet spring with morning mist, soft morning sun illuminates the cherry blossom petals in peach and pink colors. The traditional wooden temple consists of vermillion pillars, white walls, and tiled roofs, with exquisite carvings. The stone-paved approach is covered with fallen cherry blossom petals, and stone lanterns stand quietly. The well-maintained Japanese garden has green moss and a flowing stream, with a wooden bridge crossing it. Mountains shrouded in haze can be seen in the distance. Traditional Japanese beauty, aesthetics of wabi-sabi, soft touch like watercolor painting, calm spring atmosphere, perfect composition using golden ratio, ultra-high definition depiction."
  },
  "宇宙ステーション内部": {
    title: "Space Station Interior",
    content: "The command room inside a cutting-edge technology space station floating in vast outer space. Futuristic hologram displays arranged on the entire wall show Earth's orbit data, star maps, and system status. Blue and white cold LED lighting illuminates the facility, with a futuristic interior composed of metal and glass. Astronauts are working in white and orange space suits. Through a huge circular window, the beautiful blue Earth can be seen, with sunlight shining beyond it. In zero-gravity space, small objects float, and touch-panel control panels float in the air. Realistic sci-fi, hard science fiction, movie-quality lighting, 8K resolution, magnificent view with wide-angle lens, realism like NASA photos."
  },
  "水彩画風の自然": {
    title: "Watercolor Nature",
    content: "A fantastic natural landscape of a clear stream flowing through a quiet forest and moss-covered rocks, with dappled sunlight shining through. The clear stream's water surface reflects the green of trees, and the water flow is drawn softly. Forest trees are expressed in various shades of green, and morning light shining through the gaps in leaves diffuses softly in the air like mist. Wild flowers bloom by the riverside, and butterflies dance gracefully. The rock surface is covered with vivid green moss, and fern plants are drawn delicately. The whole is expressed with watercolor touch, soft boundaries where colors blend and blur, gentle pastel color tones, calm atmosphere that makes you feel healing and peace, warm illustration style like a picture book."
  },
  "スチームパンクカフェ": {
    title: "Steampunk Cafe",
    content: "The interior of a retro-futuristic steampunk cafe that fuses 19th-century Victorian architectural style with steam engine technology. Huge brass gears rotate on the wall, copper pipes crawl on the ceiling, and occasionally spout steam. Antique wooden furniture, leather sofas, and warm orange gas lamp-like lighting envelop the space. The counter has a steam engine device imitating an espresso machine, with complex mechanisms moving in visible form. Old clocks, telescopes, and mechanical instruments are decorated on the walls. Through the window, a foggy cityscape can be seen, with airships flying in the sky. Detailed decoration, antique color tone, soft warm-colored lighting, precise details that make you feel craftsmanship."
  },
  "海底都市": {
    title: "Underwater City",
    content: "A future underwater city covered by a huge transparent dome shining in the darkness of the deep sea. Inside the dome, high-rise buildings and houses stand, and artificial sunlight illuminates the city brightly. Outside the dome, schools of colorful tropical fish swim, and huge manta rays and whales pass gracefully. Transparent tube-shaped tunnels connecting the underwater city and the outside world have submersibles coming and going. At the base of the city, glowing coral reefs grow, and bioluminescent organisms emit fantastic blue and green light. Bubbles float up in the sea, and seaweed sways. Mysterious deep-sea atmosphere, blue and green gradation, contrast of light and shadow, sci-fi yet coexisting with beautiful marine life, 8K ultra-high resolution."
  },
  "秋の田舎道": {
    title: "Autumn Country Road",
    content: "A Japanese rural landscape with golden rice ears spread across the entire area during harvest season. Warm orange evening sun shining diagonally at dusk illuminates the rice ears, shining like a golden sea. Red spider lilies bloom along the field ridges, and in the distance, an old thatched-roof house and persimmon trees can be seen. Autumn clouds hang in the sky, and flocks of migratory birds fly in V-formation. In the foreground, an old wooden scarecrow stands, with dragonflies flying around it. Mountains range can be seen in silhouette in the distance. Nostalgic and familiar atmosphere, Japanese original landscape, realistic depiction, beautiful warm-colored gradation, moving composition like a movie, high-definition 4K quality."
  },
  "ドラゴンと騎士": {
    title: "Dragon and Knight",
    content: "An epic battle scene where a huge red dragon and a knight in silver armor confront each other against the backdrop of a medieval European castle. The dragon spreads its wings wide and breathes fire from its mouth, with the heat wave distorting the air. The scales covering its entire body are drawn in detail one by one, and horns and fangs shine sharply. The knight holds up a shield with a coat of arms, reflecting the flames while brandishing a holy sword. The cloak flutters in the wind, and the armor has battle scars engraved. Rocks shatter around, and flame fragments fly. Dramatic lightning splits the sky, and dark clouds gather. Dynamic and powerful composition, dramatic lighting like a movie, high fantasy, epic (epic poetry) atmosphere, ultra-high definition texture, heroic and valiant narrative."
  },
  "雨の街角": {
    title: "Rainy Street Corner",
    content: "A fantastic street corner scenery at night in a big city, where colorful neon signs reflect on rain-wet streets shining in rainbow colors. People holding colorful umbrellas pass through the crowd, and their shadows are reflected on the rainy street. Building signs and neon lights reflect on raindrops, mixing red, blue, green, and yellow lights. Light rain illuminated by street lights shines like light particles in the air. Streetcar lights can be seen in the distance, and car tail lights draw light trails. Warm orange light leaks from store show windows. Cinematic composition like a movie scene, moody and urban atmosphere, contrast of light and shadow, texture of rain, neon colors, Blade Runner-style cyberpunk elements, 4K high quality."
  }
};

console.log("=== プロンプトを英語に更新するスクリプト ===");
console.log("\n⚠️  このスクリプトは手動実行が必要です");
console.log("管理画面（https://conprompt.mylastwork.net/admin）から各プロンプトを編集してください\n");
console.log("─────────────────────────────────────────\n");

let index = 1;
for (const [jpTitle, enVersion] of Object.entries(englishPrompts)) {
  console.log(`${index}. ${jpTitle} → ${enVersion.title}`);
  console.log(`   投稿者名: Rei`);
  console.log(`   タイトル: ${enVersion.title}`);
  console.log(`   内容:\n${enVersion.content}\n`);
  console.log("─────────────────────────────────────────\n");
  index++;
}

console.log("📝 管理画面での手順:");
console.log("1. https://conprompt.mylastwork.net/admin にアクセス");
console.log("2. 各プロンプトの編集ボタン（鉛筆アイコン）をクリック");
console.log("3. 上記の英語版をコピー&ペースト");
console.log("4. 「更新」ボタンをクリック");
