/**
 * Product Search Tool (Legacy)
 *
 * Quick search for tools, materials, or PPE products at Home Depot.
 * Includes image URLs (for thumbnails) and popup dismissal actions.
 * Supports enhancedMode (behind firecrawl-enhanced-mode flag) for anti-bot sites.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { getFeatureFlag } from "@/lib/feature-flags";

const ENHANCED_DOMAINS = ["homedepot.com", "walmart.com", "amazon.com", "target.com"];
const POPUP_DISMISS_ACTIONS = [
  { type: "wait", milliseconds: 2000 },
  {
    type: "click",
    selector:
      '[data-testid="close-button"], .modal-close, #onetrust-accept-btn-handler',
  },
  { type: "wait", milliseconds: 500 },
];

export function createProductSearchTool(ctx: ToolContext) {
  return tool({
    description:
      "Search Home Depot for tools, materials, or PPE products. Returns product names, prices, ratings, and availability.",
    inputSchema: z.object({
      query: z.string().describe("Search query for the product"),
      category: z
        .enum(["tools", "materials", "ppe", "general"])
        .describe("Category of product"),
    }),
    execute: async ({ query, category }) => {
      const searchUrl = `https://www.homedepot.com/s/${encodeURIComponent(query)}`;

      if (!ctx.firecrawl) {
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: {
            tool: "searchProducts",
            error: "Firecrawl not available",
            query,
          },
        });
        return {
          error: "Product search not available",
          suggestion: `Search for "${query}" at Home Depot, Lowe's, or Amazon`,
        };
      }

      const userId = ctx.userId ?? "system";
      const isEnhancedDomain = ENHANCED_DOMAINS.some((d) =>
        searchUrl.includes(d)
      );
      const useEnhanced = await getFeatureFlag("firecrawl-enhanced-mode", userId);

      try {
        const result = await Promise.race([
          ctx.firecrawl.scrape(searchUrl, {
            formats: ["markdown", "images"],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(useEnhanced && isEnhancedDomain ? { enhancedMode: true } : {}),
            actions: POPUP_DISMISS_ACTIONS,
          } as Parameters<typeof ctx.firecrawl.scrape>[1]),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 20000)
          ),
        ]);

        if (result?.markdown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const images = (result as any).images as string[] | undefined;
          return {
            source: "Home Depot",
            searchQuery: query,
            category,
            results: result.markdown.substring(0, 3000),
            images: images?.slice(0, 10) ?? [],
            shopUrl: searchUrl,
          };
        }

        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: {
            tool: "searchProducts",
            error: "Search timed out or failed",
            query,
            url: searchUrl,
          },
        });
        return {
          error: "Search timed out or failed",
          suggestion: `Search for "${query}" at homedepot.com`,
          shopUrl: searchUrl,
        };
      } catch (error) {
        Sentry.captureException(error, {
          extra: { tool: "searchProducts", query, url: searchUrl },
        });
        return {
          error: "Search timed out or failed",
          suggestion: `Search for "${query}" at homedepot.com`,
          shopUrl: searchUrl,
        };
      }
    },
  });
}
