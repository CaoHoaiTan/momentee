'use client';

import React from 'react';

interface CoupleHeroProps {
  displayName: string;
  coverPhoto: string | null;
  bio: string | null;
  partner1Name: string;
  partner1Avatar: string | null;
  partner2Name: string | null;
  partner2Avatar: string | null;
}

export function CoupleHero({
  displayName,
  coverPhoto,
  bio,
  partner1Name,
  partner1Avatar,
  partner2Name,
  partner2Avatar,
}: CoupleHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-orange)]">
      {coverPhoto && (
        <img
          src={coverPhoto}
          alt={displayName}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}
      <div className="relative px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        {/* Avatars */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-2xl font-bold">
            {partner1Avatar ? (
              <img src={partner1Avatar} alt={partner1Name} className="h-full w-full rounded-full object-cover" />
            ) : (
              partner1Name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-3xl font-handwriting">&amp;</div>
          {partner2Name ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-2xl font-bold">
              {partner2Avatar ? (
                <img src={partner2Avatar} alt={partner2Name} className="h-full w-full rounded-full object-cover" />
              ) : (
                partner2Name.charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-2xl">
              ?
            </div>
          )}
        </div>

        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {displayName}
        </h1>

        {bio && (
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}
