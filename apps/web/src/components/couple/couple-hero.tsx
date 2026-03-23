'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../lib/theme-provider';
import { Countdown } from './countdown';
import { EasterEgg } from './easter-egg';
import type { HeroStyle } from '../../lib/themes';
import { HeroSplit } from './hero-split';
import { HeroMinimal } from './hero-minimal';

interface CoupleHeroProps {
  displayName: string;
  coverPhoto: string | null;
  bio: string | null;
  partner1Name: string;
  partner1Avatar: string | null;
  partner2Name: string | null;
  partner2Avatar: string | null;
  anniversary?: string | null;
  weddingDate?: string | null;
  heroStyle?: HeroStyle;
}

function AvatarRing({
  avatar,
  name,
  primary,
  secondary,
}: {
  avatar: string | null;
  name: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="relative">
      <div
        className="animate-rotate-gradient absolute -inset-1 rounded-full"
        style={{
          background: `conic-gradient(from var(--gradient-angle), ${primary}, ${secondary}, ${primary})`,
        }}
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-2xl font-bold sm:h-24 sm:w-24">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}

export function CoupleHero({
  displayName,
  coverPhoto,
  bio,
  partner1Name,
  partner1Avatar,
  partner2Name,
  partner2Avatar,
  anniversary,
  weddingDate,
  heroStyle = 'cinematic',
}: CoupleHeroProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const sharedProps = { displayName, coverPhoto, bio, partner1Name, partner1Avatar, partner2Name, partner2Avatar, anniversary, weddingDate };

  if (heroStyle === 'split') return <HeroSplit {...sharedProps} />;
  if (heroStyle === 'minimal') return <HeroMinimal {...sharedProps} />;

  const countdownDate = weddingDate || anniversary;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
      }}
    >
      {coverPhoto && (
        <motion.img
          src={coverPhoto}
          alt={displayName}
          className="absolute inset-0 h-[130%] w-full object-cover opacity-30"
          style={{ y: parallaxY }}
        />
      )}

      {theme.isDark && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      <div className="relative px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        {/* Avatars */}
        <div className="mb-6 flex items-center justify-center gap-4 sm:gap-6">
          <AvatarRing
            avatar={partner1Avatar}
            name={partner1Name}
            primary={theme.colors.primary}
            secondary={theme.colors.secondary}
          />
          <EasterEgg>
            <span className="text-3xl font-handwriting sm:text-4xl">&amp;</span>
          </EasterEgg>
          {partner2Name ? (
            <AvatarRing
              avatar={partner2Avatar}
              name={partner2Name}
              primary={theme.colors.primary}
              secondary={theme.colors.secondary}
            />
          ) : (
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-2xl sm:h-24 sm:w-24">
                ?
              </div>
            </div>
          )}
        </div>

        <motion.h1
          className="text-4xl font-bold sm:text-5xl"
          style={{ fontFamily: 'var(--theme-font-display)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {displayName}
        </motion.h1>

        {bio && (
          <motion.p
            className="mx-auto mt-4 max-w-lg text-lg text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {bio}
          </motion.p>
        )}

        {countdownDate && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Countdown
              targetDate={countdownDate}
              label={weddingDate ? 'Until the big day' : 'Together since'}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
