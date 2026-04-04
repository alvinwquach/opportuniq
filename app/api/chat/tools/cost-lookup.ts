/**
 * Cost Lookup Tool
 *
 * Provides real cost estimates from cached HomeAdvisor/Angi data.
 * Falls back to AI estimates when no data is available.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { getCostEstimate, type CostEstimate } from "@/lib/integrations/cost-scraper";

/**
 * Create the cost lookup tool
 */
export function createCostLookupTool(ctx: ToolContext) {
  return tool({
    description:
      "Get real cost estimates (DIY and professional) for a specific repair type and location. " +
      "Returns actual pricing data from HomeAdvisor/Angi when available. " +
      "Use this BEFORE providing cost estimates to users.",
    inputSchema: z.object({
      serviceType: z
        .string()
        .describe(
          "Type of service/repair (e.g., 'ceiling_repair', 'drywall_repair', 'plumbing_leak', 'hvac_repair', 'roof_repair', 'mold_removal')"
        ),
      zipCode: z
        .string()
        .describe("User's zip code for regional pricing"),
    }),
    execute: async ({ serviceType, zipCode }) => {

      try {
        const costData = await getCostEstimate(serviceType, zipCode);

        if (costData) {

          return {
            success: true,
            data: costData,
            message: `Found real cost data for ${serviceType} from ${costData.source}`,
          };
        }

        // No data found - return helpful message
        return {
          success: false,
          data: null,
          message: `No cached cost data for "${serviceType}". Use general industry estimates.`,
          suggestions: getSuggestedServiceTypes(serviceType),
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "getCostEstimate", serviceType, zipCode } });
        return {
          success: false,
          data: null,
          message: "Failed to lookup cost data. Use general industry estimates.",
          error: String(error),
        };
      }
    },
  });
}

/**
 * Suggest similar service types that might have data
 */
function getSuggestedServiceTypes(input: string): string[] {
  const allTypes = [
    "ceiling_repair",
    "drywall_repair",
    "popcorn_ceiling",
    "plumbing_leak",
    "faucet_repair",
    "toilet_repair",
    "water_heater",
    "hvac_repair",
    "furnace_repair",
    "electrical_repair",
    "outlet_repair",
    "roof_repair",
    "roof_leak",
    "foundation_repair",
    "foundation_crack",
    "mold_removal",
    "interior_painting",
    "flooring_repair",
    "appliance_repair",
    "refrigerator_repair",
    "dishwasher_repair",
  ];

  const inputLower = input.toLowerCase();
  return allTypes
    .filter(
      (type) =>
        type.includes(inputLower) ||
        inputLower.includes(type.split("_")[0])
    )
    .slice(0, 5);
}
