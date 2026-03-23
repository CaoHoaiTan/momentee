'use client';

import React from 'react';
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
    month: 'long',
    day: 'numeric',
  });
}

export function TimelineImmersive({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-6">
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-2xl"
          style={{ minHeight: milestone.photo ? '280px' : undefined }}
        >
          {/* Background photo */}
          {milestone.photo ? (
            <>
              <img
                src={milestone.photo}
                alt={milestone.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, var(--color-coral), var(--color-orange))`,
                opacity: 0.12,
              }}
            />
          )}

          {/* Content overlay */}
          <div
            className={`relative flex flex-col justify-end p-6 sm:p-8 ${
              milestone.photo ? 'text-white' : ''
            }`}
            style={
              milestone.photo
                ? { minHeight: '280px' }
                : undefined
            }
          >
            {/* Date watermark */}
            <div
              className="pointer-events-none absolute right-4 top-4 font-bold opacity-[0.07] sm:right-8 sm:top-8"
              style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontFamily: 'var(--theme-font-display)',
                color: milestone.photo ? '#fff' : 'var(--color-coral)',
              }}
            >
              {new Date(milestone.date + 'T00:00:00').getFullYear()}
            </div>

            {/* Icon */}
            <span className="mb-3 text-3xl">{milestone.icon || '💕'}</span>

            {/* Date */}
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: milestone.photo ? 'rgba(255,255,255,0.7)' : 'var(--color-coral)',
              }}
            >
              {formatDate(milestone.date)}
            </p>

            {/* Title */}
            <h3
              className="mt-1 text-2xl font-bold sm:text-3xl"
              style={{
                fontFamily: 'var(--theme-font-display)',
                color: milestone.photo ? '#fff' : 'var(--theme-text)',
              }}
            >
              {milestone.title}
            </h3>

            {/* Description */}
            {milestone.description && (
              <p
                className="mt-2 max-w-lg text-sm leading-relaxed sm:text-base"
                style={{
                  color: milestone.photo ? 'rgba(255,255,255,0.8)' : 'var(--theme-text-muted)',
                }}
              >
                {milestone.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
