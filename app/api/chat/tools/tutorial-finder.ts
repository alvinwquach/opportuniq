/**
 * YouTube Tutorial Finder Tool
 *
 * Find DIY repair tutorials on YouTube.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";

export function createTutorialFinderTool(ctx: ToolContext) {
  return tool({
    description: "Find YouTube video tutorials for DIY repairs. Use this when the user wants step-by-step guidance for a repair.",
    inputSchema: z.object({
      repairTask: z.string().describe("The repair task to find tutorials for (e.g., 'replace toilet flapper', 'fix leaky faucet', 'patch drywall hole')"),
    }),
    execute: async ({ repairTask }) => {
      console.log(`[findRepairTutorials] Starting search for: ${repairTask}`);
      const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(repairTask + " DIY how to")}`;

      if (!ctx.firecrawl) {
        console.log(`[findRepairTutorials] Firecrawl not available`);
        return {
          error: "Tutorial search not available",
          suggestion: `Search YouTube for "${repairTask} DIY tutorial"`,
          youtubeUrl,
        };
      }

      try {
        const result = await scrapeWithTimeout(ctx.firecrawl, youtubeUrl, 20000);

        if (result?.markdown) {
          console.log(`[findRepairTutorials] Success, got ${result.markdown.length} chars`);
          return {
            searchQuery: repairTask,
            youtubeUrl,
            results: result.markdown.substring(0, 2000),
            tips: [
              "Look for videos from verified channels like This Old House, Home Repair Tutor, or manufacturer channels",
              "Check the video date - newer videos may show current best practices",
              "Read comments for additional tips and common mistakes",
              "Watch the full video before starting the repair",
            ],
          };
        }

        console.log(`[findRepairTutorials] Failed or timed out`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "findRepairTutorials", error: "Timed out or failed", repairTask },
        });
        return {
          error: "Tutorial search timed out",
          suggestion: `Search YouTube for "${repairTask} DIY tutorial"`,
          youtubeUrl,
        };
      } catch (error) {
        Sentry.captureException(error, { extra: { tool: "findRepairTutorials", repairTask, url: youtubeUrl } });
        return {
          error: "Tutorial search timed out",
          suggestion: `Search YouTube for "${repairTask} DIY tutorial"`,
          youtubeUrl,
        };
      }
    },
  });
}
