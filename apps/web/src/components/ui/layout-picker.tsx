'use client';

import React from 'react';
import type { TimelineLayout, GalleryMode, WishDisplayMode } from '../../lib/themes';

interface LayoutOption<T extends string> {
  value: T;
  label: string;
  icon: string;
  description: string;
}

interface LayoutPickerProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: LayoutOption<T>[];
}

function LayoutPicker<T extends string>({
  label,
  value,
  onChange,
  options,
}: LayoutPickerProps<T>) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition-all ${
              value === opt.value
                ? 'border-[var(--color-coral)] bg-[var(--color-coral)]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
            <span className="text-[10px] text-gray-400">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const timelineOptions: LayoutOption<TimelineLayout>[] = [
  { value: 'alternating', label: 'Classic', icon: '📜', description: 'Alternating left/right' },
  { value: 'horizontal', label: 'Film Strip', icon: '🎞️', description: 'Horizontal scroll' },
  { value: 'immersive', label: 'Immersive', icon: '🖼️', description: 'Full-width cards' },
];

const galleryOptions: LayoutOption<GalleryMode>[] = [
  { value: 'grid', label: 'Grid', icon: '⬜', description: 'Uniform squares' },
  { value: 'masonry', label: 'Masonry', icon: '🧱', description: 'Pinterest-style' },
  { value: 'polaroid', label: 'Polaroid', icon: '📸', description: 'Rotated cards' },
];

const wishOptions: LayoutOption<WishDisplayMode>[] = [
  { value: 'cards', label: 'Cards', icon: '💌', description: '2-column grid' },
  { value: 'wall', label: 'Wall', icon: '🧩', description: 'Masonry wall' },
];

export function TimelineLayoutPicker({
  value,
  onChange,
}: {
  value: TimelineLayout;
  onChange: (v: TimelineLayout) => void;
}) {
  return (
    <LayoutPicker
      label="Timeline Layout"
      value={value}
      onChange={onChange}
      options={timelineOptions}
    />
  );
}

export function GalleryModePicker({
  value,
  onChange,
}: {
  value: GalleryMode;
  onChange: (v: GalleryMode) => void;
}) {
  return (
    <LayoutPicker
      label="Gallery Style"
      value={value}
      onChange={onChange}
      options={galleryOptions}
    />
  );
}

export function WishDisplayPicker({
  value,
  onChange,
}: {
  value: WishDisplayMode;
  onChange: (v: WishDisplayMode) => void;
}) {
  return (
    <LayoutPicker
      label="Wishes Display"
      value={value}
      onChange={onChange}
      options={wishOptions}
    />
  );
}
