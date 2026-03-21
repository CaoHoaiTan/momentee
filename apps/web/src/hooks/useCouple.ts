'use client';

import { useQuery } from '@apollo/client/react';
import { GET_MY_COUPLE } from '../graphql/queries/couple.queries';

interface Partner {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface Couple {
  id: string;
  slug: string;
  displayName: string;
  inviteCode: string | null;
  coverPhoto: string | null;
  bio: string | null;
  anniversary: string | null;
  weddingDate: string | null;
  theme: string;
  isPublic: boolean;
  viewCount: number;
  plan: string;
  daysTogether: number;
  totalWishes: number;
  totalPhotos: number;
  createdAt: string;
  partner1: Partner;
  partner2: Partner | null;
}

interface MyCoupleData {
  myCouple: Couple | null;
}

export function useCouple() {
  const { data, loading, error, refetch } = useQuery<MyCoupleData>(
    GET_MY_COUPLE,
    {
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    couple: data?.myCouple ?? null,
    loading,
    error,
    refetch,
  };
}
