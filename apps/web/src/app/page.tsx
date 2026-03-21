import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-orange)] bg-clip-text text-transparent">
                Every couple
              </span>{' '}
              has a story
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Celebrate your love story with Momentee. Share memories, receive wishes, and track the
              milestones that make your journey together special.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--color-coral)] px-7 py-3.5 text-lg font-medium text-white transition-colors hover:bg-[var(--color-coral-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:ring-offset-2"
              >
                Get Started
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--color-coral)] px-7 py-3.5 text-lg font-medium text-[var(--color-coral)] transition-colors hover:bg-[var(--color-coral)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:ring-offset-2"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[var(--color-coral)]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[var(--color-orange)]/10 blur-3xl" />
      </header>

      {/* Features Section */}
      <section className="border-t border-gray-100 bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Your love, your way</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              Everything you need to celebrate and share your journey together.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-coral)]/10">
                <svg
                  className="h-6 w-6 text-[var(--color-coral)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Share Memories</h3>
              <p className="mt-2 text-gray-500">
                Upload photos, write stories, and preserve the moments that matter most to both of
                you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-teal)]/10">
                <svg
                  className="h-6 w-6 text-[var(--color-teal)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Receive Wishes</h3>
              <p className="mt-2 text-gray-500">
                Let friends and family send heartfelt wishes for your special occasions and
                celebrations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-orange)]/10">
                <svg
                  className="h-6 w-6 text-[var(--color-orange)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Track Milestones</h3>
              <p className="mt-2 text-gray-500">
                Never forget an anniversary, first date, or any milestone in your relationship
                timeline.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
