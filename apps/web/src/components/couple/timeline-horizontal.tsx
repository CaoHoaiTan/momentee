'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  date: string;
  icon: string | null;
  photo: string | null;
  sortOrder: number;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TimelineHorizontal({ milestones }: { milestones: Milestone[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-thin"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="flex-none"
            style={{ scrollSnapAlign: 'center' }}
          >
            <div
              className="relative w-64 overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md sm:w-72"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              {/* Film strip holes */}
              <div className="flex justify-between px-2 py-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-3 rounded-sm"
                    style={{ background: 'var(--theme-border)' }}
                  />
                ))}
              </div>

              {/* Photo area */}
              {milestone.photo ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={milestone.photo}
                    alt={milestone.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className="flex aspect-[4/3] items-center justify-center text-5xl"
                  style={{
                    background: `linear-gradient(135deg, var(--color-coral), var(--color-orange))`,
                    opacity: 0.15,
                  }}
                >
                  <span style={{ opacity: 1 }}>{milestone.icon || '💕'}</span>
                </div>
              )}

              {/* Bottom film strip holes */}
              <div className="flex justify-between px-2 py-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-3 rounded-sm"
                    style={{ background: 'var(--theme-border)' }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="p-4 pt-0">
                <p className="text-xs font-medium" style={{ color: 'var(--color-coral)' }}>
                  {formatDate(milestone.date)}
                </p>
                <h3 className="mt-1 text-base font-semibold" style={{ color: 'var(--theme-text)' }}>
                  {milestone.title}
                </h3>
                {milestone.description && (
                  <p className="mt-1 line-clamp-2 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-0.5"
        style={{
          background: `linear-gradient(to right, var(--color-coral), var(--color-orange))`,
          opacity: 0.2,
        }}
      />
    </div>
  );
}
