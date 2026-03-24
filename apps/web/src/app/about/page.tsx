import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <img src="/momentee_logo/momentee-logo-primary.svg" alt="Momentee" className="mx-auto mb-6 h-10" />
        <h1 className="text-4xl font-bold text-gray-900">About Momentee</h1>
        <p className="mt-4 text-lg text-gray-500">Every couple has a story worth preserving.</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Momentee is a couple-focused platform that helps partners preserve their most precious memories,
            share their love story with friends and family, and receive heartfelt blessings from the people
            they care about most.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
          <ul className="mt-3 space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[var(--color-coral)]">✓</span>
              <span>A beautiful public page to share your love story</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[var(--color-coral)]">✓</span>
              <span>Milestone timelines, photo galleries, and memory posts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[var(--color-coral)]">✓</span>
              <span>A wish wall where friends and family can send their love</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[var(--color-coral)]">✓</span>
              <span>Events, quizzes, and gift sharing features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[var(--color-coral)]">✓</span>
              <span>Customizable themes to match your unique story</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Built for Couples</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Momentee was created with the Vietnamese market in mind — a place where love, family, and
            community are deeply intertwined. We believe every relationship deserves a home on the internet
            where memories live forever.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-coral)] hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
