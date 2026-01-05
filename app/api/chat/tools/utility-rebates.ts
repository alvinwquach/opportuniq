/**
 * Utility Rebates Finder Tool
 *
 * Find utility rebates and incentives for energy-efficient upgrades.
 */

import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";

export function createUtilityRebatesTool(ctx: ToolContext) {
  return tool({
    description: "Find utility rebates and incentives for energy-efficient appliances and home improvements. Use this when discussing water heaters, HVAC, insulation, windows, or appliances.",
    inputSchema: z.object({
      upgradeType: z.string().describe("Type of upgrade (e.g., 'heat pump water heater', 'smart thermostat', 'insulation', 'energy star appliances')"),
      zipCode: z.string().describe("User's zip code for local utility lookup"),
    }),
    execute: async ({ upgradeType, zipCode }) => {
      console.log(`[findUtilityRebates] Searching rebates for: ${upgradeType} in ${zipCode}`);

      const dsireUrl = `https://www.dsireusa.org/`;
      const energyStarUrl = `https://www.energystar.gov/rebate-finder?zipCode=${zipCode}`;

      const baseResources = [
        { name: "DSIRE Database", url: dsireUrl, description: "Comprehensive database of incentives" },
        { name: "Energy Star Rebate Finder", url: energyStarUrl, description: "Find rebates by zip code" },
        { name: "IRA Tax Credits", url: "https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit", description: "Federal tax credits for energy improvements" },
      ];

      const commonRebates = [
        "Heat pump water heaters: $300-$1,000+ rebates common, plus up to $2,000 federal tax credit",
        "Smart thermostats: $50-$100 rebates typical",
        "HVAC heat pumps: Often $500-$2,000 in rebates, plus up to $2,000 federal tax credit",
        "Insulation: Many utilities offer free or discounted insulation, plus federal tax credits",
        "Energy Star appliances: Varies by utility and appliance",
        "Electric panel upgrade: Up to $600 federal tax credit if needed for electrification",
      ];

      if (!ctx.firecrawl) {
        console.log(`[findUtilityRebates] Firecrawl not available`);
        return {
          error: "Rebate search not available",
          suggestion: `Search for rebates at dsireusa.org or energystar.gov/rebate-finder using zip code ${zipCode}`,
          resources: baseResources,
          commonRebates,
          tip: "Check both your electric and gas utility websites - they often have separate rebate programs.",
        };
      }

      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${upgradeType} rebate ${zipCode} utility incentive`)}`;
      const result = await scrapeWithTimeout(ctx.firecrawl, searchUrl, 20000);

      if (result?.markdown) {
        console.log(`[findUtilityRebates] Success, got ${result.markdown.length} chars`);
        return {
          upgradeType,
          zipCode,
          searchResults: result.markdown.substring(0, 2000),
          resources: baseResources,
          commonRebates,
          tip: "Check both your electric and gas utility websites - they often have separate rebate programs. Also look into IRA (Inflation Reduction Act) tax credits which can be combined with utility rebates.",
        };
      }

      console.log(`[findUtilityRebates] Failed or timed out`);
      return {
        error: "Rebate search timed out or failed",
        suggestion: `Visit energystar.gov/rebate-finder and enter zip code ${zipCode}`,
        resources: baseResources,
        commonRebates,
        tip: "Check both your electric and gas utility websites - they often have separate rebate programs.",
      };
    },
  });
}
