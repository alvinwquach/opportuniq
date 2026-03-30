/**
 * Unified Contractor Search Service
 *
 * Fallback chain: Yelp → Foursquare → Firecrawl
 *
 * Tries each provider in order until one succeeds with results.
 */

import * as Sentry from "@sentry/nextjs";
import { findContractorsForIssue as findContractorsOnYelp } from "./yelp";
import { findContractorsOnFoursquare } from "./foursquare";
import { scrapeAngiContractors, extractVendorsFromMarkdown } from "./firecrawl";

export interface ContractorResult {
  vendorName: string;
  contactInfo: {
    phone?: string;
    website?: string;
    address?: string;
  };
  rating?: string;
  distance?: string;
  specialties?: string[];
  source: "yelp" | "foursquare" | "firecrawl";
}

interface SearchResult {
  contractors: ContractorResult[];
  source: "yelp" | "foursquare" | "firecrawl";
  fallbacksUsed: string[];
}

/**
 * Search for contractors with automatic fallback
 *
 * @param category - Issue category (e.g., "automotive", "home_repair", "appliance")
 * @param zipCode - ZIP code for location-based search
 * @param radius - Search radius in meters (default: 25km)
 * @returns Contractors from the first successful provider
 */
export async function searchContractors(
  category: string,
  zipCode: string,
  radius: number = 25000
): Promise<SearchResult> {
  const fallbacksUsed: string[] = [];

  // 1. Try Yelp first
  if (process.env.YELP_API_KEY) {
    try {
      const yelpResults = await findContractorsOnYelp(category, zipCode, radius);

      if (yelpResults && yelpResults.length > 0) {
        return {
          contractors: yelpResults.map((r) => ({
            ...r,
            source: "yelp" as const,
          })),
          source: "yelp",
          fallbacksUsed,
        };
      }

      fallbacksUsed.push("yelp (no results)");
    } catch (error) {
      console.error("[ContractorSearch] Yelp failed:", error);
      Sentry.captureException(error, { extra: { tool: "searchContractors", url: "yelp", category, zipCode } });
      fallbacksUsed.push("yelp (error)");
    }
  } else {
    fallbacksUsed.push("yelp (not configured)");
  }

  // 2. Fall back to Foursquare
  if (process.env.FOURSQUARE_API_KEY) {
    try {
      const foursquareResults = await findContractorsOnFoursquare(category, zipCode, radius);

      if (foursquareResults && foursquareResults.length > 0) {
        return {
          contractors: foursquareResults.map((r) => ({
            ...r,
            source: "foursquare" as const,
          })),
          source: "foursquare",
          fallbacksUsed,
        };
      }

      fallbacksUsed.push("foursquare (no results)");
    } catch (error) {
      console.error("[ContractorSearch] Foursquare failed:", error);
      Sentry.captureException(error, { extra: { tool: "searchContractors", url: "foursquare", category, zipCode } });
      fallbacksUsed.push("foursquare (error)");
    }
  } else {
    fallbacksUsed.push("foursquare (not configured)");
  }

  // 3. Fall back to Firecrawl (scraping Angi)
  if (process.env.FIRECRAWL_API_KEY) {
    try {
      const scrapedData = await scrapeAngiContractors(category, zipCode);

      if (scrapedData.content) {
        const vendors = extractVendorsFromMarkdown(scrapedData.content);

        if (vendors && vendors.length > 0) {
          return {
            contractors: vendors.map((v) => ({
              vendorName: v.name || "Unknown",
              contactInfo: {
                phone: v.phone,
                address: v.address,
              },
              rating: v.rating,
              source: "firecrawl" as const,
            })),
            source: "firecrawl",
            fallbacksUsed,
          };
        }
      }

      fallbacksUsed.push("firecrawl (no results)");
    } catch (error) {
      console.error("[ContractorSearch] Firecrawl failed:", error);
      Sentry.captureException(error, { extra: { tool: "searchContractors", url: "firecrawl/angi", category, zipCode } });
      fallbacksUsed.push("firecrawl (error)");
    }
  } else {
    fallbacksUsed.push("firecrawl (not configured)");
  }

  // All providers failed
  console.warn("[ContractorSearch] All providers failed:", fallbacksUsed);

  return {
    contractors: [],
    source: "yelp", // Default, though no results
    fallbacksUsed,
  };
}

/**
 * Check which providers are configured
 */
export function getAvailableProviders(): string[] {
  const providers: string[] = [];

  if (process.env.YELP_API_KEY) providers.push("yelp");
  if (process.env.FOURSQUARE_API_KEY) providers.push("foursquare");
  if (process.env.FIRECRAWL_API_KEY) providers.push("firecrawl");

  return providers;
}
