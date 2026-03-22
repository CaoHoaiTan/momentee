'use client';

import React from 'react';

interface MediaData {
  id: string;
  url: string;
  type: string;
}

export interface PostData {
  id: string;
  coupleId: string;
  caption: string | null;
  type: string;
  visibility: string;
  isPinned: boolean;
  media: MediaData[];
  createdAt: string;
}

interface PostCardProps {
  post: PostData;
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

const TYPE_LABELS: Record<string, string> = {
  photo: 'Photo',
  video: 'Video',
  story: 'Story',
  letter: 'Letter',
  milestone: 'Milestone',
};

const VISIBILITY_ICONS: Record<string, string> = {
  public: '🌍',
  friends_only: '👥',
  private: '🔒',
};

function ImageGrid({ media }: { media: MediaData[] }) {
  const count = media.length;

  if (count === 0) return null;

  if (count === 1) {
    return (
      <img
        src={media[0].url}
        alt=""
        loading="lazy"
        className="aspect-video w-full rounded-xl object-cover"
      />
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {media.slice(0, 2).map((m) => (
          <img key={m.id} src={m.url} alt="" loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-1">
        <img src={media[0].url} alt="" loading="lazy" className="row-span-2 h-full w-full rounded-lg object-cover" />
        <img src={media[1].url} alt="" loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
        <img src={media[2].url} alt="" loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
      </div>
    );
  }

  // 4+ images: 2x2 grid with overlay
  return (
    <div className="grid grid-cols-2 gap-1">
      {media.slice(0, 4).map((m, i) => (
        <div key={m.id} className="relative aspect-square">
          <img src={m.url} alt="" loading="lazy" className="h-full w-full rounded-lg object-cover" />
          {i === 3 && count > 4 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <span className="text-xl font-bold text-white">+{count - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PostCard({ post, onDelete, isOwner = false }: PostCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
      {isOwner && onDelete && (
        <button
          onClick={() => onDelete(post.id)}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      <div className="p-3">
        <ImageGrid media={post.media} />
      </div>

      {post.caption && (
        <div className="px-4 pb-2">
          <p className="line-clamp-3 text-sm text-gray-700">{post.caption}</p>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 pb-3">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {TYPE_LABELS[post.type] ?? post.type}
        </span>
        <span className="text-xs">{VISIBILITY_ICONS[post.visibility] ?? ''}</span>
        <span className="ml-auto text-xs text-gray-400">{relativeTime(post.createdAt)}</span>
      </div>
    </div>
  );
}
