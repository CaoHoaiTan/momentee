'use client';

import React, { useState } from 'react';

interface Section {
  id: string;
  label: string;
  icon: string;
  required?: boolean;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: 'hero', label: 'Hero', icon: '🏔️', required: true },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️' },
  { id: 'albums', label: 'Albums', icon: '📸' },
  { id: 'wishes', label: 'Wishes', icon: '💌' },
  { id: 'quiz', label: 'Quiz', icon: '🧩' },
  { id: 'events', label: 'Events', icon: '🎉' },
  { id: 'gifts', label: 'Gift Registry', icon: '🎁' },
];

interface SectionReorderProps {
  value: string[];
  onChange: (order: string[]) => void;
}

export function SectionReorder({ value, onChange }: SectionReorderProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const sections = (() => {
    if (value.length === 0) return DEFAULT_SECTIONS;
    const fromSaved = value.map((id) => DEFAULT_SECTIONS.find((s) => s.id === id)).filter(Boolean) as Section[];
    // Append any new sections not in saved order
    const missing = DEFAULT_SECTIONS.filter((s) => !value.includes(s.id));
    return [...fromSaved, ...missing];
  })();

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    const item = sections[idx];
    if (item.required) return;
    const prev = sections[idx - 1];
    if (prev.required) return;
    const newOrder = sections.map((s) => s.id);
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    onChange(newOrder);
  };

  const moveDown = (idx: number) => {
    if (idx >= sections.length - 1) return;
    const item = sections[idx];
    if (item.required) return;
    const newOrder = sections.map((s) => s.id);
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    onChange(newOrder);
  };

  const handleDragStart = (idx: number) => {
    if (sections[idx].required) return;
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || sections[idx].required) return;
  };

  const handleDrop = (idx: number) => {
    if (dragIdx === null || sections[idx].required) return;
    const newOrder = sections.map((s) => s.id);
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    onChange(newOrder);
    setDragIdx(null);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Section Order
      </label>
      <p className="mb-3 text-xs text-gray-400">
        Drag or use arrows to reorder sections on your page.
      </p>
      <div className="space-y-1.5">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            draggable={!section.required}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => setDragIdx(null)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
              dragIdx === idx
                ? 'border-[var(--color-coral)] bg-[var(--color-coral)]/5 opacity-60'
                : 'border-gray-200 bg-white'
            } ${section.required ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
          >
            {/* Drag handle */}
            <span className="text-gray-300">
              {section.required ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
                </svg>
              )}
            </span>

            <span className="text-lg">{section.icon}</span>
            <span className="flex-1 text-sm font-medium text-gray-700">
              {section.label}
              {section.required && (
                <span className="ml-2 text-[10px] text-gray-400">(fixed)</span>
              )}
            </span>

            {/* Up/Down arrows */}
            {!section.required && (
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx <= 1}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx >= sections.length - 1}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const DEFAULT_SECTION_ORDER = DEFAULT_SECTIONS.map((s) => s.id);
