/**
 * DECISIONS SCHEMA - AI-generated decision options and household voting
 *
 * RELATIONS:
 * - Issues (1) → (Many) DecisionOptions - One issue has many resolution options (DIY, hire, defer, replace)
 * - DecisionOptions (1) → (Many) OptionSimulations - One option has many "what-if" scenarios
 * - DecisionOptions (1) → (Many) ProductRecommendations - One option needs many products/tools
 * - DecisionOptions (1) → (Many) VendorContacts - One option has many vendor recommendations
 * - Issues (1) → (1) Decision - One issue has one final decision (unique constraint)
 * - Decisions (1) → (Many) DecisionVotes - One decision has many member votes
 *
 * WORKFLOW:
 * 1. AI generates options (decisionOptions) → DIY, hire, defer, replace
 * 2. Run simulations (optionSimulations) → What if prices rise? Income loss?
 * 3. Household votes (decisionVotes) → Approve/reject/abstain
 * 4. Decision finalized (decisions) → Lock in chosen option
 * 5. Sourcing (productRecommendations, vendorContacts) → Where to buy/who to hire
 */

import { pgTable, uuid, text, timestamp, pgEnum, jsonb, boolean, decimal, integer } from "drizzle-orm/pg-core";
import { issues } from "./issues";
import { groupMembers } from "./groups";

// ============================================
// ENUMS
// ============================================

// Decision option types: diy (do it yourself), hire (professional), defer (postpone), replace (buy new)
export const optionTypeEnum = pgEnum("option_type", [
  "diy",
  "hire",
  "defer",
  "replace",
]);

// Voting: approve (yes), reject (no), abstain (pass)
export const voteTypeEnum = pgEnum("vote_type", [
  "approve",
  "reject",
  "abstain",
]);

// ============================================
// TABLES
// ============================================

/**
 * DECISION_OPTIONS TABLE
 *
 * AI-generated repair/resolution strategies for an issue.
 * Example: DIY $50 (2 hrs), Hire $200 (same day), Defer (monitor)
 *
 * Relation: One issue → Many options
 */
export const decisionOptions = pgTable("decision_options", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - cascade delete removes options when issue deleted
  // Relation: Many decisionOptions → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),

  // Strategy type - see optionTypeEnum
  type: optionTypeEnum("type").notNull(),

  // Short name - e.g., "DIY Brake Pad Replacement (Save $200)"
  title: text("title").notNull(),

  // Detailed explanation with pros/cons
  description: text("description"),

  // Estimated cost range
  costMin: decimal("cost_min", { precision: 10, scale: 2 }),
  costMax: decimal("cost_max", { precision: 10, scale: 2 }),

  // Expected duration - e.g., "2-4 hours", "Same day", "1 week"
  timeEstimate: text("time_estimate"),

  // Risk level - references riskLevelEnum from issues.ts
  riskLevel: text("risk_level"),

  // Cost if this option fails - e.g., "Additional $200 for professional fix"
  failureCost: text("failure_cost"),

  // What could go wrong - e.g., "Could strip threads", "Warranty void"
  failureRisk: text("failure_risk"),

  // Project category - references projectCategoryEnum from issues.ts
  category: text("category"),

  // Can this be done DIY safely?
  diyViable: boolean("diy_viable").default(true),

  // Warning message if not viable for DIY
  diyWarning: text("diy_warning"),

  // Required skills - e.g., ["pipe_fitting", "soldering"]
  requiredSkills: jsonb("required_skills").$type<string[]>(),

  // Required tools - e.g., ["floor_jack", "lug_wrench"]
  requiredTools: jsonb("required_tools").$type<string[]>(),

  // Required parts - e.g., ["3/4\" copper pipe (10ft)", "compression fittings (2)"]
  requiredParts: jsonb("required_parts").$type<string[]>(),

  // AI's top choice flag - only one option should be recommended=true
  recommended: boolean("recommended").default(false).notNull(),

  // AI's explanation for this option
  reasoning: text("reasoning"),

  // AI's certainty (0-100) - higher is more reliable cost/time estimates
  confidenceScore: integer("confidence_score"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * OPTION_SIMULATIONS TABLE
 *
 * "What-if" scenario modeling for risk analysis.
 * Example: "What if parts cost 30% more?" "What if income drops?"
 *
 * Relation: One option → Many simulations
 */
export const optionSimulations = pgTable("option_simulations", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to decisionOptions - cascade delete
  // Relation: Many optionSimulations → One decisionOption
  optionId: uuid("option_id")
    .notNull()
    .references(() => decisionOptions.id, { onDelete: "cascade" }),

  // Scenario type - e.g., "income_loss", "price_increase", "delay"
  scenarioType: text("scenario_type").notNull(),

  // Human-readable description - e.g., "Supply chain delays could increase part costs by 25-40%"
  scenarioDescription: text("scenario_description"),

  // Impact analysis - flexible JSONB structure
  // Example: {newCostMin: 650, newCostMax: 780, budgetOverrun: 280, recommendation: "Defer until prices stabilize"}
  projectedOutcome: jsonb("projected_outcome").$type<{
    newCostMin?: number;
    newCostMax?: number;
    budgetOverrun?: number;
    timeImpact?: string;
    riskChange?: string;
    recommendation?: string;
    probability?: number;
    mitigation?: string;
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * DECISIONS TABLE
 *
 * Final household choice after voting on options.
 * Unique constraint: one issue = one decision.
 *
 * Relation: One issue → One decision (unique)
 */
export const decisions = pgTable("decisions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - unique constraint ensures one decision per issue
  // Relation: One decision → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" })
    .unique(),

  // Which option was chosen
  // Relation: Many decisions → One decisionOption
  selectedOptionId: uuid("selected_option_id")
    .notNull()
    .references(() => decisionOptions.id),

  // Context at decision time - e.g., {budget: 500, timeAvailable: "weekend", skillLevel: "intermediate"}
  assumptions: jsonb("assumptions").$type<{
    budget?: number;
    timeAvailable?: string;
    skillLevel?: string;
    urgency?: string;
    marketConditions?: string;
    vehicleAvailability?: string;
    weatherWindow?: string;
    helperAvailable?: boolean;
    reasoning?: string;
    backupPlan?: string;
    costSavings?: number;
  }>(),

  // When to re-evaluate (for deferred options)
  revisitDate: timestamp("revisit_date"),

  // When household finalized this decision
  approvedAt: timestamp("approved_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * DECISION_VOTES TABLE
 *
 * Household member approvals/rejections for democratic decision-making.
 *
 * Relation: One decision → Many votes
 */
export const decisionVotes = pgTable("decision_votes", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to decisions - cascade delete
  // Relation: Many decisionVotes → One decision
  decisionId: uuid("decision_id")
    .notNull()
    .references(() => decisions.id, { onDelete: "cascade" }),

  // Which household member voted
  // Relation: Many decisionVotes → One groupMember
  memberId: uuid("member_id")
    .notNull()
    .references(() => groupMembers.id, { onDelete: "cascade" }),

  // Member's position - see voteTypeEnum
  vote: voteTypeEnum("vote").notNull(),

  // Optional explanation - e.g., "Too risky, we don't have the right tools"
  comment: text("comment"),

  votedAt: timestamp("voted_at").defaultNow().notNull(),
});

/**
 * PRODUCT_RECOMMENDATIONS TABLE
 *
 * Where to buy tools/parts for DIY options. AI finds in-stock items at nearby stores.
 *
 * Relation: One option → Many products
 */
export const productRecommendations = pgTable("product_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to decisionOptions - cascade delete
  // Relation: Many productRecommendations → One decisionOption
  optionId: uuid("option_id")
    .notNull()
    .references(() => decisionOptions.id, { onDelete: "cascade" }),

  // Specific item with size/specs - e.g., "Wagner ThermoQuiet QC1324 Front Brake Pads (fits 2015-2020 Honda Civic)"
  productName: text("product_name").notNull(),

  // Category: "tools", "parts", "materials", "safety_equipment"
  productCategory: text("product_category"),

  // Price per unit
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),

  // Retailer - e.g., "Home Depot", "AutoZone", "Amazon"
  storeName: text("store_name").notNull(),

  // Physical location for GPS navigation
  storeAddress: text("store_address"),

  // Distance from user's ZIP code - e.g., "2.3 miles"
  storeDistance: text("store_distance"),

  // Link to product page or store locator
  storeUrl: text("store_url"),

  // Availability status - true (in stock), false (out), null (unknown)
  inStock: boolean("in_stock"),

  // When AI searched for this product
  searchedAt: timestamp("searched_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * VENDOR_CONTACTS TABLE
 *
 * Professional service providers for "hire" options. AI researches local vendors
 * with ratings, generates email drafts, tracks contact status.
 *
 * Relation: One option → Many vendors (or one issue → many vendors)
 */
export const vendorContacts = pgTable("vendor_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Optional link to "hire" decision option
  // Relation: Many vendorContacts → One decisionOption
  optionId: uuid("option_id")
    .references(() => decisionOptions.id, { onDelete: "cascade" }),

  // Optional link to issue (vendors can be suggested before decision)
  // Relation: Many vendorContacts → One issue
  issueId: uuid("issue_id")
    .references(() => issues.id, { onDelete: "cascade" }),

  // Business name - e.g., "Joe's Plumbing", "Elite Auto Repair"
  vendorName: text("vendor_name").notNull(),

  // Contact details - {phone, email, website, hours, emergencyPhone, preferredContact}
  contactInfo: jsonb("contact_info").$type<{
    phone?: string;
    email?: string;
    website?: string;
    hours?: string;
    emergencyPhone?: string;
    preferredContact?: "phone" | "email" | "form";
  }>(),

  // Estimated cost from vendor or industry average
  quoteAmount: decimal("quote_amount", { precision: 10, scale: 2 }),

  // What's included - e.g., "Includes parts, labor, and 1-year warranty"
  quoteDetails: text("quote_details"),

  // Average review score - e.g., "4.8 stars", "A+ (BBB)"
  rating: text("rating"),

  // AI summary of reviews - e.g., "Highly recommended. Customers praise fair pricing and clear explanations..."
  reviewSummary: text("review_summary"),

  // Vendor expertise - e.g., ["transmission repair", "European vehicles"]
  specialties: jsonb("specialties").$type<string[]>(),

  // Distance from user - e.g., "5.2 miles"
  distance: text("distance"),

  // Has user reached out?
  contacted: boolean("contacted").default(false).notNull(),

  // AI-generated email template customized for issue
  emailDraft: text("email_draft"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for type-safe queries
export type DecisionOption = typeof decisionOptions.$inferSelect;
export type NewDecisionOption = typeof decisionOptions.$inferInsert;

export type OptionSimulation = typeof optionSimulations.$inferSelect;
export type NewOptionSimulation = typeof optionSimulations.$inferInsert;

export type Decision = typeof decisions.$inferSelect;
export type NewDecision = typeof decisions.$inferInsert;

export type DecisionVote = typeof decisionVotes.$inferSelect;
export type NewDecisionVote = typeof decisionVotes.$inferInsert;

export type ProductRecommendation = typeof productRecommendations.$inferSelect;
export type NewProductRecommendation = typeof productRecommendations.$inferInsert;

export type VendorContact = typeof vendorContacts.$inferSelect;
export type NewVendorContact = typeof vendorContacts.$inferInsert;
