import { Router, type IRouter } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../services/billing.service.js';
import { isStripeConfigured } from '../config/stripe.js';

const router: IRouter = Router();

// Stripe requires the raw body for signature verification
router.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!isStripeConfigured()) {
      res.status(400).json({ error: 'Stripe not configured' });
      return;
    }

    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    try {
      await handleStripeWebhook(req.body as Buffer, signature);
      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook error:', err);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  },
);

export default router;
