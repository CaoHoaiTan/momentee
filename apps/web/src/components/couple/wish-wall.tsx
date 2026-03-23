'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { WishData } from './wish-card';

interface WishWallProps {
  wishes: WishData[];
  onDelete?: (id: string) => void;
  isOwner?: boolean;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function WishWall({ wishes, onDelete, isOwner = false }: WishWallProps) {
  // Split into 2 columns for masonry
  const cols: WishData[][] = [[], []];
  wishes.forEach((w, i) => cols[i % 2].push(w));

  return (
    <div className="flex gap-3">
      {cols.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-1 flex-col gap-3">
          {col.map((wish, rowIdx) => {
            const globalIdx = rowIdx * 2 + colIdx;
            // Vary card sizes based on message length
            const isLarge = wish.message.length > 120;
            const isTiny = wish.message.length < 40;

            return (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: globalIdx * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-md"
                style={{
                  background: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                {isOwner && onDelete && (
                  <button
                    onClick={() => onDelete(wish.id)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                    style={{ background: 'var(--theme-border)' }}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Emoji (large for big cards) */}
                {wish.emoji && (
                  <span className={isLarge ? 'mb-2 block text-3xl' : 'mb-1 block text-xl'}>
                    {wish.emoji}
                  </span>
                )}

                {/* Message */}
                <p
                  className={`leading-relaxed ${isTiny ? 'text-base font-medium' : isLarge ? 'text-sm' : 'text-sm'}`}
                  style={{ color: 'var(--theme-text)' }}
                >
                  {wish.message}
                </p>

                {/* Author + time */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                    {wish.isAnonymous ? 'Anonymous' : wish.authorName}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--theme-text-muted)', opacity: 0.4 }}>
                    {relativeTime(wish.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
