/**
 * OUTCOMES SCHEMA - Post-execution analysis and AI learning
 *
 * RELATIONS:
 * - Decisions (1) → (1) DecisionOutcomes - One decision has one outcome (tracks actual vs predicted results)
 * - Groups (1) → (Many) PreferenceHistory - One group has many preference change records
 *
 * PURPOSE:
 * Tracks actual results after decisions are executed to:
 * - Compare predicted vs actual cost/time
 * - Identify AI prediction biases
 * - Learn household preferences
 * - Improve future recommendations
 *
 * LEARNING LOOP:
 * 1. Decision made: Predicted $200, 2 hours
 * 2. Actual outcome: $275, 4 hours
 * 3. AI analyzes deltas: "Consistently underestimate time by 50%"
 * 4. Update preferences: riskTolerance "moderate" → "low" (3 failed DIY attempts)
 * 5. Future decisions improved
 */

import { pgTable, uuid, text, timestamp, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { decisions } from "./decisions";

// ============================================
// TABLES
// ============================================

/**
 * DECISION_OUTCOMES TABLE
 *
 * Captures actual results vs predictions for AI learning.
 * Relation: One decision → One outcome (unique)
 */
export const decisionOutcomes = pgTable("decision_outcomes", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to decisions - unique constraint (one outcome per decision)
  // Relation: One decisionOutcome → One decision
  decisionId: uuid("decision_id")
    .notNull()
    .references(() => decisions.id, { onDelete: "cascade" })
    .unique(),

  // Real final cost incurred (DIY: parts+tools, Hire: invoice, Replace: purchase price)
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),

  // Real duration to complete - e.g., "3 hours", "2 days"
  actualTime: text("actual_time"),

  // Did repair achieve its goal?
  success: boolean("success").notNull(),

  // When work finished
  completedAt: timestamp("completed_at").notNull(),

  // Difference from predicted cost - positive = over budget, negative = under budget
  costDelta: decimal("cost_delta", { precision: 10, scale: 2 }),

  // Difference from predicted time - e.g., "2 hours longer than expected"
  timeDelta: text("time_delta"),

  // User reflection - what went right?
  // Example: "Guide was clear, saved $300 vs mechanic"
  whatWentWell: text("what_went_well"),

  // User reflection - what went wrong?
  // Example: "Bolt was rusted, needed penetrating oil (not in parts list)"
  whatWentWrong: text("what_went_wrong"),

  // User reflection - takeaways for future
  // Example: "Always buy extra parts - one faucet washer broke during install"
  lessonsLearned: text("lessons_learned"),

  // Would user make same decision type again?
  // true + success: ideal outcome
  // false + success: worked but not worth effort
  wouldDoAgain: boolean("would_do_again"),

  // AI self-analysis of prediction errors
  // Example: {costBias: "Underestimate by 15%", timeBias: "Beginners take 2.5x longer"}
  biasDetected: jsonb("bias_detected").$type<{
    costBias?: string;
    timeBias?: string;
    categoryPattern?: string;
    userPattern?: string;
    confidence?: number;
    sampleSize?: number;
    recommendation?: string;
  }>(),

  // AI-recommended household preference changes
  // Example: {field: "diy_preference", currentValue: "prefer_diy", suggestedValue: "neutral", reason: "3 consecutive DIY projects exceeded time estimates"}
  preferenceUpdates: jsonb("preference_updates").$type<{
    field?: string;
    currentValue?: string;
    suggestedValue?: string;
    reason?: string;
    confidence?: number;
    evidence?: string[];
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * PREFERENCE_HISTORY TABLE
 *
 * Audit trail of household preference evolution.
 * Tracks manual and AI-suggested changes to groupConstraints.
 *
 * Relation: One group → Many preference changes
 */
export const preferenceHistory = pgTable("preference_history", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Group whose preferences changed - should add formal FK to groups.id
  groupId: uuid("group_id").notNull(),

  // Which preference field changed - e.g., "risk_tolerance", "diy_preference"
  // Should match groupConstraints column names
  field: text("field").notNull(),

  // Previous value - e.g., "moderate", "prefer_diy", "500"
  // Null if this is the initial value (onboarding)
  oldValue: text("old_value"),

  // New value - e.g., "low", "neutral", "750"
  newValue: text("new_value").notNull(),

  // Explanation for change - manual or AI-generated
  // Example: "3 consecutive DIY projects took 2x longer than estimated. Recommend neutral DIY preference."
  reason: text("reason"),

  // Who/what made the change - groupMember UUID or "system" for AI
  changedBy: uuid("changed_by"),

  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

// Type exports for type-safe queries
export type DecisionOutcome = typeof decisionOutcomes.$inferSelect;
export type NewDecisionOutcome = typeof decisionOutcomes.$inferInsert;

export type PreferenceHistory = typeof preferenceHistory.$inferSelect;
export type NewPreferenceHistory = typeof preferenceHistory.$inferInsert;
