'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../../hooks/useAuth';
import { useCouple } from '../../hooks/useCouple';
import { CREATE_CHECKOUT_SESSION } from '../../graphql/mutations/billing.mutations';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/footer';
import { useToast } from '../../lib/toast-context';

const PLANS = [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '10 milestones',
      '50 posts',
      '3 albums',
      '5 media per post',
      'Public couple page',
      'Wishes & blessings',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    key: 'premium' as const,
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    features: [
      '100 milestones',
      '500 posts',
      '20 albums',
      '20 media per post',
      'All free features',
      '1 background music track',
      'Custom themes & CSS',
      'Priority support',
    ],
    cta: 'Upgrade',
    highlighted: true,
  },
  {
    key: 'premium_plus' as const,
    name: 'Premium Plus',
    price: '$9.99',
    period: '/month',
    features: [
      'Unlimited milestones',
      'Unlimited posts',
      'Unlimited albums',
      'Unlimited media',
      'All premium features',
      '3 background music tracks',
      'Custom domain',
      'Analytics dashboard',
    ],
    cta: 'Go Plus',
    highlighted: false,
  },
];

export default function PricingContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError } = useToast();
  const [createCheckout] = useMutation<{ createCheckoutSession: string }>(CREATE_CHECKOUT_SESSION);

  // Wait for auth + couple data before rendering plan cards
  const dataReady = !authLoading && (!isAuthenticated || !coupleLoading);
  // GraphQL returns enum values like 'FREE', 'PREMIUM', 'PREMIUM_PLUS' — normalize to lowercase
  const currentPlan = couple?.plan?.toLowerCase() ?? null;

  const handleUpgrade = async (planKey: string) => {
    if (!isAuthenticated || !couple) {
      window.location.href = '/register';
      return;
    }

    if (planKey === 'free') return;
    if (couple.plan === planKey) return;

    try {
      setLoadingPlan(planKey);
      const { data } = await createCheckout({
        variables: { coupleId: couple.id, plan: planKey },
      });
      const url = data?.createCheckoutSession;
      if (url) {
        window.location.href = url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout';
      showError(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planKey: string) =>
    isAuthenticated && currentPlan === planKey;

  const isDowngrade = (planKey: string) => {
    if (!currentPlan) return false;
    const order = { free: 0, premium: 1, premium_plus: 2 };
    return (order[planKey as keyof typeof order] ?? 0) < (order[currentPlan as keyof typeof order] ?? 0);
  };

  return (
    <>
    <Navbar />
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="mt-3 text-lg text-gray-500">
          Start free, upgrade when you need more
        </p>
      </div>

      {/* Current plan banner for logged-in users */}
      {isAuthenticated && currentPlan && dataReady && (
        <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-xl bg-[var(--color-teal)]/10 px-5 py-3 ring-1 ring-[var(--color-teal)]/20">
          <span className="text-xl">✨</span>
          <p className="text-sm text-gray-700">
            You are on the <span className="font-bold capitalize text-[var(--color-teal)]">{currentPlan!.replace('_', ' ')}</span> plan
            {currentPlan !== 'premium_plus' && ' — upgrade for more features!'}
          </p>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-8 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-[var(--color-coral)] to-[var(--color-orange)] text-white shadow-xl'
                : 'bg-white shadow-sm ring-1 ring-gray-100'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-[var(--color-coral)]">
                Most Popular
              </div>
            )}
            {isCurrentPlan(plan.key) && (
              <div className="absolute -top-3 right-4 rounded-full bg-[var(--color-teal)] px-3 py-1 text-xs font-bold text-white">
                Current
              </div>
            )}
            <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
              {plan.name}
            </h3>
            <div className="mt-4">
              <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.price}
              </span>
              <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                {plan.period}
              </span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <svg
                    className={`h-4 w-4 ${plan.highlighted ? 'text-white' : 'text-[var(--color-coral)]'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={plan.highlighted ? 'text-white/90' : 'text-gray-600'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {!dataReady ? (
                <div className="flex justify-center py-2">
                  <LoadingSpinner size="sm" />
                </div>
              ) : isCurrentPlan(plan.key) ? (
                <Button
                  variant={plan.highlighted ? 'outline' : 'primary'}
                  size="md"
                  className={`w-full ${plan.highlighted ? '!border-white !text-white' : ''}`}
                  disabled
                >
                  Current Plan
                </Button>
              ) : !isAuthenticated ? (
                <Link href="/register">
                  <Button
                    variant={plan.highlighted ? 'outline' : 'primary'}
                    size="md"
                    className={`w-full ${plan.highlighted ? '!border-white !text-white hover:!bg-white/10' : ''}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              ) : isDowngrade(plan.key) ? (
                <Button variant="ghost" size="md" className="w-full" disabled>
                  Included in your plan
                </Button>
              ) : (
                <Button
                  variant={plan.highlighted ? 'outline' : 'primary'}
                  size="md"
                  className={`w-full ${plan.highlighted ? '!border-white !text-white hover:!bg-white/10' : ''}`}
                  loading={loadingPlan === plan.key}
                  onClick={() => handleUpgrade(plan.key)}
                >
                  {plan.cta}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-6 text-left">
          {[
            {
              q: 'Can I try Premium for free?',
              a: 'Yes! Start with our free plan and upgrade anytime. No credit card required to get started.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Absolutely. Cancel your subscription at any time from your dashboard settings. No penalties.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, debit cards, and local Vietnamese payment methods through Stripe.',
            },
            {
              q: 'What happens to my data if I downgrade?',
              a: "Your data is preserved. You just won't be able to add more content beyond the free plan limits until you upgrade again.",
            },
          ].map((faq, i) => (
            <div key={faq.q} className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
              <button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <svg
                  className={`ml-4 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-3">
                  <p className="text-sm text-gray-500">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
