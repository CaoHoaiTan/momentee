'use client';

import React from 'react';

const themes = [
  { name: 'coral', color: '#ff6b6b', label: 'Coral' },
  { name: 'teal', color: '#06d6a0', label: 'Teal' },
  { name: 'purple', color: '#7c5cfc', label: 'Purple' },
  { name: 'gold', color: '#ffd166', label: 'Gold' },
  { name: 'orange', color: '#ff8c42', label: 'Orange' },
];

interface ThemeSelectorProps {
  value: string;
  onChange: (theme: string) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Theme Color
      </label>
      <div className="flex gap-3">
        {themes.map((theme) => (
          <button
            key={theme.name}
            type="button"
            onClick={() => onChange(theme.name)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all ${
              value === theme.name
                ? 'border-gray-900 scale-110'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: theme.color }}
            title={theme.label}
          >
            {value === theme.name && (
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
