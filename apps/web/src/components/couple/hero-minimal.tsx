'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../lib/theme-provider';
import { Countdown } from './countdown';
import { EasterEgg } from './easter-egg';

interface HeroMinimalProps {
  displayName: string;
  coverPhoto: string | null;
  bio: string | null;
  partner1Name: string;
  partner1Avatar: string | null;
  partner2Name: string | null;
  partner2Avatar: string | null;
  anniversary?: string | null;
  weddingDate?: string | null;
}

export function HeroMinimal({
  displayName,
  bio,
  partner1Name,
  partner2Name,
  anniversary,
  weddingDate,
}: HeroMinimalProps) {
  const theme = useTheme();
  const countdownDate = weddingDate || anniversary;

  // Extract initials for the massive typography
  const initials = partner2Name
    ? `${partner1Name.charAt(0)} & ${partner2Name.charAt(0)}`
    : partner1Name.charAt(0);

  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: theme.isDark
          ? `linear-gradient(160deg, ${theme.colors.bg}, ${theme.colors.primary}15)`
          : `linear-gradient(160deg, ${theme.colors.bg}, ${theme.colors.primary}10)`,
      }}
    >
      <div className="relative flex min-h-[400px] flex-col items-center justify-center px-6 py-20 text-center sm:min-h-[500px] sm:py-28">
        {/* Giant initials watermark */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
          aria-hidden="true"
        >
          <motion.span
            className="font-bold leading-none"
            style={{
              fontFamily: 'var(--theme-font-display)',
              fontSize: 'clamp(8rem, 30vw, 20rem)',
              color: theme.colors.primary,
              opacity: 0.05,
            }}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ duration: 1.2 }}
          >
            {initials}
          </motion.span>
        </div>

        {/* Small avatars */}
        <motion.div
          className="mb-8 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: theme.colors.textMuted }}
          >
            {partner1Name}
          </span>
          <EasterEgg>
            <span
              className="text-lg font-handwriting"
              style={{ color: theme.colors.primary }}
            >
              &amp;
            </span>
          </EasterEgg>
          <span
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: theme.colors.textMuted }}
          >
            {partner2Name ?? '...'}
          </span>
        </motion.div>

        {/* Display name — massive typography */}
        <motion.h1
          className="text-5xl font-bold leading-tight sm:text-7xl"
          style={{
            fontFamily: 'var(--theme-font-display)',
            color: theme.colors.text,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {displayName}
        </motion.h1>

        {bio && (
          <motion.p
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed"
            style={{ color: theme.colors.textMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {bio}
          </motion.p>
        )}

        {/* Thin decorative line */}
        <motion.div
          className="mx-auto mt-8 h-px w-16"
          style={{ background: theme.colors.primary, opacity: 0.3 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />

        {countdownDate && (
          <motion.div
            className="mt-6"
            style={{ color: theme.colors.text }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Countdown
              targetDate={countdownDate}
              label={weddingDate ? 'Until the big day' : 'Together since'}
            />
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          className="mt-10"
          style={{ color: theme.colors.textMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p className="text-xs uppercase tracking-widest">scroll to discover</p>
          <motion.div
            className="mx-auto mt-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="mx-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
