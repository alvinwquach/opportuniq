/**
 * Feature Flags — PostHog wrapper
 *
 * Separates deploying code from enabling features.
 * Pattern:
 *   1. Deploy with flag OFF (0% rollout in PostHog dashboard)
 *   2. Enable for yourself only (add your userId to the "beta" group)
 *   3. Test in production
 *   4. Ramp to 25% → watch Sentry → 100%
 *   5. If anything breaks: flip the flag OFF in PostHog (5 seconds, no redeploy)
 *   6. After a week stable at 100%: remove the if/else from the call site
 *
 * Usage in an API route or server action:
 *   const useNewSearch = await getFeatureFlag("firecrawl-search-v2", userId);
 *   if (useNewSearch) {
 *     // new code path
 *   } else {
 *     // old code path — untouched, still works
 *   }
 *
 * Flags to create in the PostHog dashboard (not in code):
 *   firecrawl-search-v2        → firecrawl.search() replacing Google scraping
 *   firecrawl-json-extraction  → JSON extraction replacing regex parsing
 *   firecrawl-interact         → interact() for retailer inventory checks
 *   firecrawl-enhanced-mode    → enhanced scraping mode for retailer sites
 *   rag-enabled                → PgVector RAG retrieval in diagnosis flow
 *   eval-pipeline              → automated response quality checks
 */

import { PostHog } from "posthog-node";

// Singleton — one client per serverless instance.
// Lazy so it doesn't throw at import time if POSTHOG_API_KEY isn't set yet.
let _serverClient: PostHog | null = null;

function getServerClient(): PostHog {
  if (!_serverClient) {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (!apiKey) {
      throw new Error("POSTHOG_API_KEY is not set");
    }
    _serverClient = new PostHog(apiKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      // flushAt:1 + flushInterval:0 → send events immediately.
      // Default batching doesn't work in short-lived serverless functions
      // because the process exits before the batch timer fires.
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _serverClient;
}

/**
 * Check a boolean feature flag server-side.
 * Returns false on any error (PostHog down, missing key, network timeout).
 * Fail-open: callers always get a valid boolean, old code path is the fallback.
 */
export async function getFeatureFlag(
  flag: string,
  userId: string
): Promise<boolean> {
  try {
    const client = getServerClient();
    const enabled = await client.isFeatureEnabled(flag, userId);
    // ?? (nullish coalescing): return the left side unless it's null or undefined,
    // in which case return the right side. isFeatureEnabled() returns boolean|undefined
    // when the flag key doesn't exist in PostHog. We treat that as false (off).
    return enabled ?? false;
  } catch {
    // PostHog unreachable or misconfigured → fall back to old behavior
    return false;
  }
}

/**
 * Get a flag's JSON payload — used for multivariate flags and A/B tests.
 * Multivariate flag: instead of on/off, the flag returns a value like "v2" or "v3",
 * letting you route users to different code paths with a single flag key.
 * A/B test: split users between two variants (e.g. 50% get "control", 50% get "treatment")
 * to measure which performs better before fully committing to one path.
 * Example: flag "search-algorithm" with payload "v2" vs "v3".
 * Returns null on any error.
 */
export async function getFeatureFlagPayload(
  flag: string,
  userId: string
): Promise<unknown> {
  try {
    const client = getServerClient();
    return await client.getFeatureFlagPayload(flag, userId);
  } catch {
    return null;
  }
}
