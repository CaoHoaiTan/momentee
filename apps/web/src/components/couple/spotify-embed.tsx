'use client';

import React from 'react';

interface SpotifyEmbedProps {
  spotifyId: string;
  compact?: boolean;
}

export function SpotifyEmbed({ spotifyId, compact = true }: SpotifyEmbedProps) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
      width="100%"
      height={compact ? 80 : 152}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl"
      title="Spotify player"
    />
  );
}
