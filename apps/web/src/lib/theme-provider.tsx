'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { type ThemeConfig, getTheme } from './themes';

const ThemeContext = createContext<ThemeConfig | null>(null);

export function useTheme(): ThemeConfig {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return getTheme('sunset-coral');
  }
  return ctx;
}

interface ThemeProviderProps {
  themeId: string;
  children: React.ReactNode;
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  const theme = useMemo(() => getTheme(themeId), [themeId]);

  const style = useMemo(
    () =>
      ({
        '--color-coral': theme.colors.primary,
        '--color-coral-dark': theme.colors.secondary,
        '--color-coral-light': theme.colors.primary + '66',
        '--color-orange': theme.colors.accent,
        '--color-orange-dark': theme.colors.accent,
        '--theme-bg': theme.colors.bg,
        '--theme-surface': theme.colors.surface,
        '--theme-text': theme.colors.text,
        '--theme-text-muted': theme.colors.textMuted,
        '--theme-border': theme.colors.border,
        '--theme-font-display': theme.fonts.display,
        '--theme-font-body': theme.fonts.body,
        background: theme.colors.bg,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
      }) as React.CSSProperties,
    [theme],
  );

  return (
    <ThemeContext.Provider value={theme}>
      <div style={style} className="min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
