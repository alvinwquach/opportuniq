/**
 * Recall Check Tool
 *
 * Check for product and vehicle safety recalls via CPSC and NHTSA.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";

export function createRecallCheckTool(ctx: ToolContext) {
  return tool({
    description: "Check for safety recalls on products or vehicles. Use this for appliances, tools, vehicles, or any product that might have safety issues.",
    inputSchema: z.object({
      itemType: z.enum(["product", "vehicle"]).describe("Type of item to check recalls for"),
      searchTerm: z.string().describe("Product name/brand or vehicle make/model/year"),
    }),
    execute: async ({ itemType, searchTerm }) => {
      console.log(`[checkRecalls] Checking ${itemType} recalls for: ${searchTerm}`);

      const recallUrl = itemType === "vehicle"
        ? `https://www.nhtsa.gov/recalls?nhtsaId=&query=${encodeURIComponent(searchTerm)}`
        : `https://www.cpsc.gov/Recalls?search=${encodeURIComponent(searchTerm)}`;

      if (!ctx.firecrawl) {
        console.log(`[checkRecalls] Firecrawl not available`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "checkRecalls", error: "Firecrawl not available", itemType, searchTerm },
        });
        return {
          error: "Recall check not available",
          suggestion: itemType === "vehicle"
            ? `Check recalls at nhtsa.gov/recalls for "${searchTerm}"`
            : `Check recalls at cpsc.gov/Recalls for "${searchTerm}"`,
          recallUrl,
          tip: itemType === "vehicle"
            ? "Enter your VIN at nhtsa.gov/recalls for vehicle-specific recall information"
            : "Register products at cpsc.gov to receive future recall notifications",
        };
      }

      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, recallUrl, 20000);

        if (result?.markdown) {
          console.log(`[checkRecalls] Success, got ${result.markdown.length} chars`);
          return {
            itemType,
            searchTerm,
            source: itemType === "vehicle" ? "NHTSA" : "CPSC",
            recallUrl,
            results: result.markdown.substring(0, 2000),
            tip: itemType === "vehicle"
              ? "Enter your VIN at nhtsa.gov/recalls for vehicle-specific recall information"
              : "Register products at cpsc.gov to receive future recall notifications",
          };
        }

        console.log(`[checkRecalls] Failed or timed out`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "checkRecalls", error: "Timed out or failed", itemType, searchTerm },
        });
        return {
          error: "Recall check timed out or failed",
          suggestion: `Visit ${itemType === "vehicle" ? "nhtsa.gov" : "cpsc.gov"} directly`,
          recallUrl,
          tip: itemType === "vehicle"
            ? "Enter your VIN at nhtsa.gov/recalls for vehicle-specific recall information"
            : "Register products at cpsc.gov to receive future recall notifications",
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "checkRecalls", itemType, searchTerm, url: recallUrl } });
        return {
          error: "Recall check timed out or failed",
          suggestion: `Visit ${itemType === "vehicle" ? "nhtsa.gov" : "cpsc.gov"} directly`,
          recallUrl,
        };
      }
    },
  });
}
