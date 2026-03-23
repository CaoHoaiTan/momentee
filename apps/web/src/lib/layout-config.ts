import type { HeroStyle, TimelineLayout, GalleryMode, WishDisplayMode, ThemeConfig } from './themes';

export interface LayoutConfig {
  sectionOrder?: string[];
  heroStyle?: HeroStyle;
  timelineLayout?: TimelineLayout;
  galleryMode?: GalleryMode;
  wishDisplay?: WishDisplayMode;
  customCss?: string;
}

export function parseLayoutConfig(raw: string | null | undefined): LayoutConfig {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as LayoutConfig;
  } catch {
    return {};
  }
}

export function serializeLayoutConfig(config: LayoutConfig): string {
  return JSON.stringify(config);
}

export function mergeWithThemeDefaults(
  config: LayoutConfig,
  theme: ThemeConfig,
): Required<Pick<LayoutConfig, 'heroStyle' | 'timelineLayout' | 'galleryMode' | 'wishDisplay'>> & Pick<LayoutConfig, 'sectionOrder' | 'customCss'> {
  return {
    sectionOrder: config.sectionOrder,
    heroStyle: config.heroStyle ?? theme.layout.hero,
    timelineLayout: config.timelineLayout ?? theme.layout.timeline,
    galleryMode: config.galleryMode ?? theme.layout.gallery,
    wishDisplay: config.wishDisplay ?? theme.layout.wishDisplay,
    customCss: config.customCss,
  };
}
