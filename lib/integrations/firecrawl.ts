/**
 * Firecrawl Integration
 *
 * Your budget: 100,000 pages/month
 * Documentation: https://docs.firecrawl.dev
 *
 * Usage: Scrape websites without APIs (Angi, HomeAdvisor, Target, Walmart, local stores)
 * Use as FALLBACK when free APIs (Yelp, Google Maps) don't have enough data
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import * as Sentry from "@sentry/nextjs";
import { CONTRACTOR_SCHEMA } from "./firecrawl-schemas";

export interface ExtractedContractor {
  name: string;
  phone?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
}

// Initialize Firecrawl client
export function getFirecrawlClient() {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not configured");
  }

  return new FirecrawlApp({ apiKey });
}

/**
 * Scrape a single page and extract structured data
 *
 * @param url - URL to scrape
 * @param maxAge - Optional cache TTL in milliseconds. If the cached version is
 *                 younger than maxAge, Firecrawl serves it without re-scraping.
 *                 Default (undefined) uses Firecrawl's built-in 2-day cache.
 *                 Pass 604800000 for 7-day caching on stable pages (cost guides, etc.).
 */
export async function scrapePage(url: string, maxAge?: number) {
  const firecrawl = getFirecrawlClient();

  Sentry.setContext("firecrawl", { feature: "scrapePage", url });

  try {
    const result = await firecrawl.scrape(url, {
      formats: ["markdown", "links", "screenshot",],
      onlyMainContent: true,
      waitFor: 2000, // Wait 2s for dynamic content
      ...(maxAge !== undefined ? { maxAge } : {}),
    });

    return result;
  } catch (error) {
    Sentry.captureException(error, { extra: { tool: "scrapePage", url } });
    throw error;
  }
}

/**
 * Scrape contractor listings from Angi
 */
export async function scrapeAngiContractors(
  category: string,
  zipCode: string
) {
  const url = `https://www.angi.com/search/${encodeURIComponent(category)}-${zipCode}.htm`;

  const result = await scrapePage(url);

  // Return raw markdown for AI to parse
  return {
    url,
    content: result.markdown,
    links: result.links,
  };
}

/**
 * Scrape contractor listings from HomeAdvisor
 */
export async function scrapeHomeAdvisorContractors(
  category: string,
  zipCode: string
) {
  const url = `https://www.homeadvisor.com/c.${encodeURIComponent(category)}.${zipCode}.html`;

  const result = await scrapePage(url);

  return {
    url,
    content: result.markdown,
    links: result.links,
  };
}

/**
 * Search for products at retailers without APIs (Target, Walmart, local stores)
 */
export async function scrapeProductSearch(
  retailer: "target" | "walmart" | "homedepot" | "autozone",
  searchQuery: string,
  zipCode?: string
) {
  const urls: Record<string, string> = {
    target: `https://www.target.com/s?searchTerm=${encodeURIComponent(searchQuery)}`,
    walmart: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}`,
    homedepot: `https://www.homedepot.com/s/${encodeURIComponent(searchQuery)}${zipCode ? `?zip=${zipCode}` : ""}`,
    autozone: `https://www.autozone.com/searchresult?searchText=${encodeURIComponent(searchQuery)}`,
  };

  const url = urls[retailer];
  const result = await scrapePage(url);

  return {
    retailer,
    url,
    content: result.markdown,
    links: result.links,
  };
}

/**
 * Crawl multiple pages (use sparingly - consumes more credits)
 */
export async function crawlWebsite(
  url: string,
  options?: {
    limit?: number;
    maxDepth?: number;
  }
) {
  const firecrawl = getFirecrawlClient();

  Sentry.setContext("firecrawl", { feature: "crawlWebsite", url });

  try {
    const result = await firecrawl.crawl(url, {
      limit: options?.limit || 10,
      // maxDepth: options?.maxDepth || 2,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    });

    return result;
  } catch (error) {
    Sentry.captureException(error, { extra: { tool: "crawlWebsite", url } });
    throw error;
  }
}

/**
 * Batch scrape multiple URLs efficiently
 */
export async function batchScrape(urls: string[]) {
  const firecrawl = getFirecrawlClient();

  Sentry.setContext("firecrawl", { feature: "batchScrape", url: urls.join(",") });

  try {
    const results = await Promise.all(
      urls.map(url =>
        firecrawl.scrape(url, {
          formats: ["markdown"],
          onlyMainContent: true,
        })
      )
    );

    return results;
  } catch (error) {
    Sentry.captureException(error, { extra: { tool: "batchScrape", url: urls.join(","), credits: urls.length } });
    throw error;
  }
}

/**
 * Extract contractor listings from a page using Firecrawl JSON extraction.
 * Replaces extractVendorsFromMarkdown() when 'firecrawl-json-extraction' flag is ON.
 *
 * @param firecrawl - Firecrawl client instance
 * @param url - URL to scrape (e.g., Angi search results page)
 * @returns Array of extracted contractors (empty if extraction fails)
 */
export async function extractContractorsFromPage(
  firecrawl: FirecrawlApp,
  url: string
): Promise<ExtractedContractor[]> {
  const result = await firecrawl.scrape(url, {
    formats: [{ type: "json", schema: CONTRACTOR_SCHEMA }],
  });

  const json = result.json as { contractors?: ExtractedContractor[] } | null | undefined;
  return json?.contractors ?? [];
}

/**
 * Extract vendor data from scraped content using patterns
 * This is a simple parser - you'll want to use AI (OpenAI) for better extraction
 */
export function extractVendorsFromMarkdown(markdown: string) {
  // Basic pattern matching - replace with AI extraction in production
  const vendors: Array<{
    name?: string;
    rating?: string;
    phone?: string;
    address?: string;
  }> = [];

  // This is a simplified example
  // In production, send markdown to OpenAI for structured extraction
  const lines = markdown.split("\n");

  lines.forEach(line => {
    // Look for star ratings
    const ratingMatch = line.match(/(\d+\.?\d*)\s*(?:stars?|★)/i);
    if (ratingMatch) {
      vendors.push({ rating: `${ratingMatch[1]} stars` });
    }

    // Look for phone numbers
    const phoneMatch = line.match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/);
    if (phoneMatch) {
      const lastVendor = vendors[vendors.length - 1];
      if (lastVendor) {
        lastVendor.phone = phoneMatch[1];
      }
    }
  });

  return vendors;
}
