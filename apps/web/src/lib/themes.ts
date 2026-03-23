export type TimelineLayout = 'alternating' | 'horizontal' | 'immersive';
export type GalleryMode = 'grid' | 'masonry' | 'polaroid';
export type WishDisplayMode = 'cards' | 'wall';
export type CardStyle = 'elevated' | 'glass' | 'outlined' | 'neon';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  particles: 'hearts' | 'stars' | 'shapes' | 'none';
  divider: 'wave' | 'diagonal' | 'thin-line' | 'glitch';
  isDark: boolean;
  layout: {
    timeline: TimelineLayout;
    gallery: GalleryMode;
    wishDisplay: WishDisplayMode;
    cardStyle: CardStyle;
  };
}

export const themes: Record<string, ThemeConfig> = {
  'sunset-coral': {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    description: 'Warm romantic vibes',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FF8E53',
      accent: '#FFD166',
      bg: '#FFF8F5',
      surface: '#FFFFFF',
      text: '#1C1917',
      textMuted: '#78716C',
      border: '#FDE8E0',
    },
    fonts: {
      display: 'var(--font-sora), sans-serif',
      body: 'var(--font-outfit), sans-serif',
    },
    particles: 'hearts',
    divider: 'wave',
    isDark: false,
    layout: {
      timeline: 'alternating',
      gallery: 'grid',
      wishDisplay: 'cards',
      cardStyle: 'elevated',
    },
  },
  'midnight-garden': {
    id: 'midnight-garden',
    name: 'Midnight Garden',
    description: 'Dark elegant',
    colors: {
      primary: '#E879F9',
      secondary: '#A78BFA',
      accent: '#67E8F9',
      bg: '#0F0F23',
      surface: 'rgba(255,255,255,0.06)',
      text: '#F1F5F9',
      textMuted: '#94A3B8',
      border: 'rgba(255,255,255,0.1)',
    },
    fonts: {
      display: 'var(--font-playfair-display), serif',
      body: 'var(--font-poppins), sans-serif',
    },
    particles: 'stars',
    divider: 'diagonal',
    isDark: true,
    layout: {
      timeline: 'immersive',
      gallery: 'masonry',
      wishDisplay: 'wall',
      cardStyle: 'glass',
    },
  },
  'minimal-luxe': {
    id: 'minimal-luxe',
    name: 'Minimal Luxe',
    description: 'Clean editorial',
    colors: {
      primary: '#1C1917',
      secondary: '#B8860B',
      accent: '#B8860B',
      bg: '#FFFFFF',
      surface: '#FAFAF9',
      text: '#1C1917',
      textMuted: '#78716C',
      border: '#E7E5E4',
    },
    fonts: {
      display: 'var(--font-cormorant-garamond), serif',
      body: 'var(--font-jost), sans-serif',
    },
    particles: 'none',
    divider: 'thin-line',
    isDark: false,
    layout: {
      timeline: 'alternating',
      gallery: 'polaroid',
      wishDisplay: 'cards',
      cardStyle: 'outlined',
    },
  },
  'neon-love': {
    id: 'neon-love',
    name: 'Neon Love',
    description: 'Bold Gen-Z energy',
    colors: {
      primary: '#F43F5E',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      bg: '#0A0A0F',
      surface: 'rgba(255,255,255,0.05)',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      border: 'rgba(255,255,255,0.08)',
    },
    fonts: {
      display: 'var(--font-unbounded), sans-serif',
      body: 'var(--font-inter-tight), sans-serif',
    },
    particles: 'shapes',
    divider: 'glitch',
    isDark: true,
    layout: {
      timeline: 'horizontal',
      gallery: 'masonry',
      wishDisplay: 'wall',
      cardStyle: 'neon',
    },
  },
  'ocean-breeze': {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Fresh coastal calm',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#67E8F9',
      bg: '#F0F9FF',
      surface: 'rgba(255,255,255,0.8)',
      text: '#0C4A6E',
      textMuted: '#64748B',
      border: '#BAE6FD',
    },
    fonts: {
      display: 'var(--font-sora), sans-serif',
      body: 'var(--font-outfit), sans-serif',
    },
    particles: 'stars',
    divider: 'wave',
    isDark: false,
    layout: {
      timeline: 'alternating',
      gallery: 'grid',
      wishDisplay: 'cards',
      cardStyle: 'glass',
    },
  },
  'retro-film': {
    id: 'retro-film',
    name: 'Retro Film',
    description: 'Nostalgic analog warmth',
    colors: {
      primary: '#D97706',
      secondary: '#B45309',
      accent: '#F59E0B',
      bg: '#FAF3E8',
      surface: '#FFFBF0',
      text: '#451A03',
      textMuted: '#92400E',
      border: '#E8D5B7',
    },
    fonts: {
      display: 'var(--font-playfair-display), serif',
      body: 'var(--font-outfit), sans-serif',
    },
    particles: 'none',
    divider: 'thin-line',
    isDark: false,
    layout: {
      timeline: 'horizontal',
      gallery: 'polaroid',
      wishDisplay: 'cards',
      cardStyle: 'elevated',
    },
  },
  'cherry-blossom': {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Soft Japanese-inspired',
    colors: {
      primary: '#FB7185',
      secondary: '#FDA4AF',
      accent: '#FFF1F2',
      bg: '#FFF5F7',
      surface: '#FFFFFF',
      text: '#881337',
      textMuted: '#BE185D',
      border: '#FECDD3',
    },
    fonts: {
      display: 'var(--font-cormorant-garamond), serif',
      body: 'var(--font-jost), sans-serif',
    },
    particles: 'hearts',
    divider: 'wave',
    isDark: false,
    layout: {
      timeline: 'immersive',
      gallery: 'masonry',
      wishDisplay: 'wall',
      cardStyle: 'elevated',
    },
  },
  'forest-romance': {
    id: 'forest-romance',
    name: 'Forest Romance',
    description: 'Natural earthy organic',
    colors: {
      primary: '#166534',
      secondary: '#15803D',
      accent: '#86EFAC',
      bg: '#FEFCE8',
      surface: '#FFFFFF',
      text: '#14532D',
      textMuted: '#4D7C0F',
      border: '#D9F99D',
    },
    fonts: {
      display: 'var(--font-playfair-display), serif',
      body: 'var(--font-poppins), sans-serif',
    },
    particles: 'none',
    divider: 'diagonal',
    isDark: false,
    layout: {
      timeline: 'immersive',
      gallery: 'masonry',
      wishDisplay: 'cards',
      cardStyle: 'elevated',
    },
  },
  'groovy-y2k': {
    id: 'groovy-y2k',
    name: 'Groovy Y2K',
    description: 'Fun playful 2000s nostalgia',
    colors: {
      primary: '#E879F9',
      secondary: '#34D399',
      accent: '#FBBF24',
      bg: '#F3E8FF',
      surface: '#FFFFFF',
      text: '#581C87',
      textMuted: '#7E22CE',
      border: '#E9D5FF',
    },
    fonts: {
      display: 'var(--font-unbounded), sans-serif',
      body: 'var(--font-poppins), sans-serif',
    },
    particles: 'shapes',
    divider: 'wave',
    isDark: false,
    layout: {
      timeline: 'horizontal',
      gallery: 'grid',
      wishDisplay: 'wall',
      cardStyle: 'elevated',
    },
  },
  'boho-dreamcatcher': {
    id: 'boho-dreamcatcher',
    name: 'Boho Dream',
    description: 'Free-spirited warm handmade',
    colors: {
      primary: '#C2410C',
      secondary: '#D97706',
      accent: '#78716C',
      bg: '#FDF4E7',
      surface: '#FFFBF5',
      text: '#431407',
      textMuted: '#92400E',
      border: '#E7D4BE',
    },
    fonts: {
      display: 'var(--font-caveat), cursive',
      body: 'var(--font-outfit), sans-serif',
    },
    particles: 'none',
    divider: 'thin-line',
    isDark: false,
    layout: {
      timeline: 'alternating',
      gallery: 'polaroid',
      wishDisplay: 'cards',
      cardStyle: 'outlined',
    },
  },
  'k-drama-romance': {
    id: 'k-drama-romance',
    name: 'K-Drama',
    description: 'Sweet cinematic pastel',
    colors: {
      primary: '#F472B6',
      secondary: '#E9D5FF',
      accent: '#FDF2F8',
      bg: '#FDF2F8',
      surface: 'rgba(255,255,255,0.9)',
      text: '#831843',
      textMuted: '#BE185D',
      border: '#FBCFE8',
    },
    fonts: {
      display: 'var(--font-cormorant-garamond), serif',
      body: 'var(--font-poppins), sans-serif',
    },
    particles: 'hearts',
    divider: 'wave',
    isDark: false,
    layout: {
      timeline: 'alternating',
      gallery: 'masonry',
      wishDisplay: 'wall',
      cardStyle: 'glass',
    },
  },
  'art-deco-gold': {
    id: 'art-deco-gold',
    name: 'Art Deco',
    description: 'Gatsby-era glamour',
    colors: {
      primary: '#B8860B',
      secondary: '#DAA520',
      accent: '#F5F0E8',
      bg: '#1C1917',
      surface: 'rgba(255,255,255,0.05)',
      text: '#F5F0E8',
      textMuted: '#A8A29E',
      border: 'rgba(184,134,11,0.2)',
    },
    fonts: {
      display: 'var(--font-cormorant-garamond), serif',
      body: 'var(--font-jost), sans-serif',
    },
    particles: 'stars',
    divider: 'diagonal',
    isDark: true,
    layout: {
      timeline: 'immersive',
      gallery: 'grid',
      wishDisplay: 'cards',
      cardStyle: 'outlined',
    },
  },
};

const legacyThemeMap: Record<string, string> = {
  coral: 'sunset-coral',
  teal: 'midnight-garden',
  purple: 'midnight-garden',
  gold: 'minimal-luxe',
  orange: 'sunset-coral',
};

export function resolveThemeId(raw: string | null | undefined): string {
  if (!raw) return 'sunset-coral';
  if (themes[raw]) return raw;
  return legacyThemeMap[raw] ?? 'sunset-coral';
}

export function getTheme(raw: string | null | undefined): ThemeConfig {
  return themes[resolveThemeId(raw)];
}
