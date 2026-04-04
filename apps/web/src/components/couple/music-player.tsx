'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundMusicConfig } from '../../lib/music-config';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import { SpotifyEmbed } from './spotify-embed';
import { loadSpotifyAndPlay } from '../../lib/spotify-player';

interface MusicPlayerProps {
  config: BackgroundMusicConfig;
  slug: string;
  hasOwnerNav?: boolean;
  gateHandledAutoplay?: boolean;
}

export function MusicPlayer({ config, slug, hasOwnerNav = false, gateHandledAutoplay = false }: MusicPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    isPlaying,
    isMuted,
    volume,
    needsInteraction,
    currentTrack,
    isSpotify,
    toggle,
    toggleMute,
    setVolume,
    next,
    prev,
    dismissInteraction,
  } = useBackgroundMusic(config, slug, gateHandledAutoplay);

  if (!currentTrack) return null;

  const hasMultiple = config.tracks.length > 1;

  const bottomClass = hasOwnerNav ? 'bottom-20' : 'bottom-4';

  return (
    <motion.div
      className={`fixed ${bottomClass} left-4 z-30`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      {/* Spotify embed — full player shown when expanded */}
      {isSpotify && currentTrack.source === 'spotify' && expanded && (
        <SpotifyEmbed spotifyId={currentTrack.spotifyId} hidden={false} compact={false} />
      )}

      {!expanded ? (
        /* ─── Collapsed state ─── */
        <>
          <motion.button
            onClick={() => {
              if (needsInteraction) {
                if (isSpotify && currentTrack.source === 'spotify') {
                  loadSpotifyAndPlay(currentTrack.spotifyId);
                } else {
                  toggle();
                }
                dismissInteraction();
              }
              setExpanded(true);
            }}
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shadow-lg"
            style={{
              background: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
            }}
            whileTap={{ scale: 0.9 }}
            title={needsInteraction ? 'Listen to our song together!' : 'Music player'}
          >
            {currentTrack.albumArt ? (
              <motion.img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
                animate={{ rotate: !isSpotify && isPlaying ? 360 : 0 }}
                transition={!isSpotify && isPlaying ? { duration: 8, ease: 'linear', repeat: Infinity } : { duration: 0 }}
              />
            ) : isSpotify ? (
              <svg className="h-6 w-6 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                style={{ color: 'var(--theme-primary)' }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            )}

            {/* Pulse indicator for needsInteraction */}
            {needsInteraction && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid var(--theme-primary)' }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Friendly music prompt */}
          {needsInteraction && (
            <motion.button
              onClick={() => {
                if (isSpotify && currentTrack.source === 'spotify') {
                  loadSpotifyAndPlay(currentTrack.spotifyId);
                } else {
                  toggle();
                }
                dismissInteraction();
                setExpanded(true);
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-14 top-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-md"
              style={{
                background: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text)',
              }}
            >
              Listen to our song together!
            </motion.button>
          )}
        </>
      ) : (
        /* ─── Expanded state ─── */
        <motion.div
          className="w-72 rounded-2xl shadow-xl"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-border)',
          }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header with track info + collapse button */}
          <div className="flex items-center gap-3 p-3">
            {currentTrack.albumArt ? (
              <motion.img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                animate={{ rotate: !isSpotify && isPlaying ? 360 : 0 }}
                transition={!isSpotify && isPlaying ? { duration: 8, ease: 'linear', repeat: Infinity } : { duration: 0 }}
              />
            ) : (
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'var(--theme-bg)' }}
              >
                <svg className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold" style={{ color: 'var(--theme-text)' }}>
                {currentTrack.title}
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--theme-text-muted)', opacity: 0.7 }}>
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="flex-shrink-0 rounded-md p-1 transition-colors"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Spotify embed OR custom controls */}
          {isSpotify && currentTrack.source === 'spotify' ? (
            <div className="px-3 pb-3">
              {/* Spotify embed is rendered above (single instance), shown when expanded */}
              {/* Prev/Next for multi-track playlists */}
              {hasMultiple && (
                <div className="mt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={prev}
                    className="rounded-md p-1.5 transition-colors"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                    </svg>
                  </button>
                  <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    {config.tracks.indexOf(currentTrack) + 1}/{config.tracks.length}
                  </span>
                  <button
                    onClick={next}
                    className="rounded-md p-1.5 transition-colors"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Upload track: custom HTML5 Audio controls */}
              <div className="flex items-center justify-center gap-3 pb-3">
                {hasMultiple && (
                  <button
                    onClick={prev}
                    className="rounded-md p-1.5 transition-colors"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                    </svg>
                  </button>
                )}

                {/* Play/pause */}
                <button
                  onClick={toggle}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                  style={{ background: 'var(--theme-primary)' }}
                >
                  {isPlaying ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {hasMultiple && (
                  <button
                    onClick={next}
                    className="rounded-md p-1.5 transition-colors"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                )}

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="rounded-md p-1.5 transition-colors"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {isMuted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Volume slider */}
              <div className="px-4 pb-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    if (isMuted) toggleMute();
                    setVolume(Number(e.target.value));
                  }}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
                  style={{ accentColor: 'var(--theme-primary)' }}
                />
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
