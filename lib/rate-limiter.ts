/**
 * Token Bucket Rate Limiter
 *
 * Per-user rate limiting using the token bucket algorithm.
 * State is held in a module-level Map (lives for the lifetime of the
 * Node.js server process). Vercel Fluid compute keeps instances warm,
 * so this is effective in practice. For multi-instance deployments,
 * swap the Map for a Redis/Upstash store.
 *
 * Default: 20 tokens, refill rate 20/min (1 token per 3 seconds).
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Tokens remaining after this request */
  remaining: number;
  /** Epoch ms when the bucket will be full again */
  resetAt: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number; // epoch ms
}

const CAPACITY = 20;
const REFILL_RATE_PER_MS = CAPACITY / 60_000; // 20 tokens per minute

// Module-level store — persists across requests in the same process
const buckets = new Map<string, Bucket>();

export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();

  let bucket = buckets.get(userId);

  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
    buckets.set(userId, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refilled = elapsed * REFILL_RATE_PER_MS;

  if (refilled > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + refilled);
    bucket.lastRefill = now;
  }

  if (bucket.tokens < 1) {
    const msUntilFull = (CAPACITY - bucket.tokens) / REFILL_RATE_PER_MS;
    return {
      allowed: false,
      remaining: 0,
      resetAt: now + Math.ceil(msUntilFull),
    };
  }

  bucket.tokens -= 1;
  const msUntilFull = (CAPACITY - bucket.tokens) / REFILL_RATE_PER_MS;

  return {
    allowed: true,
    remaining: Math.floor(bucket.tokens),
    resetAt: now + Math.ceil(msUntilFull),
  };
}

/** Exposed for tests — resets all buckets */
export function _resetBuckets() {
  buckets.clear();
}
