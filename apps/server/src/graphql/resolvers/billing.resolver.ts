import * as billingService from '../../services/billing.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

export const billingResolvers = {
  Query: {
    subscription: async (
      _parent: unknown,
      args: { coupleId: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return billingService.getSubscription(args.coupleId);
    },

    checkPlanLimit: async (
      _parent: unknown,
      args: { coupleId: string; feature: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return billingService.checkPlanLimit(
        args.coupleId,
        args.feature as 'milestones' | 'posts' | 'albums' | 'media_per_post',
      );
    },
  },

  Mutation: {
    createCheckoutSession: async (
      _parent: unknown,
      args: { coupleId: string; plan: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return billingService.createCheckoutUrl(
        args.coupleId,
        context.user.userId,
        args.plan as 'premium' | 'premium_plus',
      );
    },

    createBillingPortal: async (
      _parent: unknown,
      args: { coupleId: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return billingService.createBillingPortalUrl(args.coupleId, context.user.userId);
    },
  },

  Subscription: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    stripeCustomerId: (parent: { stripe_customer_id: string | null }) => parent.stripe_customer_id,
    stripeSubscriptionId: (parent: { stripe_subscription_id: string | null }) => parent.stripe_subscription_id,
    currentPeriodStart: (parent: { current_period_start: Date | null }) => parent.current_period_start,
    currentPeriodEnd: (parent: { current_period_end: Date | null }) => parent.current_period_end,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
    updatedAt: (parent: { updated_at: Date }) => parent.updated_at,
  },

  SubscriptionStatus: {
    ACTIVE: 'active',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
    TRIALING: 'trialing',
  },
};
