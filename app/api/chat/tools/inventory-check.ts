/**
 * Local Inventory Check Tool
 *
 * Check if products are in stock at nearby stores.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";

export function createInventoryCheckTool(ctx: ToolContext) {
  return tool({
    description: "Check if a product is in stock at local stores near the user's zip code. Use this when the user needs something urgently or wants to pick up in-store.",
    inputSchema: z.object({
      query: z.string().describe("Product to check inventory for"),
      zipCode: z.string().describe("User's zip code for local store lookup"),
    }),
    execute: async ({ query, zipCode }) => {
      console.log(`[checkLocalInventory] Starting inventory check for: ${query} near ${zipCode}`);

      if (!ctx.firecrawl) {
        console.log(`[checkLocalInventory] Firecrawl not available`);
        return {
          error: "Inventory check not available",
          suggestion: `Check inventory at homedepot.com or lowes.com using zip code ${zipCode}`
        };
      }

      // Home Depot inventory check with location
      const hdUrl = `https://www.homedepot.com/s/${encodeURIComponent(query)}?NCNI-5`;

      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, hdUrl, 20000);

        if (result?.markdown) {
          console.log(`[checkLocalInventory] Success, got ${result.markdown.length} chars`);
          return {
            query,
            zipCode,
            source: "Home Depot",
            inventory: result.markdown.substring(0, 2000),
            tip: "Call the store to confirm availability before visiting.",
          };
        }

        console.log(`[checkLocalInventory] Failed or timed out`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "checkLocalInventory", error: "Timed out or failed", query, zipCode },
        });
        return {
          error: "Inventory check timed out or failed",
          suggestion: `Visit homedepot.com or lowes.com and enter zip code ${zipCode}`,
          shopUrl: hdUrl,
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "checkLocalInventory", query, zipCode, url: hdUrl } });
        return {
          error: "Inventory check timed out or failed",
          suggestion: `Visit homedepot.com or lowes.com and enter zip code ${zipCode}`,
          shopUrl: hdUrl,
        };
      }
    },
  });
}
