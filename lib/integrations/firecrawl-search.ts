/**
 * Firecrawl Search Wrapper
 *
 * Wraps firecrawl.search() with:
 *   - Timeout (default 15s) — returns null instead of throwing
 *   - Rate limiter integration (1 credit per call, semaphore-gated)
 *   - Sentry error capture with tool context
 */

import * as Sentry from "@sentry/nextjs";
import FirecrawlApp, { type SearchData } from "@mendable/firecrawl-js";
import { limitedSearch } from "@/lib/firecrawl-limiter";

export interface FirecrawlSearchOptions {
  limit?: number;
  scrapeOptions?: { formats?: string[] };
  /**
   * Location context for the search. Pass { country: 'US' } to bias results.
   * Note: The SDK accepts the country string directly; languages are best-effort.
   */
  location?: { country?: string; languages?: string[] };
  /** If provided, defaults location to US when location is not otherwise set. */
  zipCode?: string;
  /** Milliseconds before the search is aborted and null is returned. Default 15000. */
  timeout?: number;
}

/**
 * Search the web using Firecrawl's search API.
 *
 * Returns SearchData on success, null on timeout or error.
 * Never throws.
 */
export async function firecrawlSearch(
  firecrawl: FirecrawlApp,
  query: string,
  options?: FirecrawlSearchOptions
): Promise<SearchData | null> {
  const timeoutMs = options?.timeout ?? 15000;

  // Resolve location: explicit option wins, zipCode presence implies US
  const locationCountry =
    options?.location?.country ??
    (options?.zipCode ? "US" : undefined);

  try {
    const result = await Promise.race([
      // Cast through unknown: SearchRequest.location is typed as `string`, but the Firecrawl
      // REST API also accepts a LocationConfig object. Using the country string here satisfies
      // both the TypeScript definition and the runtime API.
      limitedSearch(firecrawl, query, {
        limit: options?.limit,
        scrapeOptions: options?.scrapeOptions,
        ...(locationCountry ? { location: locationCountry } : {}),
      } as Parameters<FirecrawlApp["search"]>[1]),
      new Promise<null>((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, timeoutMs);
      }),
    ]);

    return result;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { tool: "firecrawl-search", query },
    });
    return null;
  }
}
