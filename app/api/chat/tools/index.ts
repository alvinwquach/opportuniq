/**
 * Chat Tools Index
 *
 * Exports all tools for the AI chat assistant.
 * GPT-4o handles 12 tools well; system prompt guides tool selection to reduce
 * ambiguity (e.g. searchProducts vs searchProductReviews vs findTutorial).
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import type { ToolContext } from "./types";

// Import tool creators
import { createContractorSearchTool } from "./contractor-tools";
import { createProductSearchTool } from "./product-search";
import { createRedditSearchTool } from "./reddit-search";
import { createRecallCheckTool } from "./recall-check";
import { createUtilityRebatesTool } from "./utility-rebates";
import { createCostLookupTool } from "./cost-lookup";
import { createDraftContractorEmailTool } from "./draft-contractor-email";
import { createCalendarReminderTool } from "./calendar-reminder";
import { createInventoryCheckTool } from "./inventory-check";
import { createProductReviewsTool } from "./product-reviews";
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

    // 3. Search for products to buy: tools, materials, PPE (Firecrawl)
    searchProducts: createProductSearchTool(ctx),

    // 4. Search Reddit for real experiences and costs (Firecrawl)
    searchReddit: createRedditSearchTool(ctx),

    // 5. Check safety recalls - CPSC/NHTSA (Firecrawl)
    checkRecalls: createRecallCheckTool(ctx),

    // 6. Find utility rebates and tax credits (Firecrawl)
    findUtilityRebates: createUtilityRebatesTool(ctx),

    // 7. Draft email to contractor (fast - text generation)
    draftContractorEmail: createDraftContractorEmailTool(ctx),

    // 8. Schedule a calendar reminder for deferred repairs (Google Calendar)
    scheduleReminder: createCalendarReminderTool(ctx),

    // 9. Check in-store inventory at Home Depot near user's zip code (Firecrawl interact)
    checkLocalInventory: createInventoryCheckTool(ctx),

    // 10. Search product reviews and ratings to compare tools/materials (Firecrawl search + JSON extraction)
    searchProductReviews: createProductReviewsTool(ctx),

    // 11. Find YouTube video tutorials for a specific repair task (Firecrawl search)
    findTutorial: createTutorialFinderTool(ctx),
  };
}

/**
 * Tool descriptions for documentation
 */
export const TOOL_DESCRIPTIONS = {
  getCostEstimate: "Get real DIY and professional cost estimates from cached HomeAdvisor/Angi data",
  searchContractors: "Find contractors in your area by service type and zip code",
  searchProducts: "Search Home Depot for tools, materials, or PPE products to purchase",
  searchReddit: "Search Reddit for real user experiences, actual costs, and DIY advice",
  checkRecalls: "Check for product/vehicle safety recalls (CPSC, NHTSA)",
  findUtilityRebates: "Find utility rebates and federal tax credits for energy upgrades",
  draftContractorEmail: "Generate a professional email draft to send to a contractor for quotes",
  scheduleReminder: "Schedule a Google Calendar reminder for a deferred repair or maintenance task",
  checkLocalInventory: "Check if a product is in stock at a nearby Home Depot using the user's zip code",
  searchProductReviews: "Search for product reviews and ratings to help compare tools or materials",
  findTutorial: "Find YouTube video tutorials and how-to guides for a specific repair or DIY task",
};
