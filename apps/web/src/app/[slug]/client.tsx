'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { INCREMENT_VIEW_COUNT } from '../../graphql/mutations/couple.mutations';
import { GET_MILESTONES } from '../../graphql/queries/milestone.queries';
import { GET_POSTS } from '../../graphql/queries/post.queries';
import { GET_WISHES } from '../../graphql/queries/wish.queries';
import { CREATE_WISH } from '../../graphql/mutations/wish.mutations';
import { GET_EVENTS } from '../../graphql/queries/event.queries';
import { CREATE_RSVP } from '../../graphql/mutations/event.mutations';
import { GET_GIFT_ACCOUNTS } from '../../graphql/queries/gift.queries';
import { RsvpForm } from '../../components/couple/rsvp-form';
import { Gallery } from '../../components/couple/gallery';
import { WishForm } from '../../components/couple/wish-form';
import { WishCard } from '../../components/couple/wish-card';
import type { WishData } from '../../components/couple/wish-card';
import { CoupleHero } from '../../components/couple/couple-hero';
import { CoupleStats } from '../../components/couple/couple-stats';
import { ShareButton } from '../../components/couple/share-button';
import { Timeline } from '../../components/couple/timeline';
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
  const [createWish, { loading: creatingWish }] = useMutation(CREATE_WISH, {
    refetchQueries: [{ query: GET_WISHES, variables: { coupleId: couple.id, limit: 50 } }],
  });

  const { data: wishesData } = useQuery<{ wishes: WishData[] }>(GET_WISHES, {
    variables: { coupleId: couple.id, limit: 50 },
  });

  const { data: postsData } = useQuery<{
    posts: {
      id: string;
      caption: string | null;
      media: { id: string; url: string; type: string }[];
    }[];
  }>(GET_POSTS, {
    variables: { coupleId: couple.id, limit: 20 },
  });

  const { data: eventsData } = useQuery<{
    events: {
      id: string;
      title: string;
      description: string | null;
      location: string | null;
      startDate: string;
      endDate: string | null;
      isPublic: boolean;
      maxGuests: number | null;
      rsvps: { id: string; name: string; status: string; plusOne: boolean }[];
    }[];
  }>(GET_EVENTS, {
    variables: { coupleId: couple.id },
  });

  const [createRsvp, { loading: creatingRsvp }] = useMutation(CREATE_RSVP);

  const { data: giftData } = useQuery<{
    giftAccounts: {
      id: string;
      bankName: string | null;
      accountNumber: string | null;
      accountHolder: string | null;
      note: string | null;
      isActive: boolean;
    }[];
  }>(GET_GIFT_ACCOUNTS, {
    variables: { coupleId: couple.id },
  });

  const { data: milestonesData } = useQuery<{
    milestones: {
      id: string;
      title: string;
      description: string | null;
      date: string;
      icon: string | null;
      photo: string | null;
      sortOrder: number;
    }[];
  }>(GET_MILESTONES, {
    variables: { coupleId: couple.id },
  });

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

      {/* Timeline */}
      {(milestonesData?.milestones?.length ?? 0) > 0 && (
        <Card>
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
            Our Timeline
          </h2>
          <Timeline milestones={milestonesData!.milestones} />
        </Card>
      )}

      {/* Gallery */}
      {(postsData?.posts?.length ?? 0) > 0 && (
        <Card>
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">Our Gallery</h2>
          <Gallery posts={postsData!.posts} />
        </Card>
      )}

      {/* Wishes */}
      <div className="space-y-4">
        <h2 className="text-center text-xl font-semibold text-gray-900">Wishes & Blessings</h2>
        <WishForm
          onSubmit={async (data) => {
            await createWish({
              variables: { coupleId: couple.id, input: data },
            });
          }}
          loading={creatingWish}
        />
        {(wishesData?.wishes?.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {wishesData!.wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        )}
      </div>

      {/* Events */}
      {(eventsData?.events?.filter((e) => e.isPublic).length ?? 0) > 0 && (
        <div className="space-y-4">
          <h2 className="text-center text-xl font-semibold text-gray-900">Upcoming Events</h2>
          {eventsData!.events
            .filter((e) => e.isPublic)
            .map((event) => (
              <Card key={event.id}>
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                {event.description && <p className="mt-1 text-sm text-gray-500">{event.description}</p>}
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <p>
                    📅{' '}
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.location && <p>📍 {event.location}</p>}
                  <p>
                    👥 {event.rsvps.filter((r) => r.status === 'ATTENDING' || r.status === 'attending').length} attending
                    {event.maxGuests ? ` / ${event.maxGuests} max` : ''}
                  </p>
                </div>
                <div className="mt-4">
                  <RsvpForm
                    onSubmit={async (data) => {
                      await createRsvp({
                        variables: { eventId: event.id, input: data },
                        refetchQueries: [{ query: GET_EVENTS, variables: { coupleId: couple.id } }],
                      });
                    }}
                    loading={creatingRsvp}
                  />
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Gift Accounts */}
      {(giftData?.giftAccounts?.filter((g) => g.isActive).length ?? 0) > 0 && (
        <Card>
          <h2 className="mb-4 text-center text-xl font-semibold text-gray-900">Gift Registry</h2>
          <div className="space-y-3">
            {giftData!.giftAccounts
              .filter((g) => g.isActive)
              .map((account) => (
                <div key={account.id} className="rounded-xl bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">{account.bankName}</p>
                  <p className="mt-1 font-mono text-sm text-gray-600">{account.accountNumber}</p>
                  {account.accountHolder && (
                    <p className="text-sm text-gray-500">{account.accountHolder}</p>
                  )}
                  {account.note && <p className="mt-1 text-xs text-gray-400">{account.note}</p>}
                  <button
                    onClick={() => navigator.clipboard.writeText(account.accountNumber ?? '')}
                    className="mt-2 text-xs font-medium text-[var(--color-coral)] hover:underline"
                  >
                    Copy Account Number
                  </button>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
