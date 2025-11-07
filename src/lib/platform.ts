export interface PlatformInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  userAgent: string;
}

export const detectPlatform = (): PlatformInfo => {
  const userAgent = navigator.userAgent || '';

  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /Mobile/.test(userAgent);
  const isDesktop = !isMobile;

  return {
    isMobile,
    isIOS,
    isAndroid,
    isDesktop,
    userAgent,
  };
};

export const generateInviteLinks = (token: string) => {
  const isProduction = window.location.hostname !== 'localhost';
  const baseUrl = isProduction ? 'https://codekaumono.mylastwork.net' : window.location.origin;

  return {
    universal: `${baseUrl}/invite/${token}`,
    web: `${baseUrl}/invite/${token}`,
    app: `kaumono://invite/${token}`,
    appStore: {
      ios: 'https://apps.apple.com/app/kaumono', // 仮のURL
      android: 'https://play.google.com/store/apps/details?id=com.kaumono', // 仮のURL
    }
  };
};

export const getRecommendedLink = (token: string, platform: PlatformInfo) => {
  const links = generateInviteLinks(token);

  // 現時点では全てユニバーサルリンクを推奨
  // 将来的にアプリの存在確認ができるようになったら分岐
  return {
    primary: links.universal,
    type: 'universal' as const,
    description: platform.isMobile
      ? 'アプリがあれば自動で起動、なければWebで開きます'
      : 'Webブラウザで開きます',
  };
};