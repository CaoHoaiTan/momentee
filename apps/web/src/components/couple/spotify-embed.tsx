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
      width="100%"
      height={compact ? 80 : 152}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className={hidden ? 'sr-only' : 'rounded-xl'}
      style={hidden ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden' } : undefined}
      title="Spotify player"
    />
  );
}
