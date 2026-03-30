/**
 * Firecrawl Concurrency Limiter & Credit Tracker
 *
 * Wraps every Firecrawl scrape call with:
 *   1. A semaphore limiting concurrent calls to MAX_CONCURRENT (3)
 *   2. Credit tracking — estimated credits consumed per call
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

const MAX_CONCURRENT = 3;

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

// ─── Credit tracker ───────────────────────────────────────────────────────────

let totalCreditsUsed = 0;
const creditLog: Array<{ tool: string; url: string; credits: number; ts: number }> = [];

function trackCredits(tool: string, url: string, credits: number): void {
  totalCreditsUsed += credits;
  creditLog.push({ tool, url, credits, ts: Date.now() });
}

export function getCreditUsage(): {
  total: number;
  log: typeof creditLog;
} {
  return { total: totalCreditsUsed, log: [...creditLog] };
}

/** Exposed for tests */
export function _resetCreditTracking(): void {
  totalCreditsUsed = 0;
  creditLog.length = 0;
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
    trackCredits("scrape", url, 1);

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `scrape done: ${url}`,
      level: "info",
      data: { url, credits: 1, totalCreditsUsed },
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
    trackCredits("crawl", url, limit);

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `crawl done: ${url}`,
      level: "info",
      data: { url, credits: limit, totalCreditsUsed },
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
    trackCredits("search", query, 1);

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `search done: ${query}`,
      level: "info",
      data: { query, credits: 1, totalCreditsUsed },
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
    trackCredits("batch", urls.join(","), credits);

    Sentry.addBreadcrumb({
      category: "firecrawl",
      message: `batch done: ${urls.length} URLs`,
      level: "info",
      data: { urlCount: urls.length, credits, totalCreditsUsed },
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
