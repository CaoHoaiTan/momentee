import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <img src="/momentee_logo/momentee-logo-primary.svg" alt="Momentee" className="mx-auto mb-6 h-10" />
        <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-4 text-sm text-gray-400">Last updated: March 2026</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We collect information you provide directly to us when you create an account, build your couple page,
            and interact with our platform — including your name, email address, profile information, and any
            content you upload or post.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, process
            transactions, send notifications, and personalize your experience on Momentee.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Information Sharing</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We do not sell or share your personal information with third parties for their marketing purposes.
            Your couple page content is only visible publicly if you choose to make it public in your privacy
            settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Data Security</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Your Rights</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            You may access, update, or delete your personal information through your account settings at any
            time. If you wish to delete your account entirely, use the Danger Zone section in your dashboard
            settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Contact Us</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us through our website.
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
