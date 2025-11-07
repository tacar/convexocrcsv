import React, { useEffect } from 'react';
import { LPContent } from '../types/lpTypes';
import { getAdvancedColorScheme, getGenreSpecificIcons } from '../utils/designEnhancements';

interface FullLPPreviewProps {
  content: LPContent;
  colorTheme: string;
  imageUrl: string;
  genre?: string;
}

const FullLPPreview: React.FC<FullLPPreviewProps> = ({
  content,
  colorTheme,
  imageUrl,
  genre = ''
}) => {
  const colors = getAdvancedColorScheme(colorTheme, genre);
  const icons = getGenreSpecificIcons(genre);

  // スムーズスクロール機能
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navHeight = 80; // ナビゲーションバーの高さ
      const elementPosition = element.offsetTop - navHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // CSSアニメーション追加
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }

      .fade-in-up {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }

      .fade-in-up.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .nav-link {
        position: relative;
        transition: all 0.3s ease;
      }

      .nav-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
        transition: width 0.3s ease;
      }

      .nav-link:hover::after {
        width: 100%;
      }

      .scroll-indicator {
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
        z-index: 999;
        transition: width 0.1s ease;
      }
    `;
    document.head.appendChild(style);

    // スクロール進捗インジケーター
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      const indicator = document.getElementById('scroll-indicator');
      if (indicator) {
        indicator.style.width = scrollPercent + '%';
      }

      // 要素の可視化アニメーション
      const elements = document.querySelectorAll('.fade-in-up');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初期実行

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(style);
    };
  }, []);

  // 強化されたカラースキームを使用（古いgetColorScheme関数は削除）

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* スクロール進捗インジケーター */}
      <div id="scroll-indicator" className="scroll-indicator"></div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white backdrop-blur-md shadow-lg z-50 border-b-2 border-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-gray-700 cursor-pointer flex items-center" onClick={(e) => handleSmoothScroll(e as any, 'hero')} style={{color: '#374151 !important', fontWeight: '700 !important'}}>
              <span style={{color: '#374151 !important', fontSize: '1.5rem', marginRight: '8px'}}>{icons[0]}</span>
              <span style={{color: '#374151 !important', fontWeight: '700 !important'}}>{content.hero.serviceName || 'Your Service'}</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="nav-link font-semibold hover:text-gray-800 transition-colors cursor-pointer"
                onClick={(e) => handleSmoothScroll(e, 'features')}
                style={{color: '#4B5563 !important', fontWeight: '600 !important', textDecoration: 'none'}}
              >
                特徴
              </a>
              <a
                href="#benefits"
                className="nav-link font-semibold hover:text-gray-800 transition-colors cursor-pointer"
                onClick={(e) => handleSmoothScroll(e, 'benefits')}
                style={{color: '#4B5563 !important', fontWeight: '600 !important', textDecoration: 'none'}}
              >
                メリット
              </a>
              <a
                href="#testimonials"
                className="nav-link font-semibold hover:text-gray-800 transition-colors cursor-pointer"
                onClick={(e) => handleSmoothScroll(e, 'testimonials')}
                style={{color: '#4B5563 !important', fontWeight: '600 !important', textDecoration: 'none'}}
              >
                お客様の声
              </a>
              <a
                href="#pricing"
                className="nav-link font-semibold hover:text-gray-800 transition-colors cursor-pointer"
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                style={{color: '#4B5563 !important', fontWeight: '600 !important', textDecoration: 'none'}}
              >
                料金
              </a>
              <a
                href="#contact"
                className="nav-link font-semibold hover:text-gray-800 transition-colors cursor-pointer"
                onClick={(e) => handleSmoothScroll(e, 'contact')}
                style={{color: '#4B5563 !important', fontWeight: '600 !important', textDecoration: 'none'}}
              >
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-6 text-center text-white relative z-10">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            {content.hero.catchphrase}
          </h1>
          <p className="text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            {content.hero.subDescription}
          </p>
          <a
            href={content.hero.ctaLink}
            className={`inline-block px-10 py-5 ${colors.button} text-white text-xl font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg`}
          >
            {content.hero.ctaText}
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 ${colors.secondary || colors.bg} scroll-mt-20`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 fade-in-up">
            <h2 className={`text-4xl font-bold ${colors.text} mb-4`}>
              {content.features.title}
            </h2>
            <p className={`text-xl ${colors.textSecondary}`}>
              {content.features.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(content.features.items || []).map((feature, index) => (
              <div key={index} className={`${colors.card} p-8 rounded-lg shadow-lg text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 fade-in-up`} style={{ animationDelay: `${index * 0.2}s` }}>
                <div className={`w-16 h-16 ${colors.primary} rounded-full mx-auto mb-6 flex items-center justify-center`}>
                  <span className="text-white text-2xl">{icons[index] || '⭐'}</span>
                </div>
                <h3 className={`text-2xl font-semibold ${colors.text} mb-4`}>
                  {feature.title}
                </h3>
                <p className={`${colors.textSecondary} leading-relaxed`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={`py-20 ${colors.bg} scroll-mt-20`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 fade-in-up">
            <h2 className={`text-4xl font-bold ${colors.text} mb-4`}>
              {content.benefits.title}
            </h2>
            <p className={`text-xl ${colors.textSecondary}`}>
              {content.benefits.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(content.benefits.items || []).map((benefit, index) => (
              <div key={index} className={`${colors.card} p-8 rounded-lg shadow-lg fade-in-up`} style={{ animationDelay: `${index * 0.2}s` }}>
                <h3 className={`text-2xl font-semibold ${colors.text} mb-4`}>
                  {benefit.title}
                </h3>
                <p className={`${colors.textSecondary} leading-relaxed`}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-20 ${colors.secondary || colors.bg} scroll-mt-20`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 fade-in-up">
            <h2 className={`text-4xl font-bold ${colors.text} mb-4`}>
              {content.testimonials.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(content.testimonials.items || []).map((testimonial, index) => (
              <div key={index} className={`${colors.card} p-8 rounded-lg shadow-lg fade-in-up`} style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className={`${colors.textSecondary} mb-6 italic leading-relaxed`}>
                  "{testimonial.comment}"
                </p>
                <div>
                  <h4 className={`font-semibold ${colors.text}`}>
                    {testimonial.name}
                  </h4>
                  <p className={`text-sm ${colors.textSecondary}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-20 ${colors.bg} scroll-mt-20`}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl font-bold ${colors.text} mb-8`}>
              {content.about.title}
            </h2>
            <p className={`text-xl ${colors.textSecondary} leading-relaxed`}>
              {content.about.description}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-20 ${colors.secondary || colors.bg} scroll-mt-20`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 fade-in-up">
            <h2 className={`text-4xl font-bold ${colors.text} mb-4`}>
              {content.pricing.title}
            </h2>
            <p className={`text-xl ${colors.textSecondary}`}>
              {content.pricing.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(content.pricing.plans || []).map((plan, index) => (
              <div
                key={index}
                className={`${colors.card} p-8 rounded-lg shadow-lg relative fade-in-up ${
                  plan.popular ? 'ring-4 ring-blue-500' : ''
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      人気
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-semibold ${colors.text} mb-2`}>
                    {plan.name}
                  </h3>
                  <p className={`text-4xl font-bold ${colors.text}`}>
                    {plan.price}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {(plan.features || []).map((feature, idx) => (
                    <li key={idx} className={`${colors.textSecondary} flex items-center`}>
                      <span className="text-green-500 mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 ${colors.button} text-white font-semibold rounded-lg transition-colors`}>
                  選択する
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={`py-20 ${colors.bg} scroll-mt-20`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 fade-in-up">
            <h2 className={`text-4xl font-bold ${colors.text} mb-4`}>
              {content.faq.title}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {(content.faq.items || []).map((faq, index) => (
              <div key={index} className={`${colors.card} p-6 rounded-lg shadow-lg fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className={`text-xl font-semibold ${colors.text} mb-3`}>
                  Q. {faq.question}
                </h3>
                <p className={`${colors.textSecondary} leading-relaxed`}>
                  A. {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-20 ${colors.primary} scroll-mt-20`}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {content.contact.title}
          </h2>
          <p className="text-xl text-white opacity-90 mb-10 max-w-2xl mx-auto">
            {content.contact.description}
          </p>
          <a
            href={content.contact.ctaLink}
            className="inline-block px-10 py-5 bg-white text-gray-900 text-xl font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            {content.contact.ctaText}
          </a>
        </div>
      </section>
    </div>
  );
};

export default FullLPPreview;