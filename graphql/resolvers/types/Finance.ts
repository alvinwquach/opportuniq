/**
 * Finance Type Resolvers
 *
 * Resolvers for UserIncomeStream, UserExpense, UserBudget types.
 * Handles computed fields like monthlyEquivalent, remainingBudget, percentUsed.
 */

import type { Context } from "../../utils/context";
import type {
  UserIncomeStream as IncomeStreamDB,
  UserExpense as ExpenseDB,
  UserBudget as BudgetDB,
} from "@/app/db/schema";

// =============================================================================
// FREQUENCY CONVERSION MULTIPLIERS
// =============================================================================

const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0, // One-time income doesn't contribute to monthly
};

// =============================================================================
// USER INCOME STREAM RESOLVER
// =============================================================================

export const UserIncomeStream = {
  /**
   * Calculate monthly equivalent of income based on frequency
   */
  monthlyEquivalent: (parent: IncomeStreamDB) => {
    const amount = parseFloat(parent.amount ?? "0");
    const multiplier = FREQUENCY_TO_MONTHLY[parent.frequency] ?? 1;
    return (amount * multiplier).toFixed(2);
  },
};

// =============================================================================
// USER EXPENSE RESOLVER
// =============================================================================

export const UserExpense = {
  /**
   * Resolve linked issue (if expense is tied to a repair)
   */
  issue: async (parent: ExpenseDB, _: unknown, ctx: Context) => {
    if (!parent.issueId) return null;
    return ctx.loaders.issueById.load(parent.issueId);
  },
};

// =============================================================================
// USER BUDGET RESOLVER
// =============================================================================

export const UserBudget = {
  /**
   * Calculate remaining budget (limit - spent)
   */
  remainingBudget: (parent: BudgetDB) => {
    const limit = parseFloat(parent.monthlyLimit ?? "0");
    const spent = parseFloat(parent.currentSpend ?? "0");
    return Math.max(0, limit - spent).toFixed(2);
  },

  /**
   * Calculate percentage of budget used
   */
  percentUsed: (parent: BudgetDB) => {
    const limit = parseFloat(parent.monthlyLimit ?? "0");
    const spent = parseFloat(parent.currentSpend ?? "0");
    if (limit === 0) return 0;
    return Math.min(100, (spent / limit) * 100);
  },
};
