'use client';

import React from 'react';

interface SpotifyEmbedProps {
  spotifyId: string;
  compact?: boolean;
  hidden?: boolean;
}

export function SpotifyEmbed({ spotifyId, compact = true, hidden = false }: SpotifyEmbedProps) {
  return (
    <div
      className={hidden ? '' : 'rounded-xl overflow-hidden'}
      style={hidden ? { position: 'fixed', top: -9999, left: -9999, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' } : undefined}
    >
      <iframe
        src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0&autoplay=1`}
        width="100%"
        height={compact ? 80 : 152}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="eager"
        title="Spotify player"
      />
    </div>
  );
}
