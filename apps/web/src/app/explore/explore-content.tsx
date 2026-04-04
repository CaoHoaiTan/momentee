'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { EXPLORE_COUPLES } from '../../graphql/queries/explore.queries';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface ExploreCouple {
  id: string;
  slug: string;
  displayName: string;
  coverPhoto: string | null;
  bio: string | null;
  viewCount: number;
  partner1: { id: string; name: string; avatar: string | null };
  partner2: { id: string; name: string; avatar: string | null } | null;
}

export default function ExploreContent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, loading, error } = useQuery<{ exploreCouples: ExploreCouple[] }>(EXPLORE_COUPLES, {
    variables: { limit: 24, search: debouncedSearch || undefined },
  });

  const couples = data?.exploreCouples ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Explore Love Stories</h1>
        <p className="mt-2 text-gray-500">Discover beautiful couple pages from our community</p>
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search couples..."
          aria-label="Search couples"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-gray-400">
          <span className="text-5xl">😵</span>
          <p className="mt-4 text-lg font-medium">Failed to load couples</p>
          <p className="mt-1 text-sm">Please try again later.</p>
        </div>
      ) : couples.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <span className="text-5xl">💕</span>
          <p className="mt-4 text-lg font-medium">No couples found</p>
          <p className="mt-1 text-sm">Be the first to create your love story!</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {couples.map((couple) => (
            <Link
              key={couple.id}
              href={`/${couple.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-[var(--color-coral)]/30"
            >
              <div className="aspect-video w-full bg-gradient-to-br from-[var(--color-coral)]/20 to-[var(--color-teal)]/20">
                {couple.coverPhoto && (
                  <img
                    src={couple.coverPhoto}
                    alt={couple.displayName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{couple.displayName}</h3>
                {couple.bio && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{couple.bio}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span>👀 {couple.viewCount} views</span>
                  <span>
                    {couple.partner1.name}
                    {couple.partner2 ? ` & ${couple.partner2.name}` : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
