'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { useCouple } from '../../../hooks/useCouple';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';

const STATS_CONFIG = [
  { key: 'daysTogether', label: 'Days Together', emoji: '💕', gradient: 'from-[var(--color-coral)] to-[var(--color-orange)]', bgLight: 'bg-[var(--color-coral)]/5' },
  { key: 'totalWishes', label: 'Total Wishes', emoji: '💌', gradient: 'from-[var(--color-teal)] to-[#34d399]', bgLight: 'bg-[var(--color-teal)]/5' },
  { key: 'totalPhotos', label: 'Total Photos', emoji: '📸', gradient: 'from-[var(--color-orange)] to-[var(--color-gold)]', bgLight: 'bg-[var(--color-orange)]/5' },
  { key: 'viewCount', label: 'Page Views', emoji: '👀', gradient: 'from-[var(--color-purple)] to-[#a78bfa]', bgLight: 'bg-[var(--color-purple)]/5' },
];

const QUICK_ACTIONS = [
  { href: '/dashboard/posts', label: 'Create Post', emoji: '📸', description: 'Share a new moment', color: 'var(--color-coral)' },
  { href: '/dashboard/milestones', label: 'Add Milestone', emoji: '✨', description: 'Mark a special day', color: 'var(--color-gold)' },
  { href: '/dashboard/wishes', label: 'View Wishes', emoji: '💌', description: 'Read your blessings', color: 'var(--color-teal)' },
  { href: '/dashboard/events', label: 'Plan Event', emoji: '📅', description: 'Organize a gathering', color: 'var(--color-purple)' },
  { href: '/dashboard/quiz', label: 'Create Quiz', emoji: '🧩', description: 'Test your friends', color: 'var(--color-orange)' },
  { href: '/dashboard/gift', label: 'Gift Registry', emoji: '🎁', description: 'Manage gift accounts', color: 'var(--color-coral)' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();

  useEffect(() => {
    if (authLoading || coupleLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!couple) {
      router.push('/onboarding');
    }
  }, [authLoading, coupleLoading, isAuthenticated, couple, router]);

  if (authLoading || coupleLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!isAuthenticated || !couple) return null;

  const statValues: Record<string, number> = {
    daysTogether: couple.daysTogether,
    totalWishes: couple.totalWishes,
    totalPhotos: couple.totalPhotos,
    viewCount: couple.viewCount,
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--color-coral)] via-[var(--color-orange)] to-[var(--color-purple)] p-6 text-white shadow-lg shadow-[var(--color-coral)]/20 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">Welcome back,</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{user?.name} 👋</h1>
            <p className="mt-1 text-white/80">
              Managing <span className="font-semibold">{couple.displayName}</span>
            </p>
          </div>
          <Link href={`/${couple.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="!border-white/30 !text-white hover:!bg-white/10">
              View Public Page
              <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map((stat) => (
          <div key={stat.key} className={`rounded-2xl ${stat.bgLight} p-5 ring-1 ring-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-md`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-xl shadow-sm`}>
                {stat.emoji}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{statValues[stat.key]?.toLocaleString() ?? 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-[var(--color-coral)]/20">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${action.color}12` }}>
                  {action.emoji}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
                <svg className="ml-auto h-5 w-5 text-gray-300 transition-colors group-hover:text-[var(--color-coral)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Invite Partner */}
      {!couple.partner2 && couple.inviteCode && (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--color-purple)]/10 to-[var(--color-teal)]/10 p-6 ring-1 ring-[var(--color-purple)]/20">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💍</span>
              <div>
                <h3 className="font-semibold text-gray-900">Invite Your Partner</h3>
                <p className="text-sm text-gray-500">Share this code so they can join your couple page</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded-xl bg-white px-5 py-2.5 text-lg font-mono font-bold tracking-widest text-[var(--color-purple)] shadow-sm">
                {couple.inviteCode}
              </code>
              <Button
                variant="primary"
                size="sm"
                className="!bg-[var(--color-purple)] hover:!bg-[var(--color-purple-dark)]"
                onClick={() => navigator.clipboard.writeText(couple.inviteCode!)}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
