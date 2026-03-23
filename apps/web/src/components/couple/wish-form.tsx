'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';

interface WishFormProps {
  onSubmit: (data: { authorName: string; message: string; emoji: string; isAnonymous: boolean }) => void;
  loading?: boolean;
}

const EMOJI_OPTIONS = ['💕', '🥰', '💐', '🎉', '✨', '💖', '🌹', '💝'];

export function WishForm({ onSubmit, loading = false }: WishFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('💕');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || (!isAnonymous && !authorName.trim())) return;
    onSubmit({
      authorName: isAnonymous ? 'Anonymous' : authorName.trim(),
      message: message.trim(),
      emoji,
      isAnonymous,
    });
    setAuthorName('');
    setMessage('');
    setEmoji('💕');
    setIsAnonymous(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl p-6 shadow-sm ring-1"
      style={{
        background: 'var(--theme-surface)',
        '--tw-ring-color': 'var(--theme-border)',
      } as React.CSSProperties}
    >
      <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Send a Wish</h3>

      {!isAnonymous && (
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Your Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Enter your name"
            maxLength={100}
            className="w-full rounded-xl border px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
            style={{
              borderColor: 'var(--theme-border)',
              background: 'var(--theme-bg)',
              color: 'var(--theme-text)',
            }}
            disabled={loading}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Your Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Write your blessing or wish for the couple..."
          className="w-full rounded-xl border px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-bg)',
            color: 'var(--theme-text)',
          }}
          disabled={loading}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Pick an Emoji</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`rounded-lg p-2 text-xl transition-colors ${
                emoji === e ? 'bg-[var(--color-coral)]/10 ring-2 ring-[var(--color-coral)]' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded"
          disabled={loading}
        />
        Send anonymously
      </label>

      <Button
        type="submit"
        variant="primary"
        size="sm"
        loading={loading}
        disabled={!message.trim() || (!isAnonymous && !authorName.trim())}
      >
        Send Wish
      </Button>
    </form>
  );
}
