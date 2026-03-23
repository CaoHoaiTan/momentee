import { GraphQLError } from 'graphql';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * In-memory per-key rate limiter for GraphQL operations.
 * Throws a GraphQL error if the limit is exceeded.
 */
export function checkRateLimit(
  key: string,
  operation: string,
  maxPerWindow: number,
  windowMs: number,
): void {
  const compositeKey = `${operation}:${key}`;
  const now = Date.now();
  const entry = store.get(compositeKey);

  if (!entry || entry.resetAt < now) {
    store.set(compositeKey, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count++;
  if (entry.count > maxPerWindow) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    throw new GraphQLError(
      `Too many requests. Please try again in ${retryAfterSec} seconds.`,
      { extensions: { code: 'RATE_LIMITED', retryAfter: retryAfterSec } },
    );
  }
}
