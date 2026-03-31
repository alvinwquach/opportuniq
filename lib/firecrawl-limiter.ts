/**
 * Firecrawl Concurrency Limiter & Credit Tracker
 *
 * Wraps every Firecrawl scrape call with:
 *   1. A semaphore limiting concurrent calls to MAX_CONCURRENT (3)
 *   2. Credit tracking — estimated credits consumed per call (Redis-backed)
 *   3. A Sentry breadcrumb for each call (start + finish/error)
 *
 * Credit estimates (conservative):
 *   scrape  → 1 credit
 *   crawl   → limit credits (one per page)
 *   batch   → 1 credit per URL
 *
 * Usage:
 *   import { limitedScrape, limitedCrawl, limitedBatch, getCreditUsage } from "@/lib/firecrawl-limiter";
 */

import * as Sentry from "@sentry/nextjs";
import FirecrawlApp from "@mendable/firecrawl-js";
import { redis } from "./rate-limiter";

const MAX_CONCURRENT = 3;
const DAILY_CREDIT_LIMIT = 500;

// ─── Semaphore ────────────────────────────────────────────────────────────────

let activeCount = 0;
const waitQueue: Array<() => void> = [];

function acquire(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    waitQueue.push(resolve);
  });
}

function release(): void {
  const next = waitQueue.shift();
  if (next) {
    next();
  } else {
    activeCount--;
  }
}

// ─── Credit tracker (Redis-backed) ───────────────────────────────────────────

export async function trackFirecrawlCredits(
  userId: string,
  creditsUsed: number
): Promise<{ used: number; remaining: number; exceeded: boolean }> {
  const key = `opportuniq:credits:${userId}`;
  const newTotal = await redis.incrby(key, creditsUsed);

  // Set 24h TTL on first write (TTL=-1 means no expiry set yet)
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    await redis.expire(key, 86400); // 24 hours
  }

  return {
    used: newTotal,
    remaining: Math.max(0, DAILY_CREDIT_LIMIT - newTotal),
    exceeded: newTotal > DAILY_CREDIT_LIMIT,
  };
}

export async function getFirecrawlCreditsUsed(userId: string): Promise<number> {
  return (await redis.get<number>(`opportuniq:credits:${userId}`)) ?? 0;
}

/** Exposed for tests */
export function _getActiveCount(): number {
  return activeCount;
}

// ─── Wrapped calls ────────────────────────────────────────────────────────────

export async function limitedScrape(
  firecrawl: FirecrawlApp,
  url: string,
  options?: Parameters<FirecrawlApp["scrape"]>[1]
): Promise<Awaited<ReturnType<FirecrawlApp["scrape"]>>> {
  await acquire();

  Sentry.addBreadcrumb({
    category: "firecrawl",
    message: `scrape start: ${url}`,
    level: "info",
    data: { url, credits: 1, concurrentActive: activeCount },
  });

  try {
    const result = await firecrawl.scrape(url, options ?? { formats: ["markdown"] });

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `scrape done: ${url}`,
      level: "info",
      data: { url, credits: 1 },
    });

    return result;
  } catch (error) {
    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `scrape error: ${url}`,
      level: "error",
      data: { url, error: String(error) },
    });
    throw error;
  } finally {
    release();
  }
}

export async function limitedCrawl(
  firecrawl: FirecrawlApp,
  url: string,
  options?: Parameters<FirecrawlApp["crawl"]>[1]
): Promise<Awaited<ReturnType<FirecrawlApp["crawl"]>>> {
  const limit = (options as { limit?: number } | undefined)?.limit ?? 10;

  await acquire();

  Sentry.addBreadcrumb({
    category: "firecrawl",
    message: `crawl start: ${url}`,
    level: "info",
    data: { url, estimatedCredits: limit, concurrentActive: activeCount },
  });

  try {
    const result = await firecrawl.crawl(url, options);

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `crawl done: ${url}`,
      level: "info",
      data: { url, credits: limit },
    });

    return result;
  } catch (error) {
    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `crawl error: ${url}`,
      level: "error",
      data: { url, error: String(error) },
    });
    throw error;
  } finally {
    release();
  }
}

export async function limitedSearch(
  firecrawl: FirecrawlApp,
  query: string,
  options?: Parameters<FirecrawlApp["search"]>[1]
): Promise<Awaited<ReturnType<FirecrawlApp["search"]>>> {
  await acquire();

  Sentry.addBreadcrumb({
    category: "firecrawl",
    message: `search start: ${query}`,
    level: "info",
    data: { query, credits: 1, concurrentActive: activeCount },
  });

  try {
    const result = await firecrawl.search(query, options);

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `search done: ${query}`,
      level: "info",
      data: { query, credits: 1 },
    });

    return result;
  } catch (error) {
    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `search error: ${query}`,
      level: "error",
      data: { query, error: String(error) },
    });
    throw error;
  } finally {
    release();
  }
}

export async function limitedBatch(
  firecrawl: FirecrawlApp,
  urls: string[],
  options?: Parameters<FirecrawlApp["scrape"]>[1]
): Promise<Awaited<ReturnType<FirecrawlApp["scrape"]>>[]> {
  const credits = urls.length;

  await acquire();

  Sentry.addBreadcrumb({
    category: "firecrawl",
    message: `batch start: ${urls.length} URLs`,
    level: "info",
    data: { urlCount: urls.length, estimatedCredits: credits, concurrentActive: activeCount },
  });

  try {
    const results = await Promise.all(
      urls.map((url) => firecrawl.scrape(url, options ?? { formats: ["markdown"] }))
    );

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `batch done: ${urls.length} URLs`,
      level: "info",
      data: { urlCount: urls.length, credits },
    });

    return results;
  } catch (error) {
    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `batch error: ${urls.length} URLs`,
      level: "error",
      data: { urlCount: urls.length, error: String(error) },
    });
    throw error;
  } finally {
    release();
  }
}
