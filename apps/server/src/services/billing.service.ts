import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { PLAN_LIMITS } from '@momentee/shared';

// ─── Plan limit checking ────────────────────────────────────────────

export async function checkPlanLimit(
  coupleId: string,
  feature: keyof (typeof PLAN_LIMITS)['free'],
): Promise<{ allowed: boolean; current: number; limit: number }> {
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

export async function getSubscription(coupleId: string) {
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

  // Update subscription
  const sub = await createOrGetSubscription(coupleId);
  await db
    .updateTable('subscriptions')
    .set({ plan, status: 'active', updated_at: new Date() as any })
    .where('id', '=', sub.id)
    .execute();

  // Update couple plan
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

export async function downgradePlan(coupleId: string) {
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

// ─── Stripe integration stubs ───────────────────────────────────────
// These will work when STRIPE_SECRET_KEY is configured in env

export async function createCheckoutUrl(coupleId: string, userId: string, plan: 'premium' | 'premium_plus'): Promise<string> {
  await verifyCoupleOwnership(coupleId, userId);

  // When Stripe is not configured, return a placeholder
  if (!env.STRIPE_SECRET_KEY) {
    // Direct upgrade without payment in dev mode
    await upgradePlan(coupleId, userId, plan);
    return '/dashboard/settings?upgraded=true';
  }

  // Stripe checkout session would be created here
  // const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({...});
  // return session.url;
  return '/dashboard/settings?upgraded=true';
}

export async function createBillingPortalUrl(coupleId: string, userId: string): Promise<string> {
  await verifyCoupleOwnership(coupleId, userId);

  if (!env.STRIPE_SECRET_KEY) {
    return '/dashboard/settings';
  }

  // Stripe billing portal would be created here
  return '/dashboard/settings';
}

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
