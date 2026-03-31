import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "opportuniq:chat",
});

export async function checkRateLimit(userId: string) {
  const { success, remaining, reset } = await chatRateLimit.limit(userId);
  return { allowed: success, remaining, resetAt: reset };
}

export { redis };

// Keep _resetBuckets for test compatibility but make it a no-op
// (Redis state is managed externally, not in-memory)
export function _resetBuckets() {}
