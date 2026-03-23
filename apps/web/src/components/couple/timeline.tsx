'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { TimelineLayout } from '../../lib/themes';
import { TimelineHorizontal } from './timeline-horizontal';
import { TimelineImmersive } from './timeline-immersive';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  date: string;
  icon: string | null;
  photo: string | null;
  sortOrder: number;
}

interface TimelineProps {
  milestones: Milestone[];
  layout?: TimelineLayout;
  isOwner?: boolean;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (id: string) => void;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function Timeline({ milestones, layout = 'alternating', isOwner = false, onEdit, onDelete }: TimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 text-5xl">📅</div>
        <p className="text-lg font-medium" style={{ color: 'var(--theme-text-muted)' }}>No milestones yet</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)', opacity: 0.7 }}>
          {isOwner
            ? 'Add your first milestone to start building your love story timeline.'
            : 'This couple hasn\'t added any milestones yet.'}
        </p>
      </div>
    );
  }

  // For non-owner views, delegate to layout variants
  if (!isOwner) {
    if (layout === 'horizontal') return <TimelineHorizontal milestones={milestones} />;
    if (layout === 'immersive') return <TimelineImmersive milestones={milestones} />;
  }

  return (
    <div className="relative">
      {/* Central line */}
      <div className="absolute left-6 top-0 hidden h-full w-0.5 bg-gradient-to-b from-[var(--color-coral)] via-[var(--color-gold)] to-[var(--color-teal)] md:left-1/2 md:block md:-translate-x-px" />
      <div className="absolute left-6 top-0 block h-full w-0.5 bg-gradient-to-b from-[var(--color-coral)] via-[var(--color-gold)] to-[var(--color-teal)] md:hidden" />

      <div className="space-y-8 md:space-y-12">
        {milestones.map((milestone, index) => {
          const isRight = index % 2 === 1;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex items-start gap-4 md:gap-0"
            >
              {/* Mobile: icon on left */}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[var(--color-coral)] text-lg shadow-md md:absolute md:left-1/2 md:-translate-x-1/2">
                {milestone.icon || '💕'}
              </div>

              {/* Desktop: content alternating */}
              <div
                className={`flex-1 md:w-[calc(50%-2rem)] ${
                  isRight ? 'md:ml-auto md:pl-10' : 'md:mr-auto md:pr-10 md:text-right'
                }`}
              >
                <div
                  className="rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{
                    background: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: 'var(--color-coral)' }}>
                    {formatDate(milestone.date)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
                    {milestone.title}
                  </h3>
                  {milestone.description && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                      {milestone.description}
                    </p>
                  )}

                  {isOwner && (
                    <div className={`mt-3 flex gap-2 ${isRight ? '' : 'md:justify-end'}`}>
                      <button
                        onClick={() => onEdit?.(milestone)}
                        className="rounded-lg px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete?.(milestone.id)}
                        className="rounded-lg px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
