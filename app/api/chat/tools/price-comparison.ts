/**
 * Price Comparison Tool
 *
 * Compare prices across multiple stores for building, fixing, and diagnosing.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";

export function createPriceComparisonTool(ctx: ToolContext) {
  return tool({
    description: "Compare prices for a product across multiple stores (Home Depot, Lowe's, Amazon, Ace Hardware, auto parts stores, and more). Use this when the user wants to find the best deal.",
    inputSchema: z.object({
      query: z.string().describe("Product to search for (e.g., 'DeWalt 20V drill', 'copper pipe 1/2 inch')"),
    }),
    execute: async ({ query }) => {
      if (!ctx.firecrawl) {
        return {
          error: "Price comparison not available",
          suggestion: `Compare prices manually at homedepot.com, lowes.com, amazon.com`
        };
      }

      // Top 3 stores — covers the most common home repair and auto sources
      // without burning Firecrawl credits on 11 concurrent requests
      const stores = [
        { name: "Home Depot", url: `https://www.homedepot.com/s/${encodeURIComponent(query)}` },
        { name: "Amazon", url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}` },
        { name: "Lowe's", url: `https://www.lowes.com/search?searchTerm=${encodeURIComponent(query)}` },
      ];

      const results = await Promise.allSettled(
        stores.map(async (store) => {
          try {
            const result = await ctx.firecrawl!.scrape(store.url, {
              formats: ["markdown"],
              actions: [
                { type: "wait", milliseconds: 2000 },
                { type: "scroll", direction: "down", amount: 300 },
              ],
            });
            return {
              store: store.name,
              url: store.url,
              results: result.markdown?.substring(0, 1500) || "No results found",
            };
          } catch (err) {
            Sentry.captureException(err, { extra: { tool: "compareProductPrices", query, url: store.url } });
            return { store: store.name, url: store.url, error: "Failed to fetch" };
          }
        })
      );

      return {
        query,
        comparison: results.map((r) => (r.status === "fulfilled" ? r.value : { store: "Unknown", url: "", error: "Failed" })),
        tip: "Prices may vary by location. Check for in-store pickup availability.",
      };
    },
  });
}
