import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { getStripe, isStripeConfigured, STRIPE_PRICES } from '../config/stripe.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { PLAN_LIMITS } from '@momentee/shared';

// ─── Plan limit checking ────────────────────────────────────────────

export async function checkPlanLimit(
  coupleId: string,
  feature: keyof (typeof PLAN_LIMITS)['free'],
  userId?: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  if (userId) await verifyCoupleOwnership(coupleId, userId);

  const couple = await db
    .selectFrom('couples')
    .select('plan')
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) throw NotFoundError('Couple');

  const limits = PLAN_LIMITS[couple.plan];
  const limit = limits[feature];

  // -1 means unlimited
  if (limit === -1) return { allowed: true, current: 0, limit: -1 };

  let current = 0;
  if (feature === 'milestones') {
    const result = await db
      .selectFrom('milestones')
      .where('couple_id', '=', coupleId)
      .select(db.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow();
    current = Number(result.count);
  } else if (feature === 'posts') {
    const result = await db
      .selectFrom('posts')
      .where('couple_id', '=', coupleId)
      .select(db.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow();
    current = Number(result.count);
  } else if (feature === 'albums') {
    const result = await db
      .selectFrom('albums')
      .where('couple_id', '=', coupleId)
      .select(db.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow();
    current = Number(result.count);
  } else if (feature === 'music_tracks') {
    const result = await db
      .selectFrom('couples')
      .select('background_music')
      .where('id', '=', coupleId)
      .executeTakeFirst();
    if (result?.background_music) {
      const config = result.background_music as { tracks?: unknown[] };
      current = Array.isArray(config.tracks) ? config.tracks.length : 0;
    }
  }

  return { allowed: current < limit, current, limit };
}

export function enforcePlanLimit(
  check: { allowed: boolean; current: number; limit: number },
  featureName: string,
) {
  if (!check.allowed) {
    throw ValidationError(
      `You've reached the limit of ${check.limit} ${featureName} on your current plan. Upgrade to add more.`,
    );
  }
}

// ─── Subscription management ────────────────────────────────────────

export async function getSubscription(coupleId: string, userId?: string) {
  if (userId) await verifyCoupleOwnership(coupleId, userId);

  return db
    .selectFrom('subscriptions')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .executeTakeFirst();
}

export async function createOrGetSubscription(coupleId: string) {
  const existing = await getSubscription(coupleId);
  if (existing) return existing;

  return db
    .insertInto('subscriptions')
    .values({
      id: createId(),
      couple_id: coupleId,
      plan: 'free',
      status: 'active',
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function upgradePlan(
  coupleId: string,
  userId: string,
  plan: 'premium' | 'premium_plus',
) {
  await verifyCoupleOwnership(coupleId, userId);

  const sub = await createOrGetSubscription(coupleId);
  await db
    .updateTable('subscriptions')
    .set({ plan, status: 'active', updated_at: new Date() as any })
    .where('id', '=', sub.id)
    .execute();

  await db
    .updateTable('couples')
    .set({ plan, updated_at: new Date() as any })
    .where('id', '=', coupleId)
    .execute();

  return db
    .selectFrom('subscriptions')
    .selectAll()
    .where('id', '=', sub.id)
    .executeTakeFirstOrThrow();
}

export async function downgradePlan(coupleId: string, userId?: string) {
  if (userId) await verifyCoupleOwnership(coupleId, userId);

  const sub = await getSubscription(coupleId);
  if (!sub) return;

  await db
    .updateTable('subscriptions')
    .set({ plan: 'free', status: 'canceled', updated_at: new Date() as any })
    .where('id', '=', sub.id)
    .execute();

  await db
    .updateTable('couples')
    .set({ plan: 'free', updated_at: new Date() as any })
    .where('id', '=', coupleId)
    .execute();
}

// ─── Stripe integration ────────────────────────────────────────────

export async function createCheckoutUrl(
  coupleId: string,
  userId: string,
  plan: 'premium' | 'premium_plus',
): Promise<string> {
  await verifyCoupleOwnership(coupleId, userId);

  if (!isStripeConfigured()) {
    if (env.NODE_ENV === 'production') {
      throw ValidationError('Payment system is not configured. Please contact support.');
    }
    // Direct upgrade without payment in dev mode only
    await upgradePlan(coupleId, userId, plan);
    return '/dashboard/settings?upgraded=true';
  }

  const stripe = getStripe();
  const priceId = STRIPE_PRICES[plan];
  if (!priceId) {
    throw ValidationError(`Price not configured for plan: ${plan}`);
  }

  // Get or create Stripe customer
  const sub = await createOrGetSubscription(coupleId);
  let customerId = sub.stripe_customer_id;

  if (!customerId) {
    const user = await db
      .selectFrom('users')
      .select(['email', 'name'])
      .where('id', '=', userId)
      .executeTakeFirstOrThrow();

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { coupleId, userId },
    });
    customerId = customer.id;

    await db
      .updateTable('subscriptions')
      .set({ stripe_customer_id: customerId })
      .where('id', '=', sub.id)
      .execute();
  }

  const origin = env.CORS_ORIGIN;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?upgraded=true`,
    cancel_url: `${origin}/dashboard/settings?canceled=true`,
    metadata: { coupleId, userId, plan },
    subscription_data: {
      metadata: { coupleId, plan },
    },
  });

  return session.url || '/dashboard/settings';
}

export async function createBillingPortalUrl(
  coupleId: string,
  userId: string,
): Promise<string> {
  await verifyCoupleOwnership(coupleId, userId);

  if (!isStripeConfigured()) {
    return '/dashboard/settings';
  }

  const stripe = getStripe();
  const sub = await getSubscription(coupleId);

  if (!sub?.stripe_customer_id) {
    return '/dashboard/settings';
  }

  const origin = env.CORS_ORIGIN;
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/dashboard/settings`,
  });

  return session.url;
}

// ─── Stripe webhook handler ────────────────────────────────────────

export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const stripe = getStripe();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const coupleId = session.metadata?.coupleId;
      const plan = session.metadata?.plan as 'premium' | 'premium_plus' | undefined;
      const stripeSubscriptionId = session.subscription as string | undefined;

      if (coupleId && plan && stripeSubscriptionId) {
        const sub = await createOrGetSubscription(coupleId);

        await db
          .updateTable('subscriptions')
          .set({
            plan,
            status: 'active',
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: session.customer as string,
            updated_at: new Date() as any,
          })
          .where('id', '=', sub.id)
          .execute();

        await db
          .updateTable('couples')
          .set({ plan, updated_at: new Date() as any })
          .where('id', '=', coupleId)
          .execute();
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      const metadata = subscription.metadata as Record<string, string> | undefined;
      const coupleId = metadata?.coupleId;

      if (coupleId) {
        const subStatus = subscription.status as string;
        const status = subStatus === 'active' ? 'active'
          : subStatus === 'past_due' ? 'past_due'
          : subStatus === 'trialing' ? 'trialing'
          : 'canceled';

        const periodStart = subscription.current_period_start as number | undefined;
        const periodEnd = subscription.current_period_end as number | undefined;

        await db
          .updateTable('subscriptions')
          .set({
            status,
            ...(periodStart ? { current_period_start: new Date(periodStart * 1000).toISOString() } : {}),
            ...(periodEnd ? { current_period_end: new Date(periodEnd * 1000).toISOString() } : {}),
            updated_at: new Date() as any,
          })
          .where('couple_id', '=', coupleId)
          .execute();
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      const metadata = subscription.metadata as Record<string, string> | undefined;
      const coupleId = metadata?.coupleId;

      if (coupleId) {
        await db
          .updateTable('subscriptions')
          .set({
            plan: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date() as any,
          })
          .where('couple_id', '=', coupleId)
          .execute();

        await db
          .updateTable('couples')
          .set({ plan: 'free', updated_at: new Date() as any })
          .where('id', '=', coupleId)
          .execute();
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      const subscriptionId = invoice.subscription as string | undefined;

      if (subscriptionId) {
        await db
          .updateTable('subscriptions')
          .set({ status: 'past_due', updated_at: new Date() as any })
          .where('stripe_subscription_id', '=', subscriptionId)
          .execute();
      }
      break;
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

async function verifyCoupleOwnership(coupleId: string, userId: string) {
  const couple = await db
    .selectFrom('couples')
    .select(['partner1_id', 'partner2_id'])
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) throw NotFoundError('Couple');
  if (couple.partner1_id !== userId && couple.partner2_id !== userId) {
    throw ForbiddenError('You are not a member of this couple');
  }
}
