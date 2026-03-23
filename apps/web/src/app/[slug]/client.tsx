'use client';

import React, { useCallback, useEffect, useRef } from 'react';
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
import { WishWall } from '../../components/couple/wish-wall';
import { CoupleHero } from '../../components/couple/couple-hero';
import { CoupleStats } from '../../components/couple/couple-stats';
import { ShareButtons } from '../../components/couple/share-buttons';
import { MobileFab } from '../../components/couple/mobile-fab';
import { QrShare } from '../../components/couple/qr-share';
import { Timeline } from '../../components/couple/timeline';
import { Card } from '../../components/ui/card';
import { ThemeProvider } from '../../lib/theme-provider';
import { resolveThemeId, getTheme } from '../../lib/themes';
import { parseLayoutConfig, mergeWithThemeDefaults } from '../../lib/layout-config';
import { ScrollReveal } from '../../components/couple/scroll-reveal';
import { SectionDivider } from '../../components/couple/section-divider';
import { Particles } from '../../components/couple/particles';
import { LoveMeter } from '../../components/couple/love-meter';
import { EventCardEnhanced } from '../../components/couple/event-card-enhanced';

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
  layoutConfig: string | null;
  isPublic: boolean;
  viewCount: number;
  daysTogether: number;
  totalWishes: number;
  totalPhotos: number;
  partner1: Partner;
  partner2: Partner | null;
}

export function CouplePageClient({ couple }: { couple: CoupleData }) {
  const themeId = resolveThemeId(couple.theme);
  const theme = getTheme(themeId);
  const userConfig = parseLayoutConfig(couple.layoutConfig);
  const layout = mergeWithThemeDefaults(userConfig, theme);

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

  const defaultOrder = ['hero', 'stats', 'timeline', 'gallery', 'wishes', 'events', 'gifts'];
  const sectionOrder = layout.sectionOrder?.length ? layout.sectionOrder : defaultOrder;

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: () => (
      <React.Fragment key="hero">
        <CoupleHero
          displayName={couple.displayName}
          coverPhoto={couple.coverPhoto}
          bio={couple.bio}
          partner1Name={couple.partner1.name}
          partner1Avatar={couple.partner1.avatar}
          partner2Name={couple.partner2?.name ?? null}
          partner2Avatar={couple.partner2?.avatar ?? null}
          anniversary={couple.anniversary}
          weddingDate={couple.weddingDate}
        />
        <div className="flex items-center justify-between">
          <QrShare slug={couple.slug} size={120} />
          <ShareButtons slug={couple.slug} displayName={couple.displayName} />
        </div>
        <SectionDivider type={theme.divider} color={theme.colors.primary} />
      </React.Fragment>
    ),

    stats: () => (
      <React.Fragment key="stats">
        <ScrollReveal>
          <Card>
            <CoupleStats
              daysTogether={couple.daysTogether}
              totalWishes={couple.totalWishes}
              totalPhotos={couple.totalPhotos}
              viewCount={couple.viewCount}
            />
          </Card>
        </ScrollReveal>
        {couple.anniversary && (
          <ScrollReveal delay={0.1}>
            <Card>
              <div className="text-center">
                <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Anniversary</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
                  {new Date(couple.anniversary).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </Card>
          </ScrollReveal>
        )}
        <SectionDivider type={theme.divider} color={theme.colors.primary} />
      </React.Fragment>
    ),

    timeline: () =>
      (milestonesData?.milestones?.length ?? 0) > 0 ? (
        <ScrollReveal key="timeline">
          <Card>
            <h2 className="mb-6 text-center text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
              Our Timeline
            </h2>
            <Timeline milestones={milestonesData!.milestones} layout={layout.timelineLayout} />
          </Card>
        </ScrollReveal>
      ) : null,

    gallery: () =>
      (postsData?.posts?.length ?? 0) > 0 ? (
        <ScrollReveal key="gallery">
          <Card>
            <h2 className="mb-6 text-center text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
              Our Gallery
            </h2>
            <Gallery posts={postsData!.posts} mode={layout.galleryMode} />
          </Card>
        </ScrollReveal>
      ) : null,

    wishes: () => (
      <ScrollReveal key="wishes">
        <div className="space-y-4">
          <h2 className="text-center text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
            Wishes & Blessings
          </h2>
          <WishForm
            onSubmit={async (data) => {
              await createWish({ variables: { coupleId: couple.id, input: data } });
            }}
            loading={creatingWish}
          />
          {(wishesData?.wishes?.length ?? 0) > 0 &&
            (layout.wishDisplay === 'wall' ? (
              <WishWall wishes={wishesData!.wishes} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {wishesData!.wishes.map((wish) => (
                  <WishCard key={wish.id} wish={wish} />
                ))}
              </div>
            ))}
        </div>
      </ScrollReveal>
    ),

    events: () =>
      (eventsData?.events?.filter((e) => e.isPublic).length ?? 0) > 0 ? (
        <ScrollReveal key="events">
          <div className="space-y-4">
            <h2 className="text-center text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
              Upcoming Events
            </h2>
            {eventsData!.events
              .filter((e) => e.isPublic)
              .map((event) => (
                <EventCardEnhanced key={event.id} event={event}>
                  <RsvpForm
                    onSubmit={async (data) => {
                      await createRsvp({
                        variables: { eventId: event.id, input: data },
                        refetchQueries: [{ query: GET_EVENTS, variables: { coupleId: couple.id } }],
                      });
                    }}
                    loading={creatingRsvp}
                  />
                </EventCardEnhanced>
              ))}
          </div>
        </ScrollReveal>
      ) : null,

    gifts: () =>
      (giftData?.giftAccounts?.filter((g) => g.isActive).length ?? 0) > 0 ? (
        <ScrollReveal key="gifts">
          <Card>
            <h2 className="mb-4 text-center text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
              Gift Registry
            </h2>
            <div className="space-y-3">
              {giftData!.giftAccounts
                .filter((g) => g.isActive)
                .map((account) => (
                  <div key={account.id} className="rounded-xl p-4" style={{ background: 'var(--theme-surface)' }}>
                    <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>{account.bankName}</p>
                    <p className="mt-1 font-mono text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                      {account.accountNumber}
                    </p>
                    {account.accountHolder && (
                      <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{account.accountHolder}</p>
                    )}
                    {account.note && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted)', opacity: 0.7 }}>
                        {account.note}
                      </p>
                    )}
                    <button
                      onClick={() => navigator.clipboard.writeText(account.accountNumber ?? '')}
                      className="mt-2 text-xs font-medium hover:underline"
                      style={{ color: 'var(--color-coral)' }}
                    >
                      Copy Account Number
                    </button>
                  </div>
                ))}
            </div>
          </Card>
        </ScrollReveal>
      ) : null,
  };

  const wishSectionRef = useRef<HTMLDivElement>(null);
  const scrollToWishes = useCallback(() => {
    wishSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Wrap the wishes renderer to attach ref
  const originalWishes = sectionRenderers.wishes;
  sectionRenderers.wishes = () => (
    <div ref={wishSectionRef} key="wishes-wrapper">
      {originalWishes()}
    </div>
  );

  return (
    <ThemeProvider themeId={themeId}>
      <LoveMeter />
      <Particles type={theme.particles} />
      <MobileFab onWishClick={scrollToWishes} />

      <div className="relative z-10 mx-auto max-w-4xl space-y-8 px-4 py-8">
        {sectionOrder.map((sectionId) => {
          const render = sectionRenderers[sectionId];
          return render ? render() : null;
        })}
      </div>
    </ThemeProvider>
  );
}
