import React, { useState } from 'react';

interface LPFormData {
  genre: string;
  colorTheme: string;
  customColor?: string;
  logo?: File;
  mainPhoto: string;
  catchphrase: string;
  subDescription: string;
  layout: string;
  ctaText: string;
  ctaLink: string;
}

const LPGenerator: React.FC = () => {
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

  const [generatedLP, setGeneratedLP] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const genres = [
    'カフェ / レストラン',
    'IT会社 / SaaS / スタートアップ',
    '美容室 / サロン / ネイル / エステ',
    'ジム / ヨガ / スポーツ',
    '教育 / スクール / 習い事',
    '医療 / クリニック',
    'イベント / コミュニティ',
    'その他'
  ];

  const colorThemes = [
    { value: 'pastel', label: '明るく親しみやすい（パステル系）' },
    { value: 'luxury', label: '高級感（黒×ゴールド、ネイビー×シルバー）' },
    { value: 'natural', label: 'ナチュラル（グリーン×ベージュ）' },
    { value: 'pop', label: '元気・ポップ（オレンジ×ブルー）' },
    { value: 'monochrome', label: 'モノクロ・スタイリッシュ（白黒グレー）' },
    { value: 'custom', label: '自由指定' }
  ];

  const layouts = [
    { value: 'simple', label: 'シンプル（1カラム、中央寄せ）' },
    { value: 'image-focus', label: '画像強調型（背景写真＋中央テキスト）' },
    { value: 'business', label: 'ビジネス寄り（左テキスト・右画像）' },
    { value: 'card', label: 'カード型（サービス紹介ブロック付き）' }
  ];

  const photoCategories = [
    '食べ物', 'オフィス', '人物', '内装', '風景'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        logo: e.target.files![0]
      }));
    }
  };

  const searchUnsplashPhoto = async (query: string) => {
    try {
      const response = await fetch(`https://source.unsplash.com/800x600/?${query}`);
      return response.url;
    } catch (error) {
      console.error('Unsplash検索エラー:', error);
      return '';
    }
  };

  const generateLP = async () => {
    setIsLoading(true);

    try {
      const photoUrl = await searchUnsplashPhoto(formData.mainPhoto || formData.genre);

      const prompt = `
        業種: ${formData.genre}
        カラーテーマ: ${formData.colorTheme}
        キャッチコピー: ${formData.catchphrase}
        説明文: ${formData.subDescription}
        レイアウト: ${formData.layout}
        CTAボタン: ${formData.ctaText}
      `;

      const response = await fetch('https://aip.tacarz.workers.dev/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `以下の情報を元に魅力的なLPのHTMLコードを生成してください。TailwindCSSを使用してスタイリングしてください。\n${prompt}`
            }]
          }]
        })
      });

      const data = await response.json();
      const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const htmlWithImage = generatedContent.replace('{{IMAGE_URL}}', photoUrl);
      setGeneratedLP(htmlWithImage);

    } catch (error) {
      console.error('LP生成エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">LP自動生成ツール</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">入力項目</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. 基本ジャンル（業種・テーマ）*
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. カラーテーマ（ブランド感）*
              </label>
              <select
                name="colorTheme"
                value={formData.colorTheme}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                {colorThemes.map(theme => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </select>
              {formData.colorTheme === 'custom' && (
                <input
                  type="text"
                  name="customColor"
                  value={formData.customColor || ''}
                  onChange={handleInputChange}
                  placeholder="カラーコード例: #FF5733"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3. ロゴ画像（オプション）
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メイン写真カテゴリ*
              </label>
              <select
                name="mainPhoto"
                value={formData.mainPhoto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                {photoCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4. キャッチコピー*
              </label>
              <input
                type="text"
                name="catchphrase"
                value={formData.catchphrase}
                onChange={handleInputChange}
                placeholder="例: あなたの毎日に、特別な一杯を"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サブ説明文
              </label>
              <textarea
                name="subDescription"
                value={formData.subDescription}
                onChange={handleInputChange}
                placeholder="サービスの詳細説明を入力"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                5. レイアウトの雰囲気
              </label>
              <select
                name="layout"
                value={formData.layout}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {layouts.map(layout => (
                  <option key={layout.value} value={layout.value}>{layout.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6. CTAボタン文言
              </label>
              <input
                type="text"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleInputChange}
                placeholder="例: 今すぐ予約"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTAリンク先
              </label>
              <input
                type="text"
                name="ctaLink"
                value={formData.ctaLink}
                onChange={handleInputChange}
                placeholder="例: mailto:info@example.com または tel:03-1234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            onClick={generateLP}
            disabled={isLoading || !formData.genre || !formData.colorTheme || !formData.catchphrase || !formData.mainPhoto}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '生成中...' : 'LPを生成'}
          </button>
        </div>

        {generatedLP && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">生成されたLP</h2>
            <div className="border border-gray-200 rounded p-4">
              <div dangerouslySetInnerHTML={{ __html: generatedLP }} />
            </div>
            <button
              onClick={() => {
                const blob = new Blob([generatedLP], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated-lp.html';
                a.click();
              }}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              HTMLファイルをダウンロード
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LPGenerator;