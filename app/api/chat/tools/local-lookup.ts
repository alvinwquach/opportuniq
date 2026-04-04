/**
 * Local Lookup Tool
 *
 * Location-based lookup for two related intents:
 *   "permits"  — building permit requirements for a project type in a city/state
 *   "rebates"  — utility rebates and federal tax credits for energy upgrades
 *
 * Both use Firecrawl search() (behind firecrawl-search-v2) with a Google fallback.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";
import { getFeatureFlag } from "@/lib/feature-flags";
import { firecrawlSearch } from "@/lib/integrations/firecrawl-search";

export function createLocalLookupTool(ctx: ToolContext) {
  return tool({
    description:
      'Location-based lookup in two modes. Use mode "permits" to find building permit requirements for a project in the user\'s city/state. Use mode "rebates" to find utility rebates and federal tax credits for energy-efficient upgrades like heat pumps, water heaters, or HVAC.',
    inputSchema: z.object({
      mode: z
        .enum(["permits", "rebates"])
        .describe(
          '"permits" for building permit requirements, "rebates" for utility rebates and tax credits'
        ),
      // permits fields
      projectType: z
        .string()
        .optional()
        .describe(
          'Type of project requiring a permit (e.g., "water heater replacement", "deck construction", "electrical panel upgrade")'
        ),
      city: z.string().optional().describe("City name (used in permits mode)"),
      state: z
        .string()
        .optional()
        .describe('State abbreviation, e.g. "CA" (used in permits mode)'),
      // rebates fields
      upgradeType: z
        .string()
        .optional()
        .describe(
          'Type of energy upgrade (e.g., "heat pump water heater", "smart thermostat", "insulation")'
        ),
      zipCode: z
        .string()
        .optional()
        .describe("User's zip code (used in rebates mode)"),
    }),
    execute: async ({ mode, projectType, city, state, upgradeType, zipCode }) => {
      const useNewSearch = ctx.userId
        ? await getFeatureFlag("firecrawl-search-v2", ctx.userId)
        : false;

      // ── PERMITS MODE ──────────────────────────────────────────────────────
      if (mode === "permits") {
        const location = `${city ?? ""} ${state ?? ""}`.trim();
        const query = `${location} building permit ${projectType ?? ""} requirements`;

        const generalGuidance = [
          "Most jurisdictions require permits for: electrical work, plumbing, structural changes, HVAC",
          "Water heater replacements often require permits",
          "Cosmetic work (painting, flooring) typically doesn't need permits",
          "Unpermitted work can affect home insurance and resale value",
          "Call your local building department for definitive requirements",
        ];

        if (!ctx.firecrawl) {
          return {
            error: "Permit lookup not available",
            suggestion: `Search "${query}" or call your local building department`,
            generalGuidance,
          };
        }

        if (useNewSearch) {
          const searchResults = await firecrawlSearch(ctx.firecrawl, query, {
            limit: 5,
            location: { country: "US" },
            zipCode: ctx.zipCode,
          });

          if (searchResults?.web?.length) {
            return {
              projectType,
              location,
              searchResults: searchResults.web.map((r) => ({
                title: "title" in r ? r.title : undefined,
                url: "url" in r ? (r.url as string) : "",
                description: "description" in r ? r.description : undefined,
              })),
              generalGuidance,
              tip: "Even if you DIY, you may need a licensed contractor to pull the permit.",
            };
          }
        }

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        try {
          const result = await scrapeWithTimeout(ctx.firecrawl, searchUrl, 20000);
          if (result?.markdown) {
            return {
              projectType,
              location,
              searchResults: result.markdown.substring(0, 2000),
              generalGuidance,
              tip: "Even if you DIY, you may need a licensed contractor to pull the permit.",
            };
          }
          Sentry.captureMessage("Tool returned error", {
            level: "warning",
            extra: { tool: "lookupLocalInfo", mode, error: "Timed out or failed", projectType, city, state },
          });
          return {
            error: "Permit search timed out or failed",
            suggestion: `Call ${city ?? "your"} building department or search "${query}"`,
            generalGuidance,
          };
        } catch (error) {
          Sentry.captureException(error, { extra: { tool: "lookupLocalInfo", mode, projectType, city, state } });
          return {
            error: "Permit search failed",
            suggestion: `Call ${city ?? "your"} building department directly`,
            generalGuidance,
          };
        }
      }

      // ── REBATES MODE ──────────────────────────────────────────────────────
      const zip = zipCode ?? ctx.zipCode ?? "";
      const query = `${upgradeType ?? ""} rebate ${zip} utility incentive`.trim();

      const baseResources = [
        { name: "DSIRE Database", url: "https://www.dsireusa.org/", description: "Comprehensive database of incentives" },
        { name: "Energy Star Rebate Finder", url: `https://www.energystar.gov/rebate-finder?zipCode=${zip}`, description: "Find rebates by zip code" },
        { name: "IRA Tax Credits", url: "https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit", description: "Federal tax credits for energy improvements" },
      ];

      const commonRebates = [
        "Heat pump water heaters: $300–$1,000+ rebates, plus up to $2,000 federal tax credit",
        "Smart thermostats: $50–$100 rebates typical",
        "HVAC heat pumps: $500–$2,000 rebates, plus up to $2,000 federal tax credit",
        "Insulation: Many utilities offer free or discounted insulation, plus federal tax credits",
        "Electric panel upgrade: Up to $600 federal tax credit if needed for electrification",
      ];

      if (!ctx.firecrawl) {
        return {
          error: "Rebate search not available",
          suggestion: `Search dsireusa.org or energystar.gov/rebate-finder with zip code ${zip}`,
          resources: baseResources,
          commonRebates,
          tip: "Check both your electric and gas utility websites — they often have separate rebate programs.",
        };
      }

      if (useNewSearch) {
        const searchResults = await firecrawlSearch(ctx.firecrawl, query, {
          limit: 5,
          location: { country: "US" },
          zipCode: ctx.zipCode,
        });

        if (searchResults?.web?.length) {
          return {
            upgradeType,
            zipCode: zip,
            searchResults: searchResults.web.map((r) => ({
              title: "title" in r ? r.title : undefined,
              url: "url" in r ? (r.url as string) : "",
              description: "description" in r ? r.description : undefined,
            })),
            resources: baseResources,
            commonRebates,
            tip: "Check both your electric and gas utility websites — they often have separate rebate programs. IRA tax credits can be stacked with utility rebates.",
          };
        }
      }

      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, searchUrl, 20000);
        if (result?.markdown) {
          return {
            upgradeType,
            zipCode: zip,
            searchResults: result.markdown.substring(0, 2000),
            resources: baseResources,
            commonRebates,
            tip: "Check both your electric and gas utility websites — they often have separate rebate programs.",
          };
        }
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "lookupLocalInfo", mode, error: "Timed out or failed", upgradeType, zip },
        });
        return {
          error: "Rebate search timed out or failed",
          suggestion: `Visit energystar.gov/rebate-finder and enter zip code ${zip}`,
          resources: baseResources,
          commonRebates,
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "lookupLocalInfo", mode, upgradeType, zip } });
        return {
          error: "Rebate search failed",
          suggestion: `Visit energystar.gov/rebate-finder and enter zip code ${zip}`,
          resources: baseResources,
          commonRebates,
        };
      }
    },
  });
}
