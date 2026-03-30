/**
 * Contractor Verification and Search Tools
 *
 * Uses API chain first (Yelp → Foursquare → Firecrawl),
 * then falls back to Firecrawl scraping for additional sources.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import { searchContractors as searchContractorsAPI, getAvailableProviders } from "@/lib/integrations/contractor-search";
import type { ToolContext } from "./types";

// State licensing board URLs
const licensingBoards: Record<string, string> = {
  CA: "https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx",
  TX: "https://www.tdlr.texas.gov/LicenseSearch/",
  FL: "https://www.myfloridalicense.com/wl11.asp",
  NY: "https://www.dos.ny.gov/licensing/",
  AZ: "https://roc.az.gov/contractor-search",
  WA: "https://secure.lni.wa.gov/verify/",
  OR: "https://www.ccb.state.or.us/search/",
  CO: "https://apps.colorado.gov/dora/licensing/Lookup/LicenseLookup.aspx",
  NV: "https://app.nvcontractorsboard.com/ContractorSearch/",
  PA: "https://www.pals.pa.gov/",
};

export function createContractorVerificationTool(ctx: ToolContext) {
  return tool({
    description: "Verify a contractor's license status and check their reviews. Use this when the user is considering hiring a specific contractor or wants to verify credentials.",
    inputSchema: z.object({
      contractorName: z.string().describe("Name of the contractor or company"),
      state: z.string().describe("State where the contractor operates (e.g., 'CA', 'TX', 'FL')"),
      contractorType: z.string().describe("Type of contractor (e.g., 'plumber', 'electrician', 'general contractor')"),
      zipCode: z.string().optional().describe("Zip code for location-based search"),
    }),
    execute: async ({ contractorName, state, contractorType, zipCode }) => {
      const results: { source: string; data: unknown; url?: string; rating?: string }[] = [];
      const availableProviders = getAvailableProviders();

      // Try API-based search first if zip code is provided
      if (zipCode && availableProviders.length > 0) {
        try {
          console.log("[verifyContractor] Using API chain for contractor search...");
          const apiResults = await searchContractorsAPI(contractorType, zipCode);

          if (apiResults.contractors.length > 0) {
            // Filter results that match the contractor name (if provided)
            const matchingContractors = apiResults.contractors.filter((c) =>
              c.vendorName.toLowerCase().includes(contractorName.toLowerCase()) ||
              contractorName.toLowerCase().includes(c.vendorName.toLowerCase())
            );

            if (matchingContractors.length > 0) {
              results.push({
                source: apiResults.source,
                data: matchingContractors,
                rating: matchingContractors[0]?.rating,
              });
            } else {
              // If no exact match, still include API results as alternative contractors
              results.push({
                source: apiResults.source,
                data: {
                  note: `No exact match for "${contractorName}", but found similar contractors`,
                  contractors: apiResults.contractors.slice(0, 5),
                },
              });
            }

            console.log(`[verifyContractor] Found ${apiResults.contractors.length} contractors via ${apiResults.source}`);
            if (apiResults.fallbacksUsed.length > 0) {
              console.log(`[verifyContractor] Fallbacks used: ${apiResults.fallbacksUsed.join(", ")}`);
            }
          }
        } catch (error) {
          console.error("[verifyContractor] API search failed:", error);
          Sentry.captureException(error, { extra: { tool: "verifyContractor", contractorName, zipCode } });
        }
      }

      // Fall back to Firecrawl scraping for additional verification sources
      if (ctx.firecrawl && results.length === 0) {
        console.log("[verifyContractor] Falling back to Firecrawl scraping...");

        const verificationSources = [
          {
            name: "BBB",
            url: `https://www.bbb.org/search?find_country=USA&find_text=${encodeURIComponent(contractorName)}&find_type=Category`,
          },
          {
            name: "Yelp",
            url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(contractorName + " " + contractorType)}&find_loc=${state}`,
          },
          {
            name: "Angi",
            url: `https://www.angi.com/companylist/${state.toLowerCase()}/${encodeURIComponent(contractorType.replace(/\s+/g, "-"))}.htm?query=${encodeURIComponent(contractorName)}`,
          },
          {
            name: "HomeAdvisor",
            url: `https://www.homeadvisor.com/rated.${encodeURIComponent(contractorType.replace(/\s+/g, "-"))}.${state}.html?query=${encodeURIComponent(contractorName)}`,
          },
          {
            name: "Thumbtack",
            url: `https://www.thumbtack.com/search/${encodeURIComponent(contractorType)}/${state.toLowerCase()}/?query=${encodeURIComponent(contractorName)}`,
          },
          {
            name: "Google Reviews",
            url: `https://www.google.com/search?q=${encodeURIComponent(contractorName + " " + contractorType + " " + state + " reviews")}`,
          },
        ];

        const scrapeResults = await Promise.allSettled(
          verificationSources.map(async (source) => {
            try {
              const result = await ctx.firecrawl!.scrape(source.url, {
                formats: ["markdown"],
                actions: [{ type: "wait", milliseconds: 2000 }],
              });
              return {
                source: source.name,
                data: result.markdown?.substring(0, 1200) || null,
                url: source.url,
              };
            } catch {
              return { source: source.name, data: null, url: source.url };
            }
          })
        );

        scrapeResults.forEach((result) => {
          if (result.status === "fulfilled") {
            results.push(result.value);
          }
        });
      }

      // If nothing worked, provide guidance
      if (results.length === 0) {
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "verifyContractor", error: "Verification not available", contractorName, zipCode },
        });
        return {
          error: "Verification not available",
          availableProviders,
          suggestion: `Search for "${contractorName}" on your state's contractor licensing board and check BBB.org, Yelp, Angi, HomeAdvisor, or Thumbtack`,
        };
      }

      return {
        contractor: contractorName,
        state,
        type: contractorType,
        verificationResults: results,
        licensingBoardUrl: licensingBoards[state.toUpperCase()] || `Search "${state} contractor license lookup"`,
        tips: [
          "Always verify the license number directly on the state board website",
          "Check if insurance is current and covers your project",
          "Look for consistent ratings across multiple platforms",
          "Read recent reviews (within last 6 months) for current service quality",
          "Ask for references from recent similar projects",
          "Get everything in writing before work begins",
          "Check if they're bonded in addition to licensed and insured",
        ],
        redFlags: [
          "No online presence or reviews",
          "Significantly lower price than competitors",
          "Pressure to pay large deposit upfront",
          "No physical business address",
          "Unwilling to provide license number",
          "Only accepts cash payments",
        ],
      };
    },
  });
}

export function createContractorSearchTool(_ctx: ToolContext) {
  return tool({
    description: "Search for contractors in a specific area. Uses Yelp, Foursquare APIs with Firecrawl as fallback. For verifying a specific contractor, use verifyContractor instead.",
    inputSchema: z.object({
      serviceType: z.string().describe("Type of service needed (e.g., 'plumber', 'electrician', 'roofer', 'HVAC')"),
      zipCode: z.string().describe("Zip code for location-based search"),
      radius: z.number().optional().describe("Search radius in meters (default: 25000 = 15 miles)"),
    }),
    execute: async ({ serviceType, zipCode, radius }) => {
      console.log(`[searchContractors] Execute started for ${serviceType} near ${zipCode}`);
      const availableProviders = getAvailableProviders();

      // Try API-based search first
      if (availableProviders.length > 0) {
        try {
          console.log(`[searchContractors] Searching for ${serviceType} near ${zipCode}...`);
          const searchResults = await searchContractorsAPI(serviceType, zipCode, radius || 25000);

          if (searchResults.contractors.length > 0) {
            console.log(`[searchContractors] Found ${searchResults.contractors.length} contractors via ${searchResults.source}`);

            const result = {
              serviceType,
              zipCode,
              source: searchResults.source,
              fallbacksUsed: searchResults.fallbacksUsed,
              contractors: searchResults.contractors.slice(0, 10), // Return top 10
              tips: [
                "Get at least 3 quotes before deciding",
                "Verify license and insurance on your state's contractor board",
                "Ask for references from recent similar jobs",
                "Get written estimates with detailed scope of work",
                "Check reviews on multiple platforms (Google, Yelp, BBB)",
                "Be wary of quotes significantly lower than others",
              ],
            };

            // Debug: log the result to check for serialization issues
            console.log(`[searchContractors] Result size: ${JSON.stringify(result).length} bytes`);
            console.log(`[searchContractors] Returning results...`);

            return result;
          }
        } catch (error) {
          console.error("[searchContractors] API search failed:", error);
          Sentry.captureException(error, { extra: { tool: "searchContractors", serviceType, zipCode } });
        }
      }

      // Fallback guidance if no APIs are configured or search failed
      return {
        serviceType,
        zipCode,
        availableProviders,
        recommendation: `Find a ${serviceType} near ${zipCode}`,
        tips: [
          "Get at least 3 quotes before deciding",
          "Check reviews on Google, Yelp, and NextDoor",
          "Verify license and insurance",
          "Ask for references from recent jobs",
          "Get written estimates with scope of work",
        ],
        searchSuggestions: [
          `Search "${serviceType} near ${zipCode}" on Google Maps`,
          `Check Yelp for "${serviceType}" reviews in your area`,
          `Ask on NextDoor for local recommendations`,
          `Visit HomeAdvisor.com and Angi.com for quotes`,
          `Check Thumbtack.com for local pros`,
        ],
      };
    },
  });
}
