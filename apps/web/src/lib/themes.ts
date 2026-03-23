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
