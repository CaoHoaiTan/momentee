'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MusicTrack } from '../../lib/music-config';
import { loadSpotifyAndPlay } from '../../lib/spotify-player';

const GATE_KEY = (slug: string) => `momentee_gate_${slug}`;

interface WelcomeGateProps {
  coupleSlug: string;
  partner1Name: string;
  partner2Name: string | null;
  firstTrack: MusicTrack;
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  onDismissed: () => void;
}

export function WelcomeGate({
  coupleSlug,
  partner1Name,
  partner2Name,
  firstTrack,
  isDark,
  primaryColor,
  secondaryColor,
  onDismissed,
}: WelcomeGateProps) {
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);

  // Runs synchronously during hydration, before first paint
  const [shouldShow] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(GATE_KEY(coupleSlug));
    } catch {
      return true;
    }
  });

  // For returning visitors: call onDismissed after mount, render nothing
  useEffect(() => {
    if (!shouldShow) onDismissed();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [state, setState] = useState<'visible' | 'dismissing'>('visible');

  if (!shouldShow) return null;

  const handleEnter = () => {
    if (state === 'dismissing') return;
    setState('dismissing');
    try {
      sessionStorage.setItem(GATE_KEY(coupleSlug), '1');
    } catch {
      /* ignore */
    }

    if (firstTrack.source === 'spotify') {
      loadSpotifyAndPlay(firstTrack.spotifyId, hiddenContainerRef);
    }
  };

  return (
    <>
      <AnimatePresence onExitComplete={onDismissed}>
        {state === 'visible' && (
          <motion.div
            key="welcome-gate"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: isDark ? '#0a0a0a' : 'var(--theme-bg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Subtle gradient tint */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            />

            <motion.div
              className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {/* Couple names */}
              <p
                className="text-4xl font-semibold tracking-tight sm:text-5xl"
                style={{
                  fontFamily: 'var(--theme-font-display, var(--font-sora), sans-serif)',
                  color: isDark ? '#f8f8f8' : 'var(--theme-text)',
                }}
              >
                {partner2Name ? `${partner1Name} & ${partner2Name}` : partner1Name}
              </p>

              {/* Music info */}
              <p
                className="text-sm"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--theme-text-muted)',
                  opacity: 0.8,
                }}
              >
                ♪ {firstTrack.title} — {firstTrack.artist}
              </p>

              {/* CTA button with pulse animation */}
              <motion.button
                onClick={handleEnter}
                className="mt-2 overflow-hidden rounded-full px-10 py-4 text-base font-semibold text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                animate={{
                  boxShadow: [`0 0 0 0 ${primaryColor}40`, `0 0 0 12px ${primaryColor}00`],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Enter & listen together
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden container for Spotify IFrame API — persists outside AnimatePresence */}
      {state === 'dismissing' && firstTrack.source === 'spotify' && (
        <div
          ref={hiddenContainerRef}
          style={{
            position: 'fixed',
            top: -9999,
            left: -9999,
            width: 0,
            height: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}
