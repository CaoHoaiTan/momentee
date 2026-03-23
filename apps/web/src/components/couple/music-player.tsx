'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BackgroundMusicConfig } from '../../lib/music-config';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

interface MusicPlayerProps {
  config: BackgroundMusicConfig;
  slug: string;
}

export function MusicPlayer({ config, slug }: MusicPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    isPlaying,
    isMuted,
    volume,
    needsInteraction,
    currentTrack,
    toggle,
    toggleMute,
    setVolume,
    next,
    prev,
  } = useBackgroundMusic(config, slug);

  if (!currentTrack) return null;

  const hasMultiple = config.tracks.length > 1;

  // Collapsed / needs interaction state
  if (!expanded) {
    return (
      <motion.div
        className="fixed bottom-4 left-4 z-30"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <motion.button
          onClick={() => (needsInteraction ? toggle() : setExpanded(true))}
          className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shadow-lg"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-border)',
          }}
          whileTap={{ scale: 0.9 }}
          title={needsInteraction ? 'Tap to play music' : 'Music player'}
        >
          {currentTrack.albumArt ? (
            <motion.img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className="h-full w-full object-cover"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={isPlaying ? { duration: 8, ease: 'linear', repeat: Infinity } : { duration: 0 }}
            />
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

        {/* "Tap to play" label */}
        {needsInteraction && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-md"
            style={{
              background: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text)',
            }}
          >
            Tap to play music
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Expanded state
  return (
    <motion.div
      className="fixed bottom-4 left-4 z-30 w-64 rounded-2xl shadow-xl"
      style={{
        background: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
      }}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        {currentTrack.albumArt ? (
          <motion.img
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={isPlaying ? { duration: 8, ease: 'linear', repeat: Infinity } : { duration: 0 }}
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

      {/* Controls */}
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
    </motion.div>
  );
}
