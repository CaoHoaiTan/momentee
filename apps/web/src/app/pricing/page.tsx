import type { Metadata } from 'next';
import PricingContent from './pricing-content';

export const metadata: Metadata = {
  title: 'Pricing - Momentee',
  description: 'Simple, transparent pricing. Start free, upgrade when you need more.',
};

export default function PricingPage() {
  return <PricingContent />;
}
