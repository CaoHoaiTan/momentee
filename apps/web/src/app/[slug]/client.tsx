'use client';

import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { INCREMENT_VIEW_COUNT } from '../../graphql/mutations/couple.mutations';
import { CoupleHero } from '../../components/couple/couple-hero';
import { CoupleStats } from '../../components/couple/couple-stats';
import { ShareButton } from '../../components/couple/share-button';
import { Card } from '../../components/ui/card';

interface Partner {
  id: string;
  name: string;
  avatar: string | null;
}

interface CoupleData {
  id: string;
  slug: string;
  displayName: string;
  coverPhoto: string | null;
  bio: string | null;
  anniversary: string | null;
  weddingDate: string | null;
  theme: string;
  isPublic: boolean;
  viewCount: number;
  daysTogether: number;
  totalWishes: number;
  totalPhotos: number;
  partner1: Partner;
  partner2: Partner | null;
}

export function CouplePageClient({ couple }: { couple: CoupleData }) {
  const [incrementView] = useMutation(INCREMENT_VIEW_COUNT);

  useEffect(() => {
    incrementView({ variables: { slug: couple.slug } }).catch(() => {});
  }, [couple.slug, incrementView]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <CoupleHero
        displayName={couple.displayName}
        coverPhoto={couple.coverPhoto}
        bio={couple.bio}
        partner1Name={couple.partner1.name}
        partner1Avatar={couple.partner1.avatar}
        partner2Name={couple.partner2?.name ?? null}
        partner2Avatar={couple.partner2?.avatar ?? null}
      />

      <div className="flex items-center justify-between">
        <div />
        <ShareButton slug={couple.slug} />
      </div>

      <Card>
        <CoupleStats
          daysTogether={couple.daysTogether}
          totalWishes={couple.totalWishes}
          totalPhotos={couple.totalPhotos}
          viewCount={couple.viewCount}
        />
      </Card>

      {couple.anniversary && (
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Anniversary</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(couple.anniversary).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </Card>
      )}

      {/* Placeholder sections for future phases */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <div className="py-8 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="mt-2 font-medium">Timeline</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </Card>
        <Card>
          <div className="py-8 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p className="mt-2 font-medium">Gallery</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </Card>
        <Card>
          <div className="py-8 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="mt-2 font-medium">Wishes</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </Card>
        <Card>
          <div className="py-8 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="mt-2 font-medium">Events</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
