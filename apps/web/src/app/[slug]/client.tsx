'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../../hooks/useAuth';
import { INCREMENT_VIEW_COUNT } from '../../graphql/mutations/couple.mutations';
import { GET_MILESTONES } from '../../graphql/queries/milestone.queries';
import { GET_POSTS } from '../../graphql/queries/post.queries';
import { GET_WISHES } from '../../graphql/queries/wish.queries';
import { CREATE_WISH } from '../../graphql/mutations/wish.mutations';
import { GET_EVENTS } from '../../graphql/queries/event.queries';
import { CREATE_RSVP } from '../../graphql/mutations/event.mutations';
import { GET_GIFT_ACCOUNTS } from '../../graphql/queries/gift.queries';
import { GET_ALBUMS } from '../../graphql/queries/album.queries';
import { GET_QUIZZES } from '../../graphql/queries/quiz.queries';
import { AnimatePresence } from 'framer-motion';
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
import { parseMusicConfig } from '../../lib/music-config';
import { sanitizeCss } from '../../lib/css-sanitizer';
import { MusicPlayer } from '../../components/couple/music-player';
import { ScrollReveal } from '../../components/couple/scroll-reveal';
import { SectionDivider } from '../../components/couple/section-divider';
import { Particles } from '../../components/couple/particles';
import { LoveMeter } from '../../components/couple/love-meter';
import { EventCardEnhanced } from '../../components/couple/event-card-enhanced';
import { QuizPlayer } from '../../components/couple/quiz-player';

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
  backgroundMusic: string | null;
  isPublic: boolean;
  viewCount: number;
  daysTogether: number;
  totalWishes: number;
  totalPhotos: number;
  partner1: Partner;
  partner2: Partner | null;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-2"
      style={{ background: 'var(--theme-bg)', opacity: 0.9 }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)', opacity: 0.6 }}>
          {label}
        </p>
        <p className="truncate font-mono text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
          {text}
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleCopy}
        className="ml-2 flex-shrink-0 rounded-md p-1.5 transition-colors"
        style={{ color: copied ? '#22c55e' : 'var(--theme-text-muted)' }}
      >
        {copied ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}

function GiftCards({ accounts }: { accounts: { id: string; bankName: string | null; accountNumber: string | null; accountHolder: string | null; qrCode: string | null; note: string | null }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {accounts.map((account, index) => (
        <motion.div
          key={account.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
        >
          {/* Gradient top accent */}
          <div
            className="h-1"
            style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' }}
          />

          <div className="p-5">
            {/* QR Code */}
            {account.qrCode ? (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.15 }}
                className="mb-4 flex justify-center"
              >
                <img
                  src={account.qrCode}
                  alt={`QR Code - ${account.bankName}`}
                  className="h-48 w-48 rounded-xl object-contain shadow-sm"
                  style={{ background: '#fff', padding: '8px' }}
                />
              </motion.div>
            ) : (
              <div className="mb-4 flex justify-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-xl"
                  style={{ background: 'var(--theme-bg)' }}
                >
                  <svg className="h-10 w-10" style={{ color: 'var(--theme-text-muted)', opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Bank name */}
            <div className="mb-3 flex items-center justify-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--theme-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
              <p className="text-center font-semibold" style={{ color: 'var(--theme-text)' }}>
                {account.bankName}
              </p>
            </div>

            {/* Account info - copyable fields */}
            <div className="space-y-2">
              {account.accountHolder && (
                <CopyButton text={account.accountHolder} label="Account Holder" />
              )}
              {account.accountNumber && (
                <CopyButton text={account.accountNumber} label="Account Number" />
              )}
            </div>

            {/* Note */}
            {account.note && (
              <p
                className="mt-3 text-center text-xs italic"
                style={{ color: 'var(--theme-text-muted)', opacity: 0.7 }}
              >
                {account.note}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AlbumSection({ albums, galleryMode }: { albums: { id: string; title: string; description: string | null; coverPhoto: string | null; photoCount: number; photos: { id: string; mediaUrl: string; caption: string | null; sortOrder: number }[] }[]; galleryMode?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {albums.map((album, index) => {
        const isExpanded = expandedId === album.id;
        const coverSrc = album.coverPhoto ?? (album.photos.length > 0 ? album.photos[0].mediaUrl : null);

        return (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="overflow-hidden rounded-2xl"
            style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
          >
            {/* Album header — clickable */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : album.id)}
              className="flex w-full items-center gap-4 p-4 text-left transition-colors"
            >
              {coverSrc ? (
                <img
                  src={coverSrc}
                  alt={album.title}
                  className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'var(--theme-bg)' }}
                >
                  <svg className="h-7 w-7" style={{ color: 'var(--theme-text-muted)', opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold" style={{ color: 'var(--theme-text)' }}>{album.title}</h3>
                {album.description && (
                  <p className="mt-0.5 truncate text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    {album.description}
                  </p>
                )}
                <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted)', opacity: 0.6 }}>
                  {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                </p>
              </div>
              <motion.svg
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="h-5 w-5 flex-shrink-0"
                style={{ color: 'var(--theme-text-muted)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            {/* Expanded gallery */}
            <AnimatePresence>
              {isExpanded && album.photos.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--theme-border)' }}>
                    <Gallery
                      posts={album.photos.map((p) => ({
                        caption: p.caption,
                        media: [{ url: p.mediaUrl }],
                      }))}
                      mode={galleryMode as 'grid' | 'masonry' | 'polaroid' | undefined}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export function CouplePageClient({ couple }: { couple: CoupleData }) {
  const { user, isAuthenticated } = useAuth();
  const isOwner = isAuthenticated && user && (
    user.id === couple.partner1.id || user.id === couple.partner2?.id
  );

  const themeId = resolveThemeId(couple.theme);
  const theme = getTheme(themeId);
  const userConfig = parseLayoutConfig(couple.layoutConfig);
  const layout = mergeWithThemeDefaults(userConfig, theme);
  const musicConfig = parseMusicConfig(couple.backgroundMusic);

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
      qrCode: string | null;
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

  const { data: albumsData } = useQuery<{
    albums: {
      id: string;
      title: string;
      description: string | null;
      coverPhoto: string | null;
      photoCount: number;
      photos: { id: string; mediaUrl: string; caption: string | null; sortOrder: number }[];
    }[];
  }>(GET_ALBUMS, {
    variables: { coupleId: couple.id },
  });

  const { data: quizzesData } = useQuery<{
    quizzes: {
      id: string;
      title: string;
      description: string | null;
      isActive: boolean;
    }[];
  }>(GET_QUIZZES, {
    variables: { coupleId: couple.id },
  });

  useEffect(() => {
    incrementView({ variables: { slug: couple.slug } }).catch(() => {});
  }, [couple.slug, incrementView]);

  const defaultOrder = ['hero', 'stats', 'timeline', 'gallery', 'albums', 'wishes', 'quiz', 'events', 'gifts'];
  const savedOrder = layout.sectionOrder?.length ? layout.sectionOrder : defaultOrder;
  // Ensure any new sections not in saved config are appended at the end
  const missingSections = defaultOrder.filter((s) => !savedOrder.includes(s));
  const sectionOrder = [...savedOrder, ...missingSections];


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
          heroStyle={layout.heroStyle}
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

    albums: () =>
      (albumsData?.albums?.length ?? 0) > 0 ? (
        <ScrollReveal key="albums">
          <div className="space-y-6">
            <h2 className="text-center text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
              Photo Albums
            </h2>
            <AlbumSection albums={albumsData!.albums} galleryMode={layout.galleryMode} />
          </div>
        </ScrollReveal>
      ) : null,

    gifts: () =>
      (giftData?.giftAccounts?.filter((g) => g.isActive).length ?? 0) > 0 ? (
        <ScrollReveal key="gifts">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
                Gift Registry
              </h2>
              <div className="mx-auto mt-2 flex items-center justify-center gap-2" style={{ color: 'var(--theme-text-muted)', opacity: 0.5 }}>
                <span className="h-px w-8" style={{ background: 'var(--theme-text-muted)' }} />
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="h-px w-8" style={{ background: 'var(--theme-text-muted)' }} />
              </div>
            </div>
            <GiftCards accounts={giftData!.giftAccounts.filter((g) => g.isActive)} />
          </div>
        </ScrollReveal>
      ) : null,

    quiz: () =>
      (quizzesData?.quizzes?.filter((q) => q.isActive).length ?? 0) > 0 ? (
        <ScrollReveal key="quiz">
          <div className="space-y-4">
            <h2 className="text-center text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
              Quiz Time
            </h2>
            <p className="text-center text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              How well do you know this couple?
            </p>
            <QuizPlayer quizzes={quizzesData!.quizzes} coupleId={couple.id} />
          </div>
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

      {/* Owner floating nav — back to dashboard */}
      {isOwner && (
        <Link href="/dashboard">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="fixed bottom-6 left-4 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md"
            style={{
              background: 'var(--theme-surface, #fff)',
              color: 'var(--theme-text, #111)',
              border: '1px solid var(--theme-border, #e5e7eb)',
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </motion.div>
        </Link>
      )}
      {musicConfig?.enabled && musicConfig.tracks.length > 0 && (
        <MusicPlayer config={musicConfig} slug={couple.slug} />
      )}

      {/* Custom CSS injection (scoped, sanitized) */}
      {layout.customCss && (
        <style dangerouslySetInnerHTML={{
          __html: sanitizeCss(layout.customCss),
        }} />
      )}

      <div className="couple-page relative z-10 mx-auto max-w-4xl space-y-8 px-4 py-8">
        {sectionOrder.map((sectionId) => {
          const render = sectionRenderers[sectionId];
          return render ? render() : null;
        })}
      </div>
    </ThemeProvider>
  );
}
