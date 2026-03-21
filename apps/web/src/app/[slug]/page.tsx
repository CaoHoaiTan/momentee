'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { GET_COUPLE_BY_SLUG } from '../../graphql/queries/couple.queries';
import { CouplePageClient } from './client';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

interface CoupleQueryData {
  couple: {
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
    partner1: { id: string; name: string; avatar: string | null };
    partner2: { id: string; name: string; avatar: string | null } | null;
  } | null;
}

export default function CouplePublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data, loading, error } = useQuery<CoupleQueryData>(GET_COUPLE_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data?.couple) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-6xl">💔</div>
        <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
        <p className="text-gray-500">
          This couple page doesn&apos;t exist or has been made private.
        </p>
        <a
          href="/"
          className="mt-4 text-[var(--color-coral)] hover:underline"
        >
          Go home
        </a>
      </div>
    );
  }

  return <CouplePageClient couple={data.couple} />;
}
