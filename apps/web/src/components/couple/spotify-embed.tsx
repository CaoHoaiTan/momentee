'use client';

import React from 'react';

interface SpotifyEmbedProps {
  spotifyId: string;
  compact?: boolean;
  hidden?: boolean;
}

export function SpotifyEmbed({ spotifyId, compact = true, hidden = false }: SpotifyEmbedProps) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0&autoplay=1`}
      width={hidden ? 0 : '100%'}
      height={hidden ? 0 : compact ? 80 : 152}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading={hidden ? 'eager' : 'lazy'}
      className={hidden ? '' : 'rounded-xl'}
      style={hidden ? { position: 'fixed', top: -9999, left: -9999, width: 0, height: 0, border: 'none', overflow: 'hidden', pointerEvents: 'none' } : undefined}
      title="Spotify player"
    />
  );
}
