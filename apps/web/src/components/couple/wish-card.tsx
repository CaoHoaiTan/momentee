'use client';

import React from 'react';

export interface WishData {
  id: string;
  coupleId: string;
  authorName: string;
  authorAvatar: string | null;
  message: string;
  emoji: string | null;
  isAnonymous: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface WishCardProps {
  wish: WishData;
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

export function WishCard({ wish, onDelete, isOwner = false }: WishCardProps) {
  return (
    <div
      className="group relative rounded-2xl p-5 shadow-sm ring-1 transition-shadow hover:shadow-md"
      style={{
        background: 'var(--theme-surface)',
        '--tw-ring-color': 'var(--theme-border)',
      } as React.CSSProperties}
    >
      {isOwner && onDelete && (
        <button
          onClick={() => onDelete(wish.id)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-3">
        {wish.emoji && <span className="text-2xl">{wish.emoji}</span>}
        <div className="flex-1">
          <p className="text-sm" style={{ color: 'var(--theme-text)' }}>{wish.message}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
              {wish.isAnonymous ? 'Anonymous' : wish.authorName}
            </span>
            <span className="text-xs" style={{ opacity: 0.3, color: 'var(--theme-text-muted)' }}>·</span>
            <span className="text-xs" style={{ opacity: 0.6, color: 'var(--theme-text-muted)' }}>{relativeTime(wish.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
