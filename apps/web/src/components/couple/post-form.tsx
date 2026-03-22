'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { MediaUpload, fileToBase64 } from './media-upload';
import type { MediaFile } from './media-upload';

interface PostFormData {
  caption: string;
  type: string;
  visibility: string;
  media: { file: string; type: string }[];
}

interface PostFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => void;
  loading?: boolean;
}

const POST_TYPES = [
  { value: 'photo', label: 'Photo', icon: '📷' },
  { value: 'video', label: 'Video', icon: '📹' },
  { value: 'story', label: 'Story', icon: '📖' },
  { value: 'letter', label: 'Letter', icon: '💌' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', icon: '🌍' },
  { value: 'friends_only', label: 'Friends', icon: '👥' },
  { value: 'private', label: 'Private', icon: '🔒' },
];

export function PostForm({ open, onClose, onSubmit, loading = false }: PostFormProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [caption, setCaption] = useState('');
  const [type, setType] = useState('photo');
  const [visibility, setVisibility] = useState('public');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setFiles([]);
    setCaption('');
    setType('photo');
    setVisibility('public');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setSubmitting(true);
    try {
      const mediaItems = await Promise.all(
        files.map(async (f) => ({
          file: await fileToBase64(f.file),
          type: f.type,
        })),
      );
      await onSubmit({ caption, type, visibility, media: mediaItems });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <MediaUpload files={files} onChange={setFiles} disabled={isLoading} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What's the story behind these photos?"
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  disabled={isLoading}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    type === t.value
                      ? 'bg-[var(--color-coral)] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Visibility</label>
            <div className="flex flex-wrap gap-2">
              {VISIBILITY_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setVisibility(v.value)}
                  disabled={isLoading}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    visibility === v.value
                      ? 'bg-[var(--color-coral)] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isLoading} disabled={files.length === 0}>
              Create Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
