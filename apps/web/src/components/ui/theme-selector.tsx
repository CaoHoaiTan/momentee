'use client';

import React from 'react';
import { themes, resolveThemeId, type ThemeConfig } from '../../lib/themes';

interface ThemeSelectorProps {
  value: string;
  onChange: (theme: string) => void;
}

function ThemePreviewCard({
  theme,
  isSelected,
  onClick,
}: {
  theme: ThemeConfig;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all ${
        isSelected ? 'scale-105 border-gray-900' : 'border-transparent hover:scale-[1.02]'
      }`}
      style={{ width: '100%' }}
    >
      {/* Mini preview */}
      <div
        className="flex flex-col items-center justify-center gap-1.5 px-3 py-4"
        style={{ background: theme.colors.bg }}
      >
        {/* Color dots */}
        <div className="flex gap-1">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: theme.colors.primary }}
          />
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: theme.colors.secondary }}
          />
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: theme.colors.accent }}
          />
        </div>

        {/* Mini text preview */}
        <div
          className="h-1.5 w-12 rounded-full"
          style={{ background: theme.colors.text, opacity: 0.6 }}
        />
        <div
          className="h-1 w-8 rounded-full"
          style={{ background: theme.colors.textMuted, opacity: 0.4 }}
        />
      </div>

      {/* Label */}
      <div className="border-t border-gray-100 px-2 py-1.5 text-center">
        <p className="text-xs font-medium text-gray-700">{theme.name}</p>
      </div>

      {/* Checkmark */}
      {isSelected && (
        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const resolvedId = resolveThemeId(value);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Page Theme
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.values(themes).map((theme) => (
          <ThemePreviewCard
            key={theme.id}
            theme={theme}
            isSelected={resolvedId === theme.id}
            onClick={() => onChange(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}
