'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../lib/theme-provider';
import { Countdown } from './countdown';
import { EasterEgg } from './easter-egg';

interface HeroSplitProps {
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

function PartnerHalf({
  name,
  avatar,
  side,
  color,
}: {
  name: string;
  avatar: string | null;
  side: 'left' | 'right';
  color: string;
}) {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-3 p-6"
      initial={{ x: side === 'left' ? -40 : 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: side === 'left' ? 0.1 : 0.3 }}
    >
      <div
        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 sm:h-32 sm:w-32"
        style={{ borderColor: color }}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <p className="text-lg font-semibold text-white/90">{name}</p>
    </motion.div>
  );
}

export function HeroSplit({
  displayName,
  coverPhoto,
  bio,
  partner1Name,
  partner1Avatar,
  partner2Name,
  partner2Avatar,
  anniversary,
  weddingDate,
}: HeroSplitProps) {
  const theme = useTheme();
  const countdownDate = weddingDate || anniversary;

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
        }}
      />
      {coverPhoto && (
        <img
          src={coverPhoto}
          alt={displayName}
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
      )}
      {theme.isDark && <div className="absolute inset-0 bg-black/30" />}

      <div className="relative text-white">
        {/* Split partner area */}
        <div className="flex min-h-[280px] flex-col sm:flex-row">
          <PartnerHalf
            name={partner1Name}
            avatar={partner1Avatar}
            side="left"
            color={theme.colors.primary}
          />

          {/* Center divider with ampersand */}
          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: 'spring' }}
            >
              <EasterEgg>
                <span className="text-2xl font-handwriting">&amp;</span>
              </EasterEgg>
            </motion.div>
          </div>

          {partner2Name ? (
            <PartnerHalf
              name={partner2Name}
              avatar={partner2Avatar}
              side="right"
              color={theme.colors.secondary}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 text-3xl sm:h-32 sm:w-32">
                ?
              </div>
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="px-6 pb-10 pt-2 text-center sm:pb-12">
          <motion.h1
            className="text-3xl font-bold sm:text-4xl"
            style={{ fontFamily: 'var(--theme-font-display)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {displayName}
          </motion.h1>

          {bio && (
            <motion.p
              className="mx-auto mt-3 max-w-md text-sm text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {bio}
            </motion.p>
          )}

          {countdownDate && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Countdown
                targetDate={countdownDate}
                label={weddingDate ? 'Until the big day' : 'Together since'}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
