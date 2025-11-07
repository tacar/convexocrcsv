export interface LPSection {
  id: string;
  title: string;
  content: string;
  type: 'hero' | 'features' | 'benefits' | 'testimonials' | 'about' | 'pricing' | 'faq' | 'contact' | 'cta';
  order: number;
}

export interface LPContent {
  hero: {
    serviceName?: string;
    catchphrase: string;
    subDescription: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  benefits: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  testimonials: {
    title: string;
    items: Array<{
      name: string;
      role: string;
      comment: string;
      rating: number;
    }>;
  };
  about: {
    title: string;
    description: string;
    image?: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    plans: Array<{
      name: string;
      price: string;
      features: string[];
      popular?: boolean;
    }>;
  };
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  contact: {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
}

export interface LPFormData {
  genre: string;
  colorTheme: string;
  customColor?: string;
  mainPhoto: string;
  catchphrase: string;
  subDescription: string;
  layout: string;
  ctaText: string;
  ctaLink: string;
  serviceName?: string;
  companyName?: string;
  industry?: string;
  targetAudience?: string;
  keyFeatures?: string[];
}