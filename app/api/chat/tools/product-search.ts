/**
 * Product Search Tool
 *
 * Unified tool for two related product intents:
 *   "buy"    — find products at Home Depot (prices, availability, images)
 *   "review" — find reviews/ratings to compare tools or materials
 *
 * Uses Firecrawl search() (behind firecrawl-search-v2) with optional JSON
 * extraction (behind firecrawl-json-extraction) for structured review insights.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";
import { getFeatureFlag } from "@/lib/feature-flags";
import { firecrawlSearch } from "@/lib/integrations/firecrawl-search";

const ENHANCED_DOMAINS = ["homedepot.com", "walmart.com", "amazon.com", "target.com"];
const POPUP_DISMISS_ACTIONS = [
  { type: "wait", milliseconds: 2000 },
  { type: "click", selector: '[data-testid="close-button"], .modal-close, #onetrust-accept-btn-handler' },
  { type: "wait", milliseconds: 500 },
];

export function createProductSearchTool(ctx: ToolContext) {
  return tool({
    description:
      'Search for products in two modes. Use mode "buy" to find tools, materials, or PPE at Home Depot with prices and availability. Use mode "review" to compare specific products by ratings and pros/cons (e.g., "DeWalt DCD777 vs Milwaukee 2801-20", "Moen Arbor faucet reviews").',
    inputSchema: z.object({
      query: z.string().describe("Product name, model, or search query"),
      mode: z
        .enum(["buy", "review"])
        .describe(
          '"buy" to find where to purchase with price/availability, "review" to compare products by ratings and reviews'
        ),
      category: z
        .enum(["tools", "materials", "ppe", "general"])
        .optional()
        .describe("Product category (used in buy mode)"),
    }),
    execute: async ({ query, mode, category }) => {
      if (!ctx.firecrawl) {
        return {
          error: "Product search not available",
          suggestion:
            mode === "buy"
              ? `Search for "${query}" at homedepot.com`
              : `Search for "${query} reviews" on homedepot.com or amazon.com`,
        };
      }

      const userId = ctx.userId ?? "system";

      // ── REVIEW MODE ────────────────────────────────────────────────────────
      if (mode === "review") {
        const useNewSearch = ctx.userId
          ? await getFeatureFlag("firecrawl-search-v2", ctx.userId)
          : false;
        const useJsonExtraction = ctx.userId
          ? await getFeatureFlag("firecrawl-json-extraction", ctx.userId)
          : false;

        if (useNewSearch) {
          const searchResults = await firecrawlSearch(
            ctx.firecrawl,
            `${query} reviews rating pros cons`,
            { limit: 5, location: { country: "US" }, zipCode: ctx.zipCode }
          );

          if (searchResults?.web?.length) {
            const reviews = searchResults.web.map((item) => ({
              source: "title" in item ? (item.title as string | undefined) : undefined,
              url: "url" in item ? (item.url as string) : "",
              excerpt: "description" in item ? (item.description as string | undefined) : undefined,
            }));

            let insights: unknown = null;
            if (useJsonExtraction && reviews[0]?.url) {
              try {
                const extracted = await ctx.firecrawl.scrape(reviews[0].url, {
                  formats: [
                    {
                      type: "json",
                      prompt:
                        "Extract: overall star rating, total review count, top 3 positive themes from customer reviews, top 3 negative themes from customer reviews, and a one-sentence summary of whether experts recommend this product.",
                    },
                  ],
                });
                insights = (extracted as { json?: unknown }).json ?? null;
              } catch {
                // Non-fatal — continue without structured insights
              }
            }

            return {
              product: query,
              reviewSources: reviews,
              insights,
              tip: "Recurring negative themes across multiple reviews are more significant than isolated one-star complaints.",
            };
          }
        }

        // Fallback: scrape Home Depot for the product
        const hdUrl = `https://www.homedepot.com/s/${encodeURIComponent(query)}`;
        try {
          const result = await scrapeWithTimeout(ctx.firecrawl, hdUrl, 20000);
          if (result?.markdown) {
            return {
              product: query,
              reviewSources: [{ source: "Home Depot", url: hdUrl }],
              results: result.markdown.substring(0, 2000),
              tip: "Recurring negative themes across multiple reviews are more significant than isolated one-star complaints.",
            };
          }
          Sentry.captureMessage("Tool returned error", {
            level: "warning",
            extra: { tool: "searchProducts", mode, error: "Timed out or failed", query },
          });
          return {
            error: "Review search timed out",
            suggestion: `Search for "${query} reviews" on homedepot.com or amazon.com`,
            product: query,
          };
        } catch (error) {
          Sentry.captureException(error, { extra: { tool: "searchProducts", mode, query } });
          return {
            error: "Review search failed",
            suggestion: `Search for "${query} reviews" on homedepot.com or amazon.com`,
            product: query,
          };
        }
      }

      // ── BUY MODE ──────────────────────────────────────────────────────────
      const searchUrl = `https://www.homedepot.com/s/${encodeURIComponent(query)}`;
      const isEnhancedDomain = ENHANCED_DOMAINS.some((d) => searchUrl.includes(d));
      const useEnhanced = await getFeatureFlag("firecrawl-enhanced-mode", userId);

      try {
        const result = await Promise.race([
          ctx.firecrawl.scrape(searchUrl, {
            formats: ["markdown", "images"],
            ...(useEnhanced && isEnhancedDomain ? { enhancedMode: true } : {}),
            actions: POPUP_DISMISS_ACTIONS,
          } as Parameters<typeof ctx.firecrawl.scrape>[1]),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 20000)),
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
          extra: { tool: "searchProducts", mode, error: "Search timed out or failed", query },
        });
        return {
          error: "Search timed out or failed",
          suggestion: `Search for "${query}" at homedepot.com`,
          shopUrl: searchUrl,
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "searchProducts", mode, query } });
        return {
          error: "Search timed out or failed",
          suggestion: `Search for "${query}" at homedepot.com`,
          shopUrl: searchUrl,
        };
      }
    },
  });
}
