import { generateText } from '../services/api';

export const generateDetailedImagePrompt = async (genre: string, theme?: string): Promise<string> => {
  try {
    // ジャンルに基づいて詳細な日本語の説明を生成
    const japanesePrompt = `${genre}${theme ? `の${theme}をテーマにした` : 'の'}LPのメイン画像として最適な、魅力的で高品質なビジュアルの詳細な説明を50文字程度で生成してください。具体的な要素（色、雰囲気、構図、オブジェクト）を含めて説明してください。`;

    console.log('日本語プロンプト生成中...', japanesePrompt);
    const japaneseDescription = await generateText(japanesePrompt);

    // 生成された日本語説明を英語に翻訳
    const translationPrompt = `以下の日本語の画像説明を、画像生成AI用の詳細で具体的な英語プロンプトに翻訳してください。専門的な写真用語や雰囲気を表現する英語を使用してください:\n\n${japaneseDescription}`;

    console.log('英語翻訳中...', japaneseDescription);
    const englishPrompt = await generateText(translationPrompt);

    // 画像生成に最適化するため追加の品質キーワードを付加
    const finalPrompt = `${englishPrompt} professional photography, high resolution, beautiful lighting, detailed composition, cinematic quality, award winning photography`;

    return finalPrompt.trim();
  } catch (error) {
    console.error('詳細プロンプト生成エラー:', error);
    // エラー時はフォールバック用の基本プロンプトを返す
    return getBasicPrompt(genre, theme);
  }
};

// フォールバック用の基本プロンプト
const getBasicPrompt = (genre: string, theme?: string): string => {
  const genrePrompts: { [key: string]: string } = {
    'カフェ / レストラン': 'cozy modern cafe interior with warm lighting, wooden furniture, coffee cups, pastries, comfortable seating area, welcoming atmosphere',
    'IT会社 / SaaS / スタートアップ': 'modern tech office space with clean design, multiple monitors, collaborative workspace, glass walls, contemporary furniture, innovation atmosphere',
    '美容室 / サロン / ネイル / エステ': 'elegant beauty salon interior with modern styling chairs, professional lighting, clean white design, luxury spa atmosphere',
    'ジム / ヨガ / スポーツ': 'modern fitness gym with professional equipment, clean design, motivational atmosphere, natural lighting, athletic environment',
    '教育 / スクール / 習い事': 'bright modern classroom with educational materials, comfortable learning environment, inspiring atmosphere, natural lighting',
    '医療 / クリニック': 'clean medical clinic interior with modern equipment, sterile white environment, professional healthcare setting',
    'イベント / コミュニティ': 'vibrant event space with people gathering, modern venue, energetic atmosphere, community feeling',
  };

  const basePrompt = genrePrompts[genre] || 'professional business environment with modern design and welcoming atmosphere';

  if (theme) {
    return `${basePrompt} featuring ${theme} elements, professional photography, high quality, beautiful lighting, detailed composition`;
  }

  return `${basePrompt}, professional photography, high quality, beautiful lighting, detailed composition`;
};