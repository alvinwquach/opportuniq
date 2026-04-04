/**
 * Cost Guide Change Monitor
 *
 * Uses Firecrawl's changeTracking feature to detect price updates on cost guide pages.
 * When changes are detected, invalidates the local cache so fresh data is fetched
 * on the next getCostEstimate() call.
 *
 * Intended use: weekly cron job (e.g., /api/cron/cost-monitor).
 *
 * Cost: 1 Firecrawl credit per URL checked.
 */

import * as Sentry from "@sentry/nextjs";
import { getFirecrawlClient } from "./firecrawl";
import { db } from "@/app/db/client";
import { costData } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";

export interface CostGuideChange {
  url: string;
  type: "added" | "removed" | "modified";
  content?: string;
  before?: string;
  after?: string;
}

export interface CostGuideChangeResult {
  url: string;
  hasChanges: boolean;
  changes: CostGuideChange[];
  previousScrapeAt?: string;
  error?: string;
}

/**
 * Check a list of cost guide URLs for content changes since the last scrape.
 * Invalidates the cost data cache for any URL where changes are detected.
 *
 * @param urls - Cost guide URLs to monitor (HomeAdvisor or Angi)
 * @returns Per-URL change summary
 */
export async function checkCostGuideChanges(
  urls: string[]
): Promise<CostGuideChangeResult[]> {
  const firecrawl = getFirecrawlClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fc = firecrawl as any;
  const results: CostGuideChangeResult[] = [];

  for (const url of urls) {
    try {
      const result = await fc.scrape(url, {
        formats: ["markdown"],
        changeTracking: { mode: "git-diff" },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ct = (result as any)?.changeTracking as {
        previousScrapeAt?: string;
        changes?: CostGuideChange[];
      } | undefined;

      const changes = ct?.changes ?? [];
      const hasChanges = changes.length > 0;

      if (hasChanges) {
        Sentry.captureMessage(`Cost guide changed: ${url}`, {
          level: "info",
          extra: {
            url,
            changeCount: changes.length,
            previousScrapeAt: ct?.previousScrapeAt,
            changes: changes.slice(0, 3), // log first 3 for brevity
          },
        });

        // Invalidate cache: expire this URL's cost data immediately
        await invalidateCacheForUrl(url);
      }

      results.push({
        url,
        hasChanges,
        changes,
        previousScrapeAt: ct?.previousScrapeAt,
      });
    } catch (error) {
      Sentry.captureException(error, {
        extra: { tool: "checkCostGuideChanges", url },
      });
      results.push({ url, hasChanges: false, changes: [], error: String(error) });
    }
  }

  const changedCount = results.filter((r) => r.hasChanges).length;

  return results;
}

/**
 * Invalidate cached cost data for a given source URL by setting expiresAt to now.
 * The next getCostEstimate() call will see expired data and re-scrape.
 */
async function invalidateCacheForUrl(url: string): Promise<void> {
  await db
    .update(costData)
    .set({ expiresAt: new Date() })
    .where(eq(costData.sourceUrl, url));
}
