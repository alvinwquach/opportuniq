/**
 * Local Inventory Check Tool
 *
 * Check if products are in stock at nearby stores.
 * Supports interact() flow (behind firecrawl-interact flag) for zip-aware results.
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

export function createInventoryCheckTool(ctx: ToolContext) {
  return tool({
    description:
      "Check if a product is in stock at local stores near the user's zip code. Use this when the user needs something urgently or wants to pick up in-store today.",
    inputSchema: z.object({
      query: z.string().describe("Product to check inventory for"),
      zipCode: z.string().describe("User's zip code for local store lookup"),
    }),
    execute: async ({ query, zipCode }) => {

      if (!ctx.firecrawl) {
        return {
          error: "Inventory check not available",
          suggestion: `Check inventory at homedepot.com or lowes.com using zip code ${zipCode}`,
        };
      }

      const hdUrl = `https://www.homedepot.com/s/${encodeURIComponent(query)}?NCNI-5`;
      const userId = ctx.userId ?? "system";
      const isEnhancedDomain = ENHANCED_DOMAINS.some((d) => hdUrl.includes(d));

      const [useInteract, useEnhanced] = await Promise.all([
        getFeatureFlag("firecrawl-interact", userId),
        getFeatureFlag("firecrawl-enhanced-mode", userId),
      ]);

      // ── Interact flow (flag ON) ──────────────────────────────────────────────
      if (useInteract) {
        try {
          const scrapeResult = await Promise.race([
            ctx.firecrawl.scrape(hdUrl, {
              formats: ["markdown"],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(useEnhanced && isEnhancedDomain ? { enhancedMode: true } : {}),
              actions: POPUP_DISMISS_ACTIONS,
            } as Parameters<typeof ctx.firecrawl.scrape>[1]),
            new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), 25000)
            ),
          ]);

          if (!scrapeResult) {
            throw new Error("Scrape timed out before interact");
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const scrapeId = (scrapeResult as any).metadata?.scrapeId;
          if (!scrapeId) {
            throw new Error("No scrapeId in scrape metadata");
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fc = ctx.firecrawl as any;
          const interactResponse = await fc.interact(scrapeId, {
            prompt: `Enter zip code ${zipCode} in the store finder or location selector and tell me if this product is in stock at nearby stores. Include store name, address, and availability status.`,
          });

          // Stop session — cleanup only, don't throw on failure
          fc.stopInteraction(scrapeId).catch((err: unknown) => {
            console.warn("[checkLocalInventory] stopInteraction failed:", err);
          });

          return {
            query,
            zipCode,
            source: "Home Depot (interact)",
            inventory: interactResponse?.output ?? "No availability data returned",
            tip: "Call the store to confirm availability before visiting.",
          };
        } catch (interactError) {
          // Fall through to basic scrape
          console.warn(
            "[checkLocalInventory] Interact failed, falling back to basic scrape:",
            interactError
          );
          Sentry.captureException(interactError, {
            extra: { tool: "checkLocalInventory", step: "interact", query, zipCode },
          });
        }
      }

      // ── Basic scrape (flag OFF or interact failed) ──────────────────────────
      try {
        const result = await Promise.race([
          ctx.firecrawl.scrape(hdUrl, {
            formats: ["markdown"],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(useEnhanced && isEnhancedDomain ? { enhancedMode: true } : {}),
            actions: POPUP_DISMISS_ACTIONS,
          } as Parameters<typeof ctx.firecrawl.scrape>[1]),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 20000)
          ),
        ]);

        if (result?.markdown) {
          return {
            query,
            zipCode,
            source: "Home Depot",
            inventory: result.markdown.substring(0, 2000),
            tip: "Call the store to confirm availability before visiting.",
          };
        }

        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: {
            tool: "checkLocalInventory",
            error: "Timed out or failed",
            query,
            zipCode,
          },
        });
        return {
          error: "Inventory check timed out or failed",
          suggestion: `Visit homedepot.com or lowes.com and enter zip code ${zipCode}`,
          shopUrl: hdUrl,
        };
      } catch (error) {
        Sentry.captureException(error, {
          extra: { tool: "checkLocalInventory", query, zipCode, url: hdUrl },
        });
        return {
          error: "Inventory check timed out or failed",
          suggestion: `Visit homedepot.com or lowes.com and enter zip code ${zipCode}`,
          shopUrl: hdUrl,
        };
      }
    },
  });
}
