interface PromptConfig {
  genre: string;
  catchphrase?: string;
  japaneseDescription?: string;
  serviceName?: string;
}

interface GenreSettings {
  colorTheme: string;
  priceRange: [number, number];
  keywords: string[];
  targetCustomers: string[];
}

export const genreSettings: { [key: string]: GenreSettings } = {
  'IT会社 / SaaS / スタートアップ': {
    colorTheme: 'monochrome',
    priceRange: [100000, 500000],
    keywords: ['技術力', 'DX', 'クラウド', 'セキュリティ'],
    targetCustomers: ['製造業', '金融業', '小売業']
  },

  '美容室 / サロン / ネイル / エステ': {
    colorTheme: 'pastel',
    priceRange: [5000, 15000],
    keywords: ['美しさ', '技術', '癒し', 'スタイル'],
    targetCustomers: ['会社員', '主婦', '学生']
  },

  'カフェ / レストラン': {
    colorTheme: 'natural',
    priceRange: [500, 2000],
    keywords: ['味', '雰囲気', 'こだわり', 'くつろぎ'],
    targetCustomers: ['会社員', '学生', 'カップル']
  },

  'ジム / ヨガ / スポーツ': {
    colorTheme: 'pop',
    priceRange: [8000, 15000],
    keywords: ['健康', 'フィットネス', '結果', 'サポート'],
    targetCustomers: ['会社員', '主婦', '学生']
  },

  '教育 / スクール / 習い事': {
    colorTheme: 'natural',
    priceRange: [3000, 12000],
    keywords: ['学習', '成長', '指導', '実績'],
    targetCustomers: ['学生', '社会人', '子供']
  },

  '医療 / クリニック': {
    colorTheme: 'monochrome',
    priceRange: [5000, 30000],
    keywords: ['安心', '専門性', '治療', '健康'],
    targetCustomers: ['患者', '家族', '高齢者']
  },

  'イベント / コミュニティ': {
    colorTheme: 'pop',
    priceRange: [1000, 10000],
    keywords: ['交流', '体験', '参加', '楽しさ'],
    targetCustomers: ['参加者', '家族', '友人']
  }
};

export class UniversalPromptGenerator {

  static generatePrompt(type: string, config: PromptConfig): string {
    const { genre, catchphrase, japaneseDescription, serviceName } = config;

    const prompts: { [key: string]: string } = {

      catchphrase: `${genre}のLP用の魅力的なキャッチコピーを1つだけ生成してください。15文字以内、前置きや説明不要、キャッチコピーのみ。

条件:
- ${genre}の魅力と価値を表現
- お客様の感情に訴える強いメッセージ
- 記憶に残りやすく印象的な表現
- 業界に適した専門的な言葉遣い
- 競合他社との差別化を意識
- ターゲット顧客の課題解決を暗示

参考キーワード: ${this.getKeywords(genre).join('、')}`,

      description: `${genre}のLP用の説明文を1文で生成、50文字以内、前置き不要、説明文のみ。${catchphrase ? `キャッチコピー: ${catchphrase}` : ''}

条件:
- サービスの特徴を簡潔に表現
- 技術力・品質・雰囲気を含む
- お客様のメリットを明示
- 信頼感と安心感を与える`,

      cta: `${genre}のLP用CTAボタン文言を1つだけ8文字以内、前置き不要、文言のみ。

条件:
- 業界に最適な行動促進表現
- 親しみやすく分かりやすい
- 緊急性や特典感を演出
- 具体的な次のステップを示す

例: 無料相談、今すぐ予約、資料請求、無料体験`,

      features: `${serviceName ? `「${serviceName}」という` : ''}${genre}のビジネスの主要な特徴を3つ生成してください。それぞれタイトル（10文字以内）と説明文（30文字以内）のペアで出力してください。JSON形式で出力：[{"title":"タイトル","description":"説明"}]

条件:
- 業界の競争優位性を表現
- 技術力・サービス品質・体験価値
- 他社との差別化ポイント
- お客様が重視する要素${serviceName ? `\n- ${serviceName}らしいサービス特徴` : ''}`,

      benefits: `${serviceName ? `「${serviceName}」の` : ''}${genre}を利用することで得られるメリットを3つ生成してください。お客様目線での具体的な利益を、タイトル（15文字以内）と説明文（40文字以内）のペアで。JSON形式：[{"title":"タイトル","description":"説明"}]

条件:
- 実用的で具体的なメリット
- 感情的な満足度も含む
- 時間・コスト・品質の観点
- 業界特有の価値提案${serviceName ? `\n- ${serviceName}ならではの価値` : ''}`,

      testimonials: `${serviceName ? `「${serviceName}」という` : ''}${genre}のお客様の声を3つ生成してください。リアルで具体的な体験談を。JSON形式：[{"name":"お客様名","role":"職業・属性","comment":"コメント（50文字以内）","rating":5}]

条件:
- 年代・職業の多様性を表現
- 具体的なサービス内容への言及
- 感情的な満足度を含む
- リアリティのある自然な表現${serviceName ? `\n- ${serviceName}への具体的な言及を含む` : ''}`,

      faq: `${genre}に関するよくある質問と回答を3つ生成してください。JSON形式：[{"question":"質問","answer":"回答"}]

条件:
- 初回利用者が気になる内容
- 料金・時間・プロセスに関する質問
- サービス品質や安全性について
- 安心感を与える丁寧な回答`,

      pricing: `${genre}の料金プランを3つ（ベーシック、スタンダード、プレミアム）生成してください。JSON形式：[{"name":"プラン名","price":"料金","features":["特徴1","特徴2","特徴3"],"popular":false}]

条件:
- 段階的で分かりやすい価格設定
- 各プランの明確な差別化
- 業界標準に沿った現実的な価格
- スタンダードプランをpopular: true`,

      about: `${serviceName ? `「${serviceName}」という` : ''}${genre}の会社として、信頼感のある会社概要を100文字程度で生成してください。創業年数、実績、こだわりなどを含めて。

条件:
- 業界での経験・実績を具体的に
- サービスへのこだわりや理念
- お客様への想いや価値観
- 信頼感と専門性をアピール${serviceName ? `\n- ${serviceName}という名前の由来や理念を含む` : ''}`,

      imageDescription: `${genre}のLPのメイン画像として最適な、魅力的で高品質なビジュアルの詳細な説明を50文字程度で生成してください。具体的な要素（色、雰囲気、構図、オブジェクト）を含めて説明してください。

条件:
- 業界の特徴的な要素を含む
- プロフェッショナルで高品質な印象
- 清潔感と信頼感を表現
- 具体的なビジュアル要素を明記`,

      imageTranslation: `以下の日本語の画像説明を、画像生成AI用の詳細で具体的な英語プロンプトに翻訳してください。専門的な写真用語や雰囲気を表現する英語を使用してください:

${japaneseDescription}

条件:
- 業界専門用語の正確な使用
- 高品質な写真表現技法
- 具体的で詳細なビジュアル指示
- プロフェッショナルな表現

追加キーワード: professional photography, high resolution, beautiful lighting, detailed composition, cinematic quality, award winning photography`
    };

    return prompts[type] || '';
  }

  static getGenreSettings(genre: string): GenreSettings | null {
    return genreSettings[genre] || null;
  }

  static getSuggestedColorTheme(genre: string): string {
    const settings = this.getGenreSettings(genre);
    return settings?.colorTheme || 'natural';
  }

  static getPriceRange(genre: string): [number, number] {
    const settings = this.getGenreSettings(genre);
    return settings?.priceRange || [1000, 10000];
  }

  static getKeywords(genre: string): string[] {
    const settings = this.getGenreSettings(genre);
    return settings?.keywords || ['品質', 'サービス', '信頼'];
  }

  static validatePromptOutput(type: string, output: string): boolean {
    switch (type) {
      case 'catchphrase':
        return output.length <= 15 && !output.includes('生成') && !output.includes('キャッチコピー');

      case 'description':
        return output.length <= 50 && !output.includes('説明文') && !output.includes('生成');

      case 'cta':
        return output.length <= 8 && !output.includes('ボタン') && !output.includes('文言');

      case 'features':
      case 'benefits':
      case 'testimonials':
      case 'faq':
      case 'pricing':
        try {
          JSON.parse(output);
          return true;
        } catch {
          return false;
        }

      case 'about':
        return output.length <= 100 && output.length > 20;

      case 'imageDescription':
        return output.length <= 50 && output.length > 10;

      default:
        return true;
    }
  }
}