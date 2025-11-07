import React from 'react';

interface LPPreviewProps {
  htmlContent: string;
  genre: string;
  colorTheme: string;
  catchphrase: string;
  subDescription: string;
  layout: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

const LPPreview: React.FC<LPPreviewProps> = ({
  genre,
  colorTheme,
  catchphrase,
  subDescription,
  layout,
  ctaText,
  ctaLink,
  imageUrl
}) => {
  const getColorScheme = () => {
    switch(colorTheme) {
      case 'pastel':
        return {
          bg: 'bg-pink-50',
          primary: 'bg-pink-400',
          text: 'text-pink-900',
          button: 'bg-pink-500 hover:bg-pink-600'
        };
      case 'luxury':
        return {
          bg: 'bg-gray-900',
          primary: 'bg-gold-600',
          text: 'text-gray-100',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'natural':
        return {
          bg: 'bg-green-50',
          primary: 'bg-green-600',
          text: 'text-green-900',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'pop':
        return {
          bg: 'bg-blue-50',
          primary: 'bg-orange-500',
          text: 'text-blue-900',
          button: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'monochrome':
        return {
          bg: 'bg-gray-100',
          primary: 'bg-gray-800',
          text: 'text-gray-900',
          button: 'bg-gray-800 hover:bg-gray-900'
        };
      default:
        return {
          bg: 'bg-white',
          primary: 'bg-blue-600',
          text: 'text-gray-900',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColorScheme();

  const renderSimpleLayout = () => (
    <div className={`min-h-screen ${colors.bg} flex flex-col items-center justify-center p-8`}>
      <div className="max-w-4xl w-full text-center">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={genre}
            className="w-full max-w-2xl mx-auto h-96 object-cover rounded-lg shadow-lg mb-8"
          />
        )}
        <h1 className={`text-5xl font-bold ${colors.text} mb-4`}>
          {catchphrase}
        </h1>
        {subDescription && (
          <p className={`text-xl ${colors.text} opacity-80 mb-8 max-w-2xl mx-auto`}>
            {subDescription}
          </p>
        )}
        <a
          href={ctaLink || '#'}
          className={`inline-block px-8 py-4 text-white ${colors.button} rounded-lg text-xl font-semibold transition-colors`}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );

  const renderImageFocusLayout = () => (
    <div
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 text-center p-8">
        <h1 className="text-6xl font-bold text-white mb-6">
          {catchphrase}
        </h1>
        {subDescription && (
          <p className="text-2xl text-white opacity-90 mb-8 max-w-3xl mx-auto">
            {subDescription}
          </p>
        )}
        <a
          href={ctaLink || '#'}
          className={`inline-block px-10 py-5 text-white ${colors.button} rounded-lg text-xl font-semibold transition-colors`}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );

  const renderBusinessLayout = () => (
    <div className={`min-h-screen ${colors.bg} flex items-center p-8`}>
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className={`text-5xl font-bold ${colors.text} mb-6`}>
            {catchphrase}
          </h1>
          {subDescription && (
            <p className={`text-xl ${colors.text} opacity-80 mb-8`}>
              {subDescription}
            </p>
          )}
          <a
            href={ctaLink || '#'}
            className={`inline-block px-8 py-4 text-white ${colors.button} rounded-lg text-xl font-semibold transition-colors`}
          >
            {ctaText}
          </a>
        </div>
        <div>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={genre}
              className="w-full h-full object-cover rounded-lg shadow-xl"
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderCardLayout = () => (
    <div className={`min-h-screen ${colors.bg} p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold ${colors.text} mb-4`}>
            {catchphrase}
          </h1>
          {subDescription && (
            <p className={`text-xl ${colors.text} opacity-80 max-w-3xl mx-auto`}>
              {subDescription}
            </p>
          )}
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={genre}
            className="w-full max-w-4xl mx-auto h-96 object-cover rounded-lg shadow-lg mb-12"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className={`w-16 h-16 ${colors.primary} rounded-full mb-4`}></div>
            <h3 className="text-xl font-semibold mb-2">サービス1</h3>
            <p className="text-gray-600">高品質なサービスを提供します。</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className={`w-16 h-16 ${colors.primary} rounded-full mb-4`}></div>
            <h3 className="text-xl font-semibold mb-2">サービス2</h3>
            <p className="text-gray-600">お客様のニーズに応えます。</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className={`w-16 h-16 ${colors.primary} rounded-full mb-4`}></div>
            <h3 className="text-xl font-semibold mb-2">サービス3</h3>
            <p className="text-gray-600">満足度No.1を目指します。</p>
          </div>
        </div>

        <div className="text-center">
          <a
            href={ctaLink || '#'}
            className={`inline-block px-10 py-5 text-white ${colors.button} rounded-lg text-xl font-semibold transition-colors`}
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );

  const renderLayout = () => {
    switch(layout) {
      case 'simple':
        return renderSimpleLayout();
      case 'image-focus':
        return renderImageFocusLayout();
      case 'business':
        return renderBusinessLayout();
      case 'card':
        return renderCardLayout();
      default:
        return renderSimpleLayout();
    }
  };

  return (
    <div className="w-full">
      {renderLayout()}
    </div>
  );
};

export default LPPreview;