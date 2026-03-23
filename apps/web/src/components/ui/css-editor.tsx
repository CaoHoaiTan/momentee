'use client';

import React from 'react';

interface CssEditorProps {
  value: string;
  onChange: (css: string) => void;
  maxLength?: number;
}

export function CssEditor({ value, onChange, maxLength = 5000 }: CssEditorProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Custom CSS
        </label>
        <span className="text-xs text-gray-400">Premium</span>
      </div>
      <p className="mb-3 text-xs text-gray-400">
        Add custom styles scoped to your couple page. Changes apply in real-time.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={8}
        spellCheck={false}
        className="w-full rounded-xl border border-gray-200 bg-gray-950 px-4 py-3 font-mono text-xs text-green-400 outline-none transition-colors placeholder:text-gray-600 focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
        placeholder={`/* Your custom CSS */\n.couple-page {\n  /* styles here */\n}`}
      />
      <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
        <span>{value.length}/{maxLength}</span>
        <span>No @import or external URLs allowed</span>
      </div>
    </div>
  );
}
