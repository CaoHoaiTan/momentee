'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: '📸',
    title: 'Share Memories',
    description: 'Upload photos, write love letters, and build a gallery of your best moments together.',
    color: 'var(--color-coral)',
  },
  {
    icon: '💌',
    title: 'Receive Wishes',
    description: 'Friends & family send heartfelt blessings to your page. No login needed for them!',
    color: 'var(--color-teal)',
  },
  {
    icon: '✨',
    title: 'Track Milestones',
    description: 'First date, first kiss, proposal — build a beautiful timeline of your love story.',
    color: 'var(--color-purple)',
  },
  {
    icon: '📅',
    title: 'Plan Events',
    description: 'Create events, collect RSVPs, and manage guest lists for your celebrations.',
    color: 'var(--color-orange)',
  },
  {
    icon: '🧩',
    title: 'Quiz Game',
    description: '"How well do you know us?" Create fun quizzes and see who scores the highest!',
    color: 'var(--color-gold)',
  },
  {
    icon: '🎁',
    title: 'Gift Registry',
    description: 'Share your bank details elegantly so friends can send monetary gifts with one tap.',
    color: 'var(--color-coral)',
  },
];

const STEPS = [
  { step: '01', title: 'Create your page', description: 'Sign up and set up your couple profile in under a minute.' },
  { step: '02', title: 'Add your story', description: 'Upload photos, write milestones, and customize your theme.' },
  { step: '03', title: 'Share with everyone', description: 'Send your unique link to friends & family and watch the love pour in.' },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/"><img src="/momentee_logo/momentee-logo-primary.svg" alt="Momentee" className="h-8" /></Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/explore" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Explore</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors md:block">Login</Link>
            <Link
              href="/register"
              className="hidden rounded-full bg-[var(--color-coral)] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--color-coral-dark)] hover:shadow-lg hover:shadow-[var(--color-coral)]/25 md:block"
            >
              Get Started Free
            </Link>
            {/* Mobile Hamburger */}
            <button
              className="flex items-center md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href="/explore" className="text-sm font-medium text-gray-600 hover:text-[var(--color-coral)]" onClick={() => setMobileMenuOpen(false)}>
                Explore
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-[var(--color-coral)]" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Link>
              <hr className="border-gray-100" />
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-[var(--color-coral)]" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[var(--color-coral)] px-4 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="relative bg-white">
        {/* Decorative blobs */}
        <div className="animate-float absolute -top-20 right-10 h-72 w-72 rounded-full bg-[var(--color-coral)]/10 blur-3xl" />
        <div className="animate-float-delayed absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-[var(--color-purple)]/10 blur-3xl" />
        <div className="animate-float absolute top-40 left-1/2 h-48 w-48 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-coral)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-coral)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-coral)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-coral)]" />
              </span>
              Now open for couples everywhere
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-gradient">Every couple</span>
              <br />
              <span className="text-gray-900">has a story</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
              Your love deserves its own space on the internet. Create a beautiful page, share memories, receive wishes, and celebrate your journey together.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-coral)] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-[var(--color-coral-dark)] hover:shadow-xl hover:shadow-[var(--color-coral)]/25"
              >
                Start Your Story
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
              >
                Explore Love Stories
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">💕</span> 100% Free to start
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">⚡</span> Setup in 60 seconds
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🔒</span> Private & secure
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-coral)]">How it works</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Three steps to your love page
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < 2 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-[var(--color-coral)]/30 to-transparent sm:block" />
                )}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-orange)] text-xl font-bold text-white shadow-lg shadow-[var(--color-coral)]/20">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-teal)]">Features</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything your love story needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              More than just a couple page — it&apos;s your digital love story, gift registry, event planner, and memory vault all in one.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${f.color}12` }}
                >
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-coral)] via-[var(--color-orange)] to-[var(--color-purple)] py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Ready to tell your story?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join thousands of couples already sharing their journey on Momentee. It&apos;s free, beautiful, and takes less than a minute.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-[var(--color-coral)] shadow-xl transition-all hover:shadow-2xl hover:scale-105"
            >
              Create Your Page
              <span className="text-xl">💕</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-all hover:border-white hover:bg-white/10"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div>
              <img src="/momentee_logo/momentee-logo-primary.svg" alt="Momentee" className="h-7" />
              <p className="mt-1 text-sm text-gray-400">Every couple has a story.</p>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/explore" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Explore</Link>
              <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">About</Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Privacy</Link>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Momentee. Made with 💕</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
