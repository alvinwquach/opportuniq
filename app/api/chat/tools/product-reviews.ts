/**
 * Product Reviews Tool
 *
 * Search for aggregated product reviews to help users compare tools and materials.
 * Uses Firecrawl search() API (behind firecrawl-search-v2 flag) with JSON extraction
 * (behind firecrawl-json-extraction flag) to pull structured review summaries.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";
import { getFeatureFlag } from "@/lib/feature-flags";
import { firecrawlSearch } from "@/lib/integrations/firecrawl-search";

export function createProductReviewsTool(ctx: ToolContext) {
  return tool({
    description:
      "Search for product reviews and ratings to help the user choose between tools or materials. Use this when comparing specific products (e.g., 'DeWalt DCD777 vs Milwaukee 2801-20', 'Moen Arbor faucet reviews'). Returns star ratings, review counts, and common pros/cons.",
    inputSchema: z.object({
      productName: z
        .string()
        .describe(
          "Specific product name or model to find reviews for (e.g., 'Milwaukee M18 FUEL drill', 'DeWalt DCD777 drill', 'Moen Arbor faucet')"
        ),
    }),
    execute: async ({ productName }) => {

      if (!ctx.firecrawl) {
        return {
          error: "Review search not available",
          suggestion: `Search for "${productName} reviews" on Google, Home Depot, or Amazon`,
          product: productName,
        };
      }

      const useNewSearch = ctx.userId
        ? await getFeatureFlag("firecrawl-search-v2", ctx.userId)
        : false;
      const useJsonExtraction = ctx.userId
        ? await getFeatureFlag("firecrawl-json-extraction", ctx.userId)
        : false;

      // ── Search path (flag ON) ──────────────────────────────────────────────
      if (useNewSearch) {
        const searchResults = await firecrawlSearch(
          ctx.firecrawl,
          `${productName} reviews rating pros cons`,
          { limit: 5, location: { country: "US" }, zipCode: ctx.zipCode }
        );

        if (searchResults?.web?.length) {

          const reviews = searchResults.web.map((item) => ({
            source: "title" in item ? (item.title as string | undefined) : undefined,
            url: "url" in item ? (item.url as string) : "",
            excerpt: "description" in item ? (item.description as string | undefined) : undefined,
          }));

          // Behind firecrawl-json-extraction: extract structured themes from top result
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
            product: productName,
            reviewSources: reviews,
            insights,
            tip: "Recurring negative themes across multiple reviews are more significant than isolated one-star complaints.",
          };
        }

      }

      // ── Fallback: scrape Home Depot search results ─────────────────────────
      const hdUrl = `https://www.homedepot.com/s/${encodeURIComponent(productName)}`;

      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, hdUrl, 20000);

        if (result?.markdown) {
          return {
            product: productName,
            reviewSources: [{ source: "Home Depot", url: hdUrl }],
            results: result.markdown.substring(0, 2000),
            tip: "Recurring negative themes across multiple reviews are more significant than isolated one-star complaints.",
          };
        }

        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "searchProductReviews", error: "Timed out or failed", productName },
        });
        return {
          error: "Review search timed out",
          suggestion: `Search for "${productName} reviews" on homedepot.com or amazon.com`,
          product: productName,
        };
      } catch (error) {
        Sentry.captureException(error, {
          extra: { tool: "searchProductReviews", productName, url: hdUrl },
        });
        return {
          error: "Review search failed",
          suggestion: `Search for "${productName} reviews" on homedepot.com or amazon.com`,
          product: productName,
        };
      }
    },
  });
}
