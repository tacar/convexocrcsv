import React, { useState } from 'react';
import FullLPPreview from './FullLPPreview';
import EnhancedLPForm from './EnhancedLPForm';
import { searchUnsplashImage, generateText, generateImage } from '../services/api';
import { extractBestCatchphrase, extractBestDescription, extractCTAText } from '../utils/textProcessor';
import { generateDetailedImagePrompt } from '../utils/imagePromptGenerator';
import { generateLPContent } from '../utils/lpContentGenerator';
import { UniversalPromptGenerator } from '../utils/universalPrompts';
import { LPContent, LPFormData as LPFormDataType } from '../types/lpTypes';

interface LPFormData extends LPFormDataType {}

const MainApp: React.FC = () => {
  const [formData, setFormData] = useState<LPFormData>({
    genre: '',
    colorTheme: '',
    mainPhoto: '',
    catchphrase: '',
    subDescription: '',
    layout: 'simple',
    ctaText: 'お問い合わせ',
    ctaLink: ''
  });

  const [imageUrl, setImageUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lpContent, setLpContent] = useState<LPContent | null>(null);


  const [, setIsGeneratingImage] = useState(false);
  const [useGeneratedImage] = useState(true); // デフォルトでAI生成を使用


  const generateLP = async () => {
    setIsLoading(true);
    setIsGeneratingImage(true);
    try {
      let finalFormData = { ...formData };

      // サービス名が空の場合、ジャンルに基づいて自動生成
      if (!finalFormData.serviceName && finalFormData.genre) {
        const serviceNamePrompt = `${finalFormData.genre}のサービス名を1つだけ生成してください。8文字以内、覚えやすく親しみやすい名前、前置き不要、サービス名のみ。

条件:
- ${finalFormData.genre}らしい名前
- 覚えやすく親しみやすい
- ブランド感のある響き
- 日本語で自然な表現`;

        const generatedServiceName = await generateText(serviceNamePrompt);
        finalFormData.serviceName = extractBestCatchphrase(generatedServiceName);
        setFormData(prev => ({ ...prev, serviceName: finalFormData.serviceName }));
      }

      // キャッチコピーが空の場合、汎用プロンプトシステムで自動生成
      if (!finalFormData.catchphrase && finalFormData.genre) {
        const catchphrasePrompt = UniversalPromptGenerator.generatePrompt('catchphrase', { genre: finalFormData.genre });
        console.log('キャッチコピープロンプト:', catchphrasePrompt);
        const generatedCatchphrase = await generateText(catchphrasePrompt);
        finalFormData.catchphrase = extractBestCatchphrase(generatedCatchphrase);
        setFormData(prev => ({ ...prev, catchphrase: finalFormData.catchphrase }));
      }

      // 説明文が空の場合、汎用プロンプトシステムで自動生成
      if (!finalFormData.subDescription && finalFormData.genre) {
        const descPrompt = UniversalPromptGenerator.generatePrompt('description', {
          genre: finalFormData.genre,
          catchphrase: finalFormData.catchphrase
        });
        console.log('説明文プロンプト:', descPrompt);
        const generatedDescription = await generateText(descPrompt);
        finalFormData.subDescription = extractBestDescription(generatedDescription);
        setFormData(prev => ({ ...prev, subDescription: finalFormData.subDescription }));
      }

      // CTAボタン文言が空の場合、汎用プロンプトシステムで自動生成
      if ((!finalFormData.ctaText || finalFormData.ctaText === 'お問い合わせ') && finalFormData.genre) {
        const ctaPrompt = UniversalPromptGenerator.generatePrompt('cta', { genre: finalFormData.genre });
        console.log('CTAプロンプト:', ctaPrompt);
        const generatedCTA = await generateText(ctaPrompt);
        finalFormData.ctaText = extractCTAText(generatedCTA);
        setFormData(prev => ({ ...prev, ctaText: finalFormData.ctaText }));
      }

      // メイン画像を生成
      let generatedImageUrl = '';

      if (useGeneratedImage) {
        try {
          console.log('=== 画像プロンプト生成開始 ===');
          console.log('ジャンル:', finalFormData.genre);
          console.log('テーマ:', finalFormData.mainPhoto || '未選択');

          // AIで詳細な英語プロンプトを生成
          const detailedPrompt = await generateDetailedImagePrompt(
            finalFormData.genre,
            finalFormData.mainPhoto
          );

          console.log('生成された詳細プロンプト:', detailedPrompt);
          console.log('================================');

          generatedImageUrl = await generateImage({
            prompt: detailedPrompt,
            width: 1024,
            height: 768,
            model: 'flux'
          });
          console.log('画像生成完了:', generatedImageUrl);
        } catch (imageError) {
          console.error('画像生成エラー、Unsplashにフォールバック:', imageError);
          // フォールバック: Unsplashから取得
          const searchQuery = finalFormData.mainPhoto || finalFormData.genre || 'business';
          generatedImageUrl = searchUnsplashImage(searchQuery);
        }
      } else {
        // Unsplashから取得
        const searchQuery = finalFormData.mainPhoto || finalFormData.genre || 'business';
        generatedImageUrl = searchUnsplashImage(searchQuery);
      }

      setImageUrl(generatedImageUrl);

      // LPコンテンツを生成
      console.log('LPコンテンツ生成中...');
      const generatedContent = await generateLPContent(finalFormData);
      setLpContent({
        ...generatedContent,
        hero: {
          ...generatedContent.hero,
          backgroundImage: generatedImageUrl
        }
      });

      setShowPreview(true);
    } catch (error) {
      console.error('LP生成エラー:', error);
      alert('LP生成中にエラーが発生しました');
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  };

  const exportHTML = () => {
    if (!lpContent) return;

    const colors = getColorScheme(formData.colorTheme);
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lpContent.hero.catchphrase}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    ${generateFullHTMLContent(lpContent, imageUrl, colors, formData)}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-lp.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getColorScheme = (colorTheme: string) => {
    switch(colorTheme) {
      case 'pastel':
        return { bg: 'bg-pink-50', primary: 'bg-pink-500', text: 'text-pink-900', button: 'bg-pink-500' };
      case 'luxury':
        return { bg: 'bg-gray-900', primary: 'bg-yellow-600', text: 'text-gray-100', button: 'bg-yellow-600' };
      case 'natural':
        return { bg: 'bg-green-50', primary: 'bg-green-600', text: 'text-green-900', button: 'bg-green-600' };
      case 'pop':
        return { bg: 'bg-blue-50', primary: 'bg-orange-500', text: 'text-blue-900', button: 'bg-orange-500' };
      case 'monochrome':
        return { bg: 'bg-gray-100', primary: 'bg-gray-800', text: 'text-gray-900', button: 'bg-gray-800' };
      default:
        return { bg: 'bg-white', primary: 'bg-blue-600', text: 'text-gray-900', button: 'bg-blue-600' };
    }
  };

  const generateFullHTMLContent = (content: LPContent, imgUrl: string, colors: any, formData: LPFormData) => {
    // ジャンルに対応する絵文字を取得
    const getGenreIcon = (genre: string) => {
      const icons = {
        'IT会社 / SaaS / スタートアップ': '💻',
        '美容室 / サロン / ネイル / エステ': '✨',
        'カフェ / レストラン': '☕',
        'ジム / ヨガ / スポーツ': '💪',
        '教育 / スクール / 習い事': '📚',
        '医療 / クリニック': '🏥',
        'イベント / コミュニティ': '🎉'
      };
      return icons[genre as keyof typeof icons] || '⭐';
    };

    const genreIcon = getGenreIcon(formData.genre);

    return `
    <style>
      html { scroll-behavior: smooth; }
      .nav-link { position: relative; transition: all 0.3s ease; color: #000000 !important; font-weight: 700 !important; }
      .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px;
                         background: linear-gradient(45deg, #3b82f6, #8b5cf6); transition: width 0.3s ease; }
      .nav-link:hover::after { width: 100%; }
      .nav-title:hover { transform: scale(1.05); transition: transform 0.2s ease; }
      .nav-title, .nav-title span, .nav-link { color: #374151 !important; font-weight: 600 !important; }
      nav a { color: #4B5563 !important; font-weight: 600 !important; }
      nav span { color: #374151 !important; font-weight: 700 !important; }
    </style>

    <div class="min-h-screen ${colors.bg}">
      <!-- Navigation Bar -->
      <nav class="fixed top-0 w-full bg-white backdrop-blur-md shadow-lg z-50 border-b border-gray-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex-shrink-0">
              <a href="#hero" class="nav-title cursor-pointer truncate max-w-xs sm:max-w-sm flex items-center space-x-2 transition-transform" style="color: #374151 !important; font-size: 1.5rem; font-weight: 700 !important;">
                <span style="color: #374151 !important; font-size: 1.5rem;">${genreIcon}</span>
                <span style="color: #374151 !important; font-weight: 700 !important;">${formData.serviceName || content.hero.serviceName || content.hero.catchphrase || formData.genre + 'サービス'}</span>
              </a>
            </div>
            <div class="flex space-x-4 sm:space-x-6 lg:space-x-8">
              <a href="#features" class="nav-link transition-all" style="color: #4B5563 !important; font-weight: 600 !important; font-size: 1rem; text-decoration: none;">特徴</a>
              <a href="#benefits" class="nav-link transition-all" style="color: #4B5563 !important; font-weight: 600 !important; font-size: 1rem; text-decoration: none;">メリット</a>
              <a href="#testimonials" class="nav-link transition-all hidden sm:block" style="color: #4B5563 !important; font-weight: 600 !important; font-size: 1rem; text-decoration: none;">お客様の声</a>
              <a href="#pricing" class="nav-link transition-all" style="color: #4B5563 !important; font-weight: 600 !important; font-size: 1rem; text-decoration: none;">料金</a>
              <a href="#contact" class="nav-link transition-all" style="color: #4B5563 !important; font-weight: 600 !important; font-size: 1rem; text-decoration: none;">お問い合わせ</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section id="hero" class="min-h-screen flex items-center justify-center relative pt-16" style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imgUrl}); background-size: cover; background-position: center;">
        <div class="container mx-auto px-6 text-center text-white relative z-10">
          <h1 class="text-6xl font-bold mb-6">${content.hero.catchphrase}</h1>
          <p class="text-2xl mb-10 max-w-3xl mx-auto opacity-90">${content.hero.subDescription}</p>
          <a href="${content.hero.ctaLink}" class="inline-block px-10 py-5 ${colors.button} text-white text-xl font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">${content.hero.ctaText}</a>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 ${colors.secondary || colors.bg} scroll-mt-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold ${colors.text} mb-4">${content.features.title}</h2>
            <p class="text-xl ${colors.textSecondary}">${content.features.subtitle}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${content.features.items.map((feature, index) => `
              <div class="${colors.card || 'bg-white'} p-8 rounded-lg shadow-lg text-center hover:shadow-2xl transition-all duration-300">
                <div class="w-16 h-16 ${colors.primary} rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span class="text-white text-2xl font-bold">${index + 1}</span>
                </div>
                <h3 class="text-2xl font-semibold ${colors.text} mb-4">${feature.title}</h3>
                <p class="${colors.textSecondary}">${feature.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section id="benefits" class="py-20 ${colors.bg} scroll-mt-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold ${colors.text} mb-4">${content.benefits.title}</h2>
            <p class="text-xl ${colors.textSecondary}">${content.benefits.subtitle}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${content.benefits.items.map(benefit => `
              <div class="${colors.card || 'bg-white'} p-8 rounded-lg shadow-lg">
                <h3 class="text-2xl font-semibold ${colors.text} mb-4">${benefit.title}</h3>
                <p class="${colors.textSecondary}">${benefit.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section id="testimonials" class="py-20 ${colors.secondary || colors.bg} scroll-mt-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold ${colors.text} mb-4">${content.testimonials.title}</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${(content.testimonials.items || []).map((testimonial) => `
              <div class="${colors.card || 'bg-white'} p-8 rounded-lg shadow-lg">
                <div class="flex mb-4">
                  ${[...Array(5)].map((_, i) => `<span class="text-2xl ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}">★</span>`).join('')}
                </div>
                <p class="${colors.textSecondary} mb-6 italic">"${testimonial.comment}"</p>
                <div>
                  <h4 class="font-semibold ${colors.text}">${testimonial.name}</h4>
                  <p class="text-sm ${colors.textSecondary}">${testimonial.role}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="py-20 ${colors.bg} scroll-mt-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold ${colors.text} mb-4">${content.pricing.title}</h2>
            <p class="text-xl ${colors.textSecondary}">${content.pricing.subtitle}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${(content.pricing.plans || []).map((plan) => `
              <div class="${colors.card || 'bg-white'} p-8 rounded-lg shadow-lg relative ${plan.popular ? 'ring-4 ring-blue-500' : ''}">
                ${plan.popular ? '<div class="absolute -top-4 left-1/2 transform -translate-x-1/2"><span class="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">人気</span></div>' : ''}
                <div class="text-center mb-6">
                  <h3 class="text-2xl font-semibold ${colors.text} mb-2">${plan.name}</h3>
                  <p class="text-4xl font-bold ${colors.text}">${plan.price}</p>
                </div>
                <ul class="space-y-3 mb-8">
                  ${(plan.features || []).map(feature => `<li class="${colors.textSecondary} flex items-center"><span class="text-green-500 mr-3">✓</span>${feature}</li>`).join('')}
                </ul>
                <button class="w-full py-3 ${colors.button} text-white font-semibold rounded-lg transition-colors">選択する</button>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="py-20 ${colors.primary} scroll-mt-20">
        <div class="container mx-auto px-6 text-center">
          <h2 class="text-4xl font-bold text-white mb-6">${content.contact.title}</h2>
          <p class="text-xl text-white opacity-90 mb-10">${content.contact.description}</p>
          <a href="${content.contact.ctaLink}" class="inline-block px-10 py-5 bg-white text-gray-900 text-xl font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">${content.contact.ctaText}</a>
        </div>
      </section>
    </div>`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {!showPreview ? (
        <div className="p-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              ✨ LP自動生成ツール
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AIが業界に最適化されたプロフェッショナルなランディングページを自動生成します
            </p>
          </div>

          <EnhancedLPForm
            formData={formData}
            setFormData={setFormData}
            onGenerate={generateLP}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="relative">
          <div className="fixed top-24 left-4 z-40 flex flex-col gap-3 md:flex-row md:gap-2">
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-800/90 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-xl backdrop-blur-md border border-gray-600/30 hover:scale-105 text-sm md:text-base"
            >
              ← 編集に戻る
            </button>
            <button
              onClick={exportHTML}
              className="bg-green-600/90 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-xl backdrop-blur-md border border-green-500/30 hover:scale-105 text-sm md:text-base"
            >
              📥 HTMLダウンロード
            </button>
          </div>

          {lpContent && (
            <FullLPPreview
              content={lpContent}
              colorTheme={formData.colorTheme}
              imageUrl={imageUrl}
              genre={formData.genre}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MainApp;