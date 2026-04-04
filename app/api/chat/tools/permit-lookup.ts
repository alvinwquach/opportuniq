/**
 * Permit Requirements Lookup Tool
 *
 * Look up local building permit requirements by city/county.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";
import { getFeatureFlag } from "@/lib/feature-flags";
import { firecrawlSearch } from "@/lib/integrations/firecrawl-search";

export function createPermitLookupTool(ctx: ToolContext) {
  return tool({
    description: "Look up permit requirements for a specific type of work in the user's city/county. Use this when discussing DIY projects that might require permits.",
    inputSchema: z.object({
      projectType: z.string().describe("Type of project (e.g., 'water heater replacement', 'deck construction', 'electrical panel upgrade')"),
      city: z.string().describe("City name"),
      state: z.string().describe("State abbreviation (e.g., 'CA', 'TX')"),
    }),
    execute: async ({ projectType, city, state }) => {

      const generalGuidance = [
        "Most jurisdictions require permits for: electrical work, plumbing, structural changes, HVAC",
        "Water heater replacements often require permits in most areas",
        "Cosmetic work (painting, flooring) typically doesn't need permits",
        "Unpermitted work can affect home insurance and resale value",
        "Call your local building department for definitive requirements",
      ];

      if (!ctx.firecrawl) {
        return {
          error: "Permit lookup not available",
          suggestion: `Search "${city} ${state} building permits ${projectType}" or call your local building department`,
          generalGuidance,
        };
      }

      // Feature flag: use Firecrawl search() instead of Google scraping
      const useNewSearch = ctx.userId
        ? await getFeatureFlag("firecrawl-search-v2", ctx.userId)
        : false;

      if (useNewSearch) {
        const searchResults = await firecrawlSearch(
          ctx.firecrawl,
          `${city} ${state} building permit ${projectType} requirements`,
          { limit: 5, location: { country: "US" }, zipCode: ctx.zipCode }
        );

        if (searchResults?.web?.length) {
          return {
            projectType,
            location: `${city}, ${state}`,
            searchResults: searchResults.web.map((r) => ({
              title: "title" in r ? r.title : undefined,
              url: "url" in r ? r.url : "",
              description: "description" in r ? r.description : undefined,
            })),
            generalGuidance,
            tip: "Even if you DIY, you may need a licensed contractor to pull the permit.",
          };
        }

      }

      // FALLBACK: existing Google scraping code
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${city} ${state} building permit ${projectType} requirements`)}`;

      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, searchUrl, 20000);

        if (result?.markdown) {
          return {
            projectType,
            location: `${city}, ${state}`,
            searchResults: result.markdown.substring(0, 2000),
            generalGuidance,
            tip: "Even if you DIY, you may need to hire a licensed contractor to pull the permit and have it inspected.",
          };
        }

        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "checkPermitRequirements", error: "Timed out or failed", projectType, city, state },
        });
        return {
          error: "Permit search timed out or failed",
          suggestion: `Call ${city} building department directly or search "${city} ${state} building permits"`,
          generalGuidance,
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "checkPermitRequirements", projectType, city, state } });
        return {
          error: "Permit search timed out or failed",
          suggestion: `Call ${city} building department directly or search "${city} ${state} building permits"`,
        };
      }
    },
  });
}
