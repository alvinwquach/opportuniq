import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis is optional — when env vars are absent (e.g. local dev without Upstash)
// all rate-limit checks pass through.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const chatRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      analytics: true,
      prefix: "opportuniq:chat",
    })
  : null;

export async function checkRateLimit(userId: string) {
  if (!chatRateLimit) {
    return { allowed: true, remaining: 20, resetAt: Date.now() + 60_000 };
  }
  const { success, remaining, reset } = await chatRateLimit.limit(userId);
  return { allowed: success, remaining, resetAt: reset };
}

export { redis };

// Keep _resetBuckets for test compatibility but make it a no-op
// (Redis state is managed externally, not in-memory)
export function _resetBuckets() {}
