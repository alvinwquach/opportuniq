/**
 * Product Reviews Tool
 *
 * Aggregate product reviews from multiple sources.
 */

import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";

export function createProductReviewsTool(ctx: ToolContext) {
  return tool({
    description: "Get aggregated product reviews from multiple sources to help the user choose the right tool or material.",
    inputSchema: z.object({
      productName: z.string().describe("Specific product name or model (e.g., 'Milwaukee M18 FUEL drill', 'Moen Arbor faucet')"),
    }),
    execute: async ({ productName }) => {
      if (!ctx.firecrawl) {
        return {
          error: "Reviews not available",
          suggestion: `Search for "${productName} reviews" on Google`
        };
      }

      const sources = [
        { name: "Home Depot Reviews", url: `https://www.homedepot.com/s/${encodeURIComponent(productName)}` },
        { name: "Amazon Reviews", url: `https://www.amazon.com/s?k=${encodeURIComponent(productName)}` },
      ];

      const reviews = await Promise.allSettled(
        sources.map(async (source) => {
          try {
            const result = await ctx.firecrawl!.scrape(source.url, {
              formats: ["markdown"],
              actions: [
                { type: "wait", milliseconds: 2000 },
                { type: "scroll", direction: "down", amount: 500 },
              ],
            });
            return {
              source: source.name,
              url: source.url,
              content: result.markdown?.substring(0, 1500) || "No reviews found",
            };
          } catch {
            return { source: source.name, error: "Failed to fetch reviews" };
          }
        })
      );

      return {
        product: productName,
        reviews: reviews.map((r) => (r.status === "fulfilled" ? r.value : { source: "Unknown", error: "Failed" })),
        tip: "Look for patterns in negative reviews - recurring issues are more significant than one-off complaints.",
      };
    },
  });
}
