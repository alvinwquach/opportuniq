/**
 * Outcome Type Resolvers
 *
 * Resolvers for DecisionOutcome and PreferenceHistory types.
 */

import type { Context } from "../../utils/context";
import type {
  DecisionOutcome as OutcomeDB,
  PreferenceHistory as HistoryDB,
} from "@/app/db/schema";

// =============================================================================
// DECISION OUTCOME RESOLVER
// =============================================================================

export const DecisionOutcome = {
  /**
   * Resolve the decision this outcome belongs to
   */
  decision: async (parent: OutcomeDB, _: unknown, ctx: Context) => {
    return ctx.loaders.decisionById.load(parent.decisionId);
  },
};

// =============================================================================
// PREFERENCE HISTORY RESOLVER
// =============================================================================

export const PreferenceHistory = {
  /**
   * Resolve the group member who made the change (if not system)
   */
  changedBy: async (parent: HistoryDB, _: unknown, ctx: Context) => {
    if (!parent.changedBy) return null;
    return ctx.loaders.memberById.load(parent.changedBy);
  },
};
