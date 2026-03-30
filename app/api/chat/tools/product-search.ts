/**
 * Product Search Tool (Legacy)
 *
 * Quick search for tools, materials, or PPE products.
 * For price comparison across stores, use compareProductPrices instead.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";

export function createProductSearchTool(ctx: ToolContext) {
  return tool({
    description: "Quick search for tools, materials, or PPE products at Home Depot. For price comparison across stores, use compareProductPrices instead.",
    inputSchema: z.object({
      query: z.string().describe("Search query for the product"),
      category: z.enum(["tools", "materials", "ppe", "general"]).describe("Category of product"),
    }),
    execute: async ({ query, category }) => {
      console.log(`[searchProducts] Starting search for: ${query}`);
      const searchUrl = `https://www.homedepot.com/s/${encodeURIComponent(query)}`;

      if (!ctx.firecrawl) {
        console.log(`[searchProducts] Firecrawl not available`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "searchProducts", error: "Firecrawl not available", query },
        });
        return {
          error: "Product search not available",
          suggestion: `Search for "${query}" at Home Depot, Lowe's, or Amazon`
        };
      }

      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, searchUrl, 20000);

        if (result?.markdown) {
          console.log(`[searchProducts] Success, got ${result.markdown.length} chars`);
          return {
            source: "Home Depot",
            searchQuery: query,
            category,
            results: result.markdown.substring(0, 3000),
            shopUrl: searchUrl,
          };
        }

        console.log(`[searchProducts] Failed or timed out`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "searchProducts", error: "Search timed out or failed", query, url: searchUrl },
        });
        return {
          error: "Search timed out or failed",
          suggestion: `Search for "${query}" at homedepot.com`,
          shopUrl: searchUrl,
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "searchProducts", query, url: searchUrl } });
        return {
          error: "Search timed out or failed",
          suggestion: `Search for "${query}" at homedepot.com`,
          shopUrl: searchUrl,
        };
      }
    },
  });
}
