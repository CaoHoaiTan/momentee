import Stripe from 'stripe';
import { env } from './env.js';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-03-31.basil',
    });
  }

  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}

// Stripe price IDs — configure these in your Stripe dashboard
// and set them in .env. Fallback to empty string (will fail at checkout time).
export const STRIPE_PRICES = {
  premium: env.STRIPE_SECRET_KEY ? (process.env.STRIPE_PRICE_PREMIUM || '') : '',
  premium_plus: env.STRIPE_SECRET_KEY ? (process.env.STRIPE_PRICE_PREMIUM_PLUS || '') : '',
} as const;
