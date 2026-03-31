/**
 * Tutorial Finder Tool
 *
 * Find YouTube video tutorials and how-to guides for DIY repairs mid-conversation.
 * Uses Firecrawl search() API (behind firecrawl-search-v2 flag) to surface relevant
 * videos without scraping Google. Falls back to YouTube search URL construction.
 *
 * Complements app/actions/guides/ (which aggregates iFixit, Stack Exchange, etc.)
 * by giving the AI a tool it can invoke inline during chat.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";
import { getFeatureFlag } from "@/lib/feature-flags";
import { firecrawlSearch } from "@/lib/integrations/firecrawl-search";

export function createTutorialFinderTool(ctx: ToolContext) {
  return tool({
    description:
      "Find YouTube video tutorials and how-to guides for a specific repair or DIY task. Use this when the user wants step-by-step video guidance (e.g., 'replace faucet cartridge', 'patch drywall', 'change brake pads'). Returns direct video links with descriptions.",
    inputSchema: z.object({
      repairTask: z
        .string()
        .describe(
          "The specific repair or DIY task to find tutorials for (e.g., 'replace toilet flapper', 'fix leaky faucet under sink', 'patch drywall hole', 'change car brake pads')"
        ),
    }),
    execute: async ({ repairTask }) => {
      console.log(`[findTutorial] Searching tutorials for: ${repairTask}`);

      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(repairTask + " DIY how to")}`;

      if (!ctx.firecrawl) {
        console.log(`[findTutorial] Firecrawl not available`);
        return {
          error: "Tutorial search not available",
          suggestion: `Search YouTube for "${repairTask} DIY tutorial"`,
          youtubeUrl: youtubeSearchUrl,
        };
      }

      const useNewSearch = ctx.userId
        ? await getFeatureFlag("firecrawl-search-v2", ctx.userId)
        : false;

      // ── Search path (flag ON) ──────────────────────────────────────────────
      if (useNewSearch) {
        const searchResults = await firecrawlSearch(
          ctx.firecrawl,
          `${repairTask} DIY how to tutorial site:youtube.com`,
          { limit: 5, location: { country: "US" }, zipCode: ctx.zipCode }
        );

        if (searchResults?.web?.length) {
          console.log(
            `[findTutorial] firecrawlSearch success, ${searchResults.web.length} results`
          );

          const tutorials = searchResults.web.map((item) => ({
            title: "title" in item ? (item.title as string | undefined) : undefined,
            url: "url" in item ? (item.url as string) : "",
            description:
              "description" in item ? (item.description as string | undefined) : undefined,
          }));

          return {
            searchQuery: repairTask,
            youtubeUrl: youtubeSearchUrl,
            tutorials,
            tips: [
              "Look for channels like This Old House, Home Repair Tutor, or manufacturer channels for reliable guidance",
              "Check the video date — newer videos reflect current best practices and code",
              "Read pinned comments for common mistakes and viewer corrections",
              "Watch the full video before starting so you know what to expect",
            ],
          };
        }

        console.log(`[findTutorial] firecrawlSearch returned no results, falling back`);
      }

      // ── Fallback: scrape YouTube search results ────────────────────────────
      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, youtubeSearchUrl, 20000);

        if (result?.markdown) {
          console.log(`[findTutorial] Fallback success, got ${result.markdown.length} chars`);
          return {
            searchQuery: repairTask,
            youtubeUrl: youtubeSearchUrl,
            results: result.markdown.substring(0, 2000),
            tips: [
              "Look for channels like This Old House, Home Repair Tutor, or manufacturer channels for reliable guidance",
              "Check the video date — newer videos reflect current best practices and code",
              "Read pinned comments for common mistakes and viewer corrections",
              "Watch the full video before starting so you know what to expect",
            ],
          };
        }

        console.log(`[findTutorial] Fallback failed or timed out`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "findTutorial", error: "Timed out or failed", repairTask },
        });
        return {
          error: "Tutorial search timed out",
          suggestion: `Search YouTube for "${repairTask} DIY tutorial"`,
          youtubeUrl: youtubeSearchUrl,
        };
      } catch (error) {
        Sentry.captureException(error, {
          extra: { tool: "findTutorial", repairTask, url: youtubeSearchUrl },
        });
        return {
          error: "Tutorial search failed",
          suggestion: `Search YouTube for "${repairTask} DIY tutorial"`,
          youtubeUrl: youtubeSearchUrl,
        };
      }
    },
  });
}
