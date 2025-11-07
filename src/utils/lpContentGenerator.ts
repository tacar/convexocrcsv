import { generateText } from '../services/api';
import { LPContent, LPFormData } from '../types/lpTypes';
import { extractBestDescription, extractJSONContent } from './textProcessor';
import { UniversalPromptGenerator } from './universalPrompts';

export const generateLPContent = async (formData: LPFormData): Promise<LPContent> => {
  const { genre, catchphrase, subDescription, ctaText, ctaLink, serviceName } = formData;

  try {
    console.log('LP コンテンツ生成開始:', genre);

    // 汎用プロンプトシステムを使用して各セクションを生成

    // 特徴セクションの生成
    const featuresPrompt = UniversalPromptGenerator.generatePrompt('features', {
      genre,
      serviceName: serviceName || `${genre}サービス`
    });
    console.log('Features プロンプト:', featuresPrompt);
    const featuresResponse = await generateText(featuresPrompt);
    let features = [];
    try {
      const cleanedFeatures = extractJSONContent(featuresResponse);
      const parsed = JSON.parse(cleanedFeatures);
      features = Array.isArray(parsed) ? parsed : getDefaultFeatures(genre);
    } catch (error) {
      console.error('Features JSON パースエラー:', error, '元テキスト:', featuresResponse);
      features = getDefaultFeatures(genre);
    }

    // メリットセクションの生成
    const benefitsPrompt = UniversalPromptGenerator.generatePrompt('benefits', {
      genre,
      serviceName: serviceName || `${genre}サービス`
    });
    console.log('Benefits プロンプト:', benefitsPrompt);
    const benefitsResponse = await generateText(benefitsPrompt);
    let benefits = [];
    try {
      const cleanedBenefits = extractJSONContent(benefitsResponse);
      const parsed = JSON.parse(cleanedBenefits);
      benefits = Array.isArray(parsed) ? parsed : getDefaultBenefits(genre);
    } catch (error) {
      console.error('Benefits JSON パースエラー:', error, '元テキスト:', benefitsResponse);
      benefits = getDefaultBenefits(genre);
    }

    // お客様の声の生成
    const testimonialsPrompt = UniversalPromptGenerator.generatePrompt('testimonials', { genre });
    console.log('Testimonials プロンプト:', testimonialsPrompt);
    const testimonialsResponse = await generateText(testimonialsPrompt);
    let testimonials = [];
    try {
      const cleanedTestimonials = extractJSONContent(testimonialsResponse);
      const parsed = JSON.parse(cleanedTestimonials);
      testimonials = Array.isArray(parsed) ? parsed : getDefaultTestimonials(genre);
    } catch (error) {
      console.error('Testimonials JSON パースエラー:', error, '元テキスト:', testimonialsResponse);
      testimonials = getDefaultTestimonials(genre);
    }

    // 会社概要の生成
    const aboutPrompt = UniversalPromptGenerator.generatePrompt('about', { genre });
    console.log('About プロンプト:', aboutPrompt);
    const aboutResponse = await generateText(aboutPrompt);
    const aboutDescription = extractBestDescription(aboutResponse);

    // よくある質問の生成
    const faqPrompt = UniversalPromptGenerator.generatePrompt('faq', { genre });
    console.log('FAQ プロンプト:', faqPrompt);
    const faqResponse = await generateText(faqPrompt);
    let faqItems = [];
    try {
      const cleanedFaq = extractJSONContent(faqResponse);
      const parsed = JSON.parse(cleanedFaq);
      faqItems = Array.isArray(parsed) ? parsed : getDefaultFAQ(genre);
    } catch (error) {
      console.error('FAQ JSON パースエラー:', error, '元テキスト:', faqResponse);
      faqItems = getDefaultFAQ(genre);
    }

    // 料金プランの生成
    const pricingPrompt = UniversalPromptGenerator.generatePrompt('pricing', { genre });
    console.log('Pricing プロンプト:', pricingPrompt);
    const pricingResponse = await generateText(pricingPrompt);
    let pricingPlans = [];
    try {
      const cleanedPricing = extractJSONContent(pricingResponse);
      const parsed = JSON.parse(cleanedPricing);
      pricingPlans = Array.isArray(parsed) ? parsed : getDefaultPricing(genre);
    } catch (error) {
      console.error('Pricing JSON パースエラー:', error, '元テキスト:', pricingResponse);
      pricingPlans = getDefaultPricing(genre);
    }

    const result = {
      hero: {
        serviceName: serviceName || `${genre}サービス`,
        catchphrase: catchphrase || `${serviceName || genre}で最高のサービスを`,
        subDescription: subDescription || `${serviceName ? `${serviceName}は` : ''}プロフェッショナルな${genre}サービスをお届けします`,
        ctaText: ctaText || "今すぐ相談",
        ctaLink: ctaLink || "#contact",
        backgroundImage: ""
      },
      features: {
        title: "私たちの特徴",
        subtitle: "選ばれる理由",
        items: features
      },
      benefits: {
        title: "お客様のメリット",
        subtitle: "ご利用いただくことで得られる価値",
        items: benefits
      },
      testimonials: {
        title: "お客様の声",
        items: testimonials
      },
      about: {
        title: "私たちについて",
        description: aboutDescription,
        image: ""
      },
      pricing: {
        title: "料金プラン",
        subtitle: "ニーズに合わせてお選びください",
        plans: pricingPlans
      },
      faq: {
        title: "よくある質問",
        items: faqItems
      },
      contact: {
        title: "お問い合わせ",
        description: "ご質問やご相談は、お気軽にお問い合わせください。専門スタッフが迅速にご対応いたします。",
        ctaText: ctaText || "今すぐ相談",
        ctaLink: ctaLink || "mailto:info@example.com"
      }
    };

    console.log('生成されたLPコンテンツ:', result);
    console.log('料金プラン詳細:', result.pricing.plans);
    return result;
  } catch (error) {
    console.error('LP content generation error:', error);
    // エラー時はデフォルトコンテンツを返す
    return getDefaultLPContent(formData);
  }
};

// デフォルトコンテンツ生成関数群
function getDefaultFeatures(genre: string) {
  const defaults: { [key: string]: any[] } = {
    'IT会社 / SaaS / スタートアップ': [
      { title: "最新技術力", description: "AI、クラウド、セキュリティなど最新技術に精通した専門チーム" },
      { title: "豊富な実績", description: "500社以上の企業様にサービスを提供し、95%以上の満足度を実現" },
      { title: "24時間サポート", description: "導入後も安心の24時間365日サポート体制でビジネスを支える" }
    ],
    '美容室 / サロン / ネイル / エステ': [
      { title: "確かな技術", description: "経験豊富なスタイリストが最新技術でお応えします" },
      { title: "上質な空間", description: "リラックスできる洗練された癒しの空間を提供" },
      { title: "個別対応", description: "お一人おひとりに合わせたオーダーメイドサービス" }
    ]
  };
  return defaults[genre] || [
    { title: "高品質サービス", description: "お客様に最高品質のサービスを提供します" },
    { title: "専門スタッフ", description: "経験豊富な専門スタッフがサポートします" },
    { title: "安心価格", description: "明確で安心できる料金設定でご提供" }
  ];
}

function getDefaultBenefits(genre: string) {
  const defaults: { [key: string]: any[] } = {
    'IT会社 / SaaS / スタートアップ': [
      { title: "業務効率化", description: "IT導入により業務プロセスを最適化し、生産性を大幅に向上" },
      { title: "コスト削減", description: "システム統合とクラウド活用により、運用コストを30%以上削減" },
      { title: "競争力強化", description: "最新技術の導入で市場での競争優位性を確立し、ビジネス成長を加速" }
    ],
    '美容室 / サロン / ネイル / エステ': [
      { title: "理想スタイル実現", description: "プロの技術でなりたい自分を叶え、自信と魅力がアップ" },
      { title: "リラックス効果", description: "上質な空間で心も体もリフレッシュし、日々のストレスを解消" },
      { title: "美容効果持続", description: "高品質なケアで美しさが長続きし、毎日が輝いて見える" }
    ]
  };
  return defaults[genre] || [
    { title: "時間の節約", description: "効率的なサービスで貴重な時間を有効活用できます" },
    { title: "ストレス軽減", description: "プロにお任せで安心、ストレスから解放されます" },
    { title: "満足度向上", description: "期待を上回る結果で、日々の満足度が向上します" }
  ];
}

function getDefaultTestimonials(genre: string) {
  const defaults: { [key: string]: any[] } = {
    'IT会社 / SaaS / スタートアップ': [
      { name: "田中様", role: "製造業・IT部長", comment: "技術力の高さと丁寧なサポートに感動。システム導入後、業務効率が大幅改善", rating: 5 },
      { name: "佐藤様", role: "金融業・CTO", comment: "予算内で期待以上の成果を実現。セキュリティ面での安心感が大きい", rating: 5 },
      { name: "山田様", role: "小売業・代表取締役", comment: "AI導入で売上向上という具体的な成果を得ることができました", rating: 5 }
    ],
    '美容室 / サロン / ネイル / エステ': [
      { name: "M.T様", role: "30代・会社員", comment: "いつも丁寧にカウンセリングしてくださり、理想以上の仕上がりに大満足", rating: 5 },
      { name: "Y.S様", role: "20代・花嫁", comment: "結婚式のヘアセット、想像を超える美しい仕上がりで一生の思い出に", rating: 5 },
      { name: "K.N様", role: "40代・主婦", comment: "カラーリングの色味が絶妙で、周りからたくさん褒められました", rating: 5 }
    ]
  };
  return defaults[genre] || [
    { name: "田中様", role: "会社員", comment: "期待以上のサービスで、とても満足しています", rating: 5 },
    { name: "佐藤様", role: "主婦", comment: "初めての利用でしたが、安心できました", rating: 5 },
    { name: "山田様", role: "自営業", comment: "コストパフォーマンスが良く助かりました", rating: 4 }
  ];
}

function getDefaultFAQ(genre: string) {
  const defaults: { [key: string]: any[] } = {
    'IT会社 / SaaS / スタートアップ': [
      { question: "導入期間はどのくらいかかりますか？", answer: "プロジェクトの規模により異なりますが、小規模で1-2ヶ月、大規模で3-6ヶ月程度です" },
      { question: "セキュリティ対策はどのようなものですか？", answer: "多層防御アプローチを採用し、包括的なセキュリティ対策を実施します" },
      { question: "既存システムとの連携は可能ですか？", answer: "API連携やデータ移行など、お客様の環境に合わせた最適な方法をご提案します" }
    ],
    '美容室 / サロン / ネイル / エステ': [
      { question: "初回利用時の流れを教えてください", answer: "カウンセリングでご希望をお聞きし、髪質に合わせてご提案いたします" },
      { question: "料金体系について教えてください", answer: "明確な料金設定で、事前にお見積もりをご提示いたします" },
      { question: "予約の変更・キャンセルは可能ですか？", answer: "前日までのご連絡で変更・キャンセルが可能です" }
    ]
  };
  return defaults[genre] || [
    { question: "初回利用時の流れを教えてください", answer: "お気軽にお問い合わせください。専門スタッフがご案内いたします" },
    { question: "料金体系について教えてください", answer: "明確な料金設定で、事前にお見積もりをご提示いたします" },
    { question: "予約の変更は可能ですか？", answer: "前日までのご連絡で変更が可能です" }
  ];
}

function getDefaultPricing(genre: string) {
  const settings = UniversalPromptGenerator.getGenreSettings(genre);
  const [min, max] = settings?.priceRange || [5000, 15000];

  const defaults: { [key: string]: any[] } = {
    'IT会社 / SaaS / スタートアップ': [
      { name: "スタートアップ", price: "¥100,000/月", features: ["基本システム構築", "メール・チャットサポート", "月次レポート"], popular: false },
      { name: "ビジネス", price: "¥300,000/月", features: ["フルシステム構築・運用", "24時間電話サポート", "高度セキュリティ対策"], popular: true },
      { name: "エンタープライズ", price: "¥500,000/月", features: ["カスタムソリューション", "専任コンサルタント", "AI・機械学習導入"], popular: false }
    ],
    '美容室 / サロン / ネイル / エステ': [
      { name: "ベーシック", price: "¥6,000", features: ["カット", "シャンプー", "ブロー"], popular: false },
      { name: "スタンダード", price: "¥12,000", features: ["カット", "カラー", "トリートメント"], popular: true },
      { name: "プレミアム", price: "¥20,000", features: ["フルコース", "ヘッドスパ", "特別ケア"], popular: false }
    ]
  };
  return defaults[genre] || [
    { name: "ベーシック", price: `¥${min.toLocaleString()}`, features: ["基本サービス", "メール対応", "30日保証"], popular: false },
    { name: "スタンダード", price: `¥${Math.round((min + max) / 2).toLocaleString()}`, features: ["充実サービス", "電話対応", "60日保証"], popular: true },
    { name: "プレミアム", price: `¥${max.toLocaleString()}`, features: ["フルサービス", "24時間対応", "90日保証"], popular: false }
  ];
}

const getDefaultLPContent = (formData: LPFormData): LPContent => {
  const { genre, catchphrase, subDescription, ctaText, ctaLink } = formData;

  return {
    hero: {
      catchphrase: catchphrase || `${genre}で最高のサービスを`,
      subDescription: subDescription || `プロフェッショナルな${genre}サービスをお届けします`,
      ctaText: ctaText || "今すぐ相談",
      ctaLink: ctaLink || "#contact",
      backgroundImage: ""
    },
    features: {
      title: "私たちの特徴",
      subtitle: "選ばれる理由",
      items: [
        { title: "高品質サービス", description: "お客様に最高品質のサービスを提供します" },
        { title: "専門スタッフ", description: "経験豊富な専門スタッフがサポートします" },
        { title: "安心価格", description: "明確で安心できる料金設定でご提供" }
      ]
    },
    benefits: {
      title: "お客様のメリット",
      subtitle: "ご利用いただくことで得られる価値",
      items: [
        { title: "時間の節約", description: "効率的なサービスで貴重な時間を有効活用できます" },
        { title: "ストレス軽減", description: "プロにお任せで安心、ストレスから解放されます" },
        { title: "満足度向上", description: "期待を上回る結果で、日々の満足度が向上します" }
      ]
    },
    testimonials: {
      title: "お客様の声",
      items: [
        { name: "田中様", role: "会社員", comment: "期待以上のサービスで、とても満足しています。", rating: 5 },
        { name: "佐藤様", role: "主婦", comment: "初めての利用でしたが、安心できました。", rating: 5 },
        { name: "山田様", role: "自営業", comment: "コストパフォーマンスが良く助かりました。", rating: 4 }
      ]
    },
    about: {
      title: "私たちについて",
      description: `私たちは${genre}の分野で長年の経験を積み重ね、お客様に最高のサービスを提供することを使命としています。`,
      image: ""
    },
    pricing: {
      title: "料金プラン",
      subtitle: "ニーズに合わせてお選びください",
      plans: [
        { name: "ベーシック", price: "¥5,000", features: ["基本サービス", "メール対応", "30日保証"], popular: false },
        { name: "スタンダード", price: "¥8,000", features: ["充実サービス", "電話対応", "60日保証"], popular: true },
        { name: "プレミアム", price: "¥12,000", features: ["フルサービス", "24時間対応", "90日保証"], popular: false }
      ]
    },
    faq: {
      title: "よくある質問",
      items: [
        { question: "初回利用時の流れを教えてください", answer: "お気軽にお問い合わせください。専門スタッフがご案内いたします。" },
        { question: "料金体系について教えてください", answer: "明確な料金設定で、事前にお見積もりをご提示いたします。" },
        { question: "予約の変更は可能ですか？", answer: "前日までのご連絡で変更が可能です。" }
      ]
    },
    contact: {
      title: "お問い合わせ",
      description: "ご質問やご相談は、お気軽にお問い合わせください。",
      ctaText: ctaText || "今すぐ相談",
      ctaLink: ctaLink || "mailto:info@example.com"
    }
  };
};