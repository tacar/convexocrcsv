// デザイン強化ユーティリティ

export const getAdvancedColorScheme = (colorTheme: string, _genre: string) => {
  const baseSchemes = {
    pastel: {
      bg: 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50',
      primary: 'bg-gradient-to-r from-pink-500 to-purple-600',
      secondary: 'bg-pink-50/80 backdrop-blur-sm',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      button: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl',
      card: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
    },
    luxury: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
      primary: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      secondary: 'bg-gray-800/80 backdrop-blur-sm',
      text: 'text-gray-100',
      textSecondary: 'text-gray-300',
      button: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25',
      card: 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
    },
    natural: {
      bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      primary: 'bg-gradient-to-r from-green-600 to-emerald-700',
      secondary: 'bg-green-50/80 backdrop-blur-sm',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      button: 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl',
      card: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
    },
    pop: {
      bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-orange-50',
      primary: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      secondary: 'bg-blue-50/80 backdrop-blur-sm',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      button: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl',
      card: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
    },
    monochrome: {
      bg: 'bg-gradient-to-br from-gray-100 via-gray-50 to-white',
      primary: 'bg-gradient-to-r from-gray-800 to-gray-900',
      secondary: 'bg-gray-50/80 backdrop-blur-sm',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      button: 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl',
      card: 'bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
    }
  };

  return baseSchemes[colorTheme as keyof typeof baseSchemes] || baseSchemes.natural;
};

export const getGenreSpecificIcons = (genre: string) => {
  const icons = {
    'IT会社 / SaaS / スタートアップ': ['💻', '🚀', '⚡', '🔒', '📈', '🤖'],
    '美容室 / サロン / ネイル / エステ': ['✨', '💅', '💆', '🌸', '💄', '🎨'],
    'カフェ / レストラン': ['☕', '🍰', '🥐', '🌿', '☘️', '🍽️'],
    'ジム / ヨガ / スポーツ': ['💪', '🏃', '🧘', '🏋️', '⚡', '🎯'],
    '教育 / スクール / 習い事': ['📚', '🎓', '💡', '🎯', '📖', '✏️'],
    '医療 / クリニック': ['🏥', '⚕️', '💊', '❤️', '🔬', '🩺'],
    'イベント / コミュニティ': ['🎉', '👥', '🎪', '🌟', '🎊', '🤝']
  };

  return icons[genre as keyof typeof icons] || ['⭐', '💫', '🌟', '✨', '🎯', '💎'];
};

export const getAnimationClasses = () => {
  return {
    fadeInUp: 'animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0',
    slideInLeft: 'animate-[slideInLeft_0.8s_ease-out_forwards] opacity-0',
    slideInRight: 'animate-[slideInRight_0.8s_ease-out_forwards] opacity-0',
    bounceIn: 'animate-[bounceIn_1s_ease-out_forwards] opacity-0',
    pulse: 'animate-pulse',
    float: 'animate-[float_6s_ease-in-out_infinite]'
  };
};

export const generateCustomCSS = () => {
  return `
    <style>
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }

      .scrollspy-section {
        scroll-margin-top: 80px;
      }

      .glass-effect {
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }

      .text-shadow {
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      }

      .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .hover-lift:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      }
    </style>
  `;
};