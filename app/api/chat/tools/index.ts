/**
 * Chat Tools Index
 *
 * Exports all tools for the AI chat assistant.
 * 9 tools covering the full diagnosis-to-action flow.
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import type { ToolContext } from "./types";

// Import tool creators
import { createContractorSearchTool } from "./contractor-tools";
import { createProductSearchTool } from "./product-search";
import { createRedditSearchTool } from "./reddit-search";
import { createRecallCheckTool } from "./recall-check";
import { createLocalLookupTool } from "./local-lookup";
import { createCostLookupTool } from "./cost-lookup";
import { createDraftContractorEmailTool } from "./draft-contractor-email";
import { createCalendarReminderTool } from "./calendar-reminder";
import { createTutorialFinderTool } from "./tutorial-finder";

// Re-export types
export type { ToolContext } from "./types";

/**
 * Create chat tools with the given context
 */
export function createChatTools(
  firecrawl: FirecrawlApp | null,
  userId?: string,
  conversationId?: string,
  userName?: string,
  zipCode?: string
) {
  const ctx: ToolContext = { firecrawl, userId, userName, conversationId, zipCode };

  return {
    // 1. Get real cost estimates from cached data (fast - DB lookup)
    getCostEstimate: createCostLookupTool(ctx),

    // 2. Find local contractors (API-based - fast)
    searchContractors: createContractorSearchTool(ctx),

    // 3. Search for products to buy or compare by reviews (Firecrawl)
    searchProducts: createProductSearchTool(ctx),

    // 4. Search Reddit for real experiences and costs (Firecrawl)
    searchReddit: createRedditSearchTool(ctx),

    // 5. Check safety recalls - CPSC/NHTSA (Firecrawl)
    checkRecalls: createRecallCheckTool(ctx),

    // 6. Look up permits or rebates by location (Firecrawl search)
    lookupLocalInfo: createLocalLookupTool(ctx),

    // 7. Draft email to contractor (fast - text generation)
    draftContractorEmail: createDraftContractorEmailTool(ctx),

    // 8. Schedule a calendar reminder for deferred repairs (Google Calendar)
    scheduleReminder: createCalendarReminderTool(ctx),

    // 9. Find YouTube video tutorials for a specific repair task (Firecrawl search)
    findTutorial: createTutorialFinderTool(ctx),
  };
}

/**
 * Tool descriptions for documentation
 */
export const TOOL_DESCRIPTIONS = {
  getCostEstimate: "Get real DIY and professional cost estimates from cached HomeAdvisor/Angi data",
  searchContractors: "Find contractors in your area by service type and zip code",
  searchProducts: "Search Home Depot for products to buy, or compare products by reviews and ratings",
  searchReddit: "Search Reddit for real user experiences, actual costs, and DIY advice",
  checkRecalls: "Check for product/vehicle safety recalls (CPSC, NHTSA)",
  lookupLocalInfo: "Look up local permit requirements or utility rebates and tax credits by location",
  draftContractorEmail: "Generate a professional email draft to send to a contractor for quotes",
  scheduleReminder: "Schedule a Google Calendar reminder for a deferred repair or maintenance task",
  findTutorial: "Find YouTube video tutorials and how-to guides for a specific repair or DIY task",
};
