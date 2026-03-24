import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <img src="/momentee_logo/momentee-logo-primary.svg" alt="Momentee" className="mx-auto mb-6 h-10" />
        <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-4 text-sm text-gray-400">Last updated: March 2026</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            By accessing or using Momentee, you agree to be bound by these Terms of Service and our Privacy
            Policy. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Use of Service</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            You may use Momentee only for lawful purposes and in accordance with these Terms. You agree not
            to use the service in any way that violates any applicable local, national, or international law
            or regulation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. User Content</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            You retain ownership of any content you post on Momentee. By posting content, you grant us a
            non-exclusive license to use, display, and distribute your content in connection with operating
            the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Account Responsibilities</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account. Please notify us immediately of any unauthorized use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Termination</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We reserve the right to suspend or terminate your account at our discretion if you violate these
            Terms. You may also delete your account at any time through your dashboard settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Limitation of Liability</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Momentee is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any
            indirect, incidental, or consequential damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">7. Changes to Terms</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We may update these Terms from time to time. We will notify you of significant changes by posting
            the new Terms on this page with an updated date.
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
