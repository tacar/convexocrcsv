import React, { useState } from 'react';
import { LPFormData } from '../types/lpTypes';

interface EnhancedLPFormProps {
  formData: LPFormData;
  setFormData: React.Dispatch<React.SetStateAction<LPFormData>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const EnhancedLPForm: React.FC<EnhancedLPFormProps> = ({
  formData,
  setFormData,
  onGenerate,
  isLoading
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const genres = [
    { value: 'カフェ / レストラン', icon: '☕', description: '飲食店・レストラン・カフェ' },
    { value: 'IT会社 / SaaS / スタートアップ', icon: '💻', description: 'IT企業・テック系スタートアップ' },
    { value: '美容室 / サロン / ネイル / エステ', icon: '✨', description: '美容・エステ・サロン系' },
    { value: 'ジム / ヨガ / スポーツ', icon: '💪', description: 'フィットネス・スポーツ関連' },
    { value: '教育 / スクール / 習い事', icon: '📚', description: '教育・学習・習い事' },
    { value: '医療 / クリニック', icon: '🏥', description: '医療・クリニック・治療院' },
    { value: 'イベント / コミュニティ', icon: '🎉', description: 'イベント・コミュニティ運営' },
    { value: 'その他', icon: '⭐', description: 'その他の業種' }
  ];

  const colorThemes = [
    {
      value: 'pastel',
      label: 'パステル・親しみやすい',
      preview: 'bg-gradient-to-r from-pink-200 to-purple-200',
      description: '優しく親しみやすい印象。美容・カフェ・教育系におすすめ'
    },
    {
      value: 'luxury',
      label: '高級感・プレミアム',
      preview: 'bg-gradient-to-r from-gray-800 to-yellow-600',
      description: '高級感と信頼性を演出。医療・高級サービスにおすすめ'
    },
    {
      value: 'natural',
      label: 'ナチュラル・自然',
      preview: 'bg-gradient-to-r from-green-200 to-emerald-200',
      description: '自然で落ち着いた印象。健康・オーガニック系におすすめ'
    },
    {
      value: 'pop',
      label: 'ポップ・元気',
      preview: 'bg-gradient-to-r from-blue-200 to-orange-200',
      description: '元気で活動的な印象。スポーツ・イベント系におすすめ'
    },
    {
      value: 'monochrome',
      label: 'モノクロ・シンプル',
      preview: 'bg-gradient-to-r from-gray-200 to-gray-400',
      description: 'シンプルで洗練された印象。IT・ビジネス系におすすめ'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.genre !== '';
      case 2:
        return formData.colorTheme !== '';
      case 3:
        return true; // コンテンツ設定は任意
      case 4:
        return true; // 最終確認
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
              step === currentStep
                ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <h3 className="text-lg font-semibold text-gray-800">
          ステップ {currentStep}/4: {
            currentStep === 1 ? '業種・ジャンル選択' :
            currentStep === 2 ? 'デザインテーマ選択' :
            currentStep === 3 ? 'コンテンツ設定' :
            '最終確認・生成'
          }
        </h3>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">どのような業種のLPを作成しますか？</h2>
        <p className="text-gray-600">最適なコンテンツとデザインを提案します</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <button
            key={genre.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, genre: genre.value }))}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              formData.genre === genre.value
                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-3">{genre.icon}</div>
            <div className="text-sm font-semibold text-gray-800 mb-1">{genre.value}</div>
            <div className="text-xs text-gray-500">{genre.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">デザインテーマを選択してください</h2>
        <p className="text-gray-600">{formData.genre}に最適なカラーテーマをお選びください</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colorThemes.map((theme) => (
          <button
            key={theme.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, colorTheme: theme.value }))}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              formData.colorTheme === theme.value
                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-full h-16 rounded-lg mb-4 ${theme.preview}`}></div>
            <div className="text-sm font-semibold text-gray-800 mb-2">{theme.label}</div>
            <div className="text-xs text-gray-500">{theme.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">コンテンツをカスタマイズ</h2>
        <p className="text-gray-600">空欄の項目は自動で生成されます</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            サービス名・会社名
          </label>
          <input
            type="text"
            name="serviceName"
            value={formData.serviceName || ''}
            onChange={handleInputChange}
            placeholder="空欄で自動生成"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">あなたのサービス名や会社名</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            キャッチコピー
          </label>
          <input
            type="text"
            name="catchphrase"
            value={formData.catchphrase}
            onChange={handleInputChange}
            placeholder="空欄で自動生成"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">15文字以内の魅力的なメッセージ</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTAボタン文言
          </label>
          <input
            type="text"
            name="ctaText"
            value={formData.ctaText}
            onChange={handleInputChange}
            placeholder="空欄で自動生成"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">8文字以内の行動を促す文言</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明文
          </label>
          <textarea
            name="subDescription"
            value={formData.subDescription}
            onChange={handleInputChange}
            placeholder="空欄で自動生成"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">50文字以内のサービス説明</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            お問い合わせ先
          </label>
          <input
            type="text"
            name="ctaLink"
            value={formData.ctaLink}
            onChange={handleInputChange}
            placeholder="例: mailto:info@example.com または tel:03-1234-5678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">設定内容の確認</h2>
        <p className="text-gray-600">以下の内容でLPを生成します</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="font-medium text-gray-700">業種・ジャンル</span>
          <span className="text-gray-900">{formData.genre}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="font-medium text-gray-700">サービス名・会社名</span>
          <span className="text-gray-900">{formData.serviceName || '自動生成'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="font-medium text-gray-700">デザインテーマ</span>
          <span className="text-gray-900">
            {colorThemes.find(t => t.value === formData.colorTheme)?.label || formData.colorTheme}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="font-medium text-gray-700">キャッチコピー</span>
          <span className="text-gray-900">{formData.catchphrase || '自動生成'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="font-medium text-gray-700">CTAボタン</span>
          <span className="text-gray-900">{formData.ctaText || '自動生成'}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="font-medium text-gray-700">説明文</span>
          <span className="text-gray-900">{formData.subDescription || '自動生成'}</span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">🚀 生成されるコンテンツ</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• プロフェッショナルなヒーローセクション</li>
          <li>• サービス特徴（3項目）</li>
          <li>• お客様メリット（3項目）</li>
          <li>• お客様の声・評判（3件）</li>
          <li>• 料金プラン（3プラン）</li>
          <li>• よくある質問（3項目）</li>
          <li>• 会社概要・お問い合わせ</li>
          <li>• レスポンシブ対応・高品質画像</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {renderStepIndicator()}

        <div className="min-h-[500px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            前へ戻る
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNextStep()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              次へ進む
            </button>
          ) : (
            <button
              onClick={onGenerate}
              disabled={isLoading || !canProceedToNextStep()}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>LP を生成する</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLPForm;