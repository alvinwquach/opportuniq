/**
 * COST DATA SCHEMA - Cached pricing data from HomeAdvisor/Angi
 *
 * Stores scraped cost estimates by service type and region.
 * Data is refreshed periodically (weekly/monthly) to stay current.
 *
 * SOURCES:
 * - HomeAdvisor Cost Guides: homeadvisor.com/cost/[category]/[service]/
 * - Angi Cost Articles: angi.com/articles/how-much-does-[service]-cost.htm
 *
 * WORKFLOW:
 * 1. User requests diagnosis for issue type
 * 2. Check cache for cost data (by service + region)
 * 3. If stale/missing, scrape fresh data via Firecrawl
 * 4. AI uses real costs instead of estimates
 * 5. Display cost comparison chart to user
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

// Data source for cost information
export const costSourceEnum = pgEnum("cost_source", [
  "homeadvisor",
  "angi",
  "thumbtack",
  "manual", // Manually entered (co-founder's research)
  "user_submitted", // From users after getting quotes
]);

// ============================================
// TABLES
// ============================================

/**
 * COST_DATA TABLE
 *
 * Cached pricing data by service type and region.
 * Unique constraint on (serviceType, region, source) to prevent duplicates.
 */
export const costData = pgTable(
  "cost_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Service type - matches issue categories/subcategories
    // Examples: "ceiling_repair", "drywall_repair", "plumbing_leak", "hvac_repair"
    serviceType: text("service_type").notNull(),

    // Region identifier - zip code prefix (first 3 digits) or state
    // Examples: "941" (SF Bay Area), "902" (LA), "CA", "national"
    region: text("region").notNull(),

    // Where this data came from
    source: costSourceEnum("source").notNull(),

    // URL that was scraped (for reference/re-scraping)
    sourceUrl: text("source_url"),

    // ============================================
    // DIY COST RANGE
    // ============================================

    // Minimum DIY cost in cents (avoid floating point issues)
    diyMinCents: integer("diy_min_cents"),

    // Maximum DIY cost in cents
    diyMaxCents: integer("diy_max_cents"),

    // Average/typical DIY cost in cents
    diyAvgCents: integer("diy_avg_cents"),

    // ============================================
    // PROFESSIONAL COST RANGE
    // ============================================

    // Minimum professional cost in cents
    proMinCents: integer("pro_min_cents"),

    // Maximum professional cost in cents
    proMaxCents: integer("pro_max_cents"),

    // Average/typical professional cost in cents
    proAvgCents: integer("pro_avg_cents"),

    // ============================================
    // ADDITIONAL CONTEXT
    // ============================================

    // What's included in the cost (materials, labor, etc.)
    // Example: { "diy": ["materials", "tools"], "pro": ["labor", "materials", "cleanup"] }
    costIncludes: jsonb("cost_includes").$type<{
      diy?: string[];
      pro?: string[];
    }>(),

    // Factors that affect cost
    // Example: ["size of repair area", "ceiling height", "asbestos presence"]
    costFactors: jsonb("cost_factors").$type<string[]>(),

    // Typical time to complete
    // Example: { "diy": "2-4 hours", "pro": "1-2 hours" }
    timeEstimate: jsonb("time_estimate").$type<{
      diy?: string;
      pro?: string;
    }>(),

    // Raw scraped content (for debugging/reprocessing)
    rawContent: text("raw_content"),

    // Number of data points this estimate is based on
    // Example: "Based on 1,234 projects"
    sampleSize: integer("sample_size"),

    // When this data was last scraped/updated
    scrapedAt: timestamp("scraped_at").defaultNow().notNull(),

    // When this data should be refreshed (default: 30 days after scrape)
    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique combination of service + region + source
    uniqueIndex("cost_data_service_region_source_idx").on(
      table.serviceType,
      table.region,
      table.source
    ),
  ]
);

/**
 * USER_SUBMITTED_QUOTES TABLE
 *
 * Quotes submitted by users after receiving estimates from contractors.
 * Used to build real-world pricing database over time.
 */
export const userSubmittedQuotes = pgTable("user_submitted_quotes", {
  id: uuid("id").primaryKey().defaultRandom(),

  // User who submitted (optional - can be anonymous)
  userId: uuid("user_id"),

  // Service type - what work was quoted
  serviceType: text("service_type").notNull(),

  // Zip code where quote was received
  zipCode: text("zip_code").notNull(),

  // Quote amount in cents
  quoteCents: integer("quote_cents").notNull(),

  // Is this DIY materials cost or professional quote?
  quoteType: text("quote_type").notNull(), // "diy" | "professional"

  // Contractor name (optional, for reference)
  contractorName: text("contractor_name"),

  // Brief description of what was included
  description: text("description"),

  // Was the quote accepted and work completed?
  wasAccepted: text("was_accepted"), // "yes" | "no" | "pending"

  // Actual final cost if different from quote
  finalCostCents: integer("final_cost_cents"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type CostData = typeof costData.$inferSelect;
export type NewCostData = typeof costData.$inferInsert;

export type UserSubmittedQuote = typeof userSubmittedQuotes.$inferSelect;
export type NewUserSubmittedQuote = typeof userSubmittedQuotes.$inferInsert;
