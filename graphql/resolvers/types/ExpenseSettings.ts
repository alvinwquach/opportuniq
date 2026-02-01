/**
 * Expense Settings Type Resolvers
 *
 * Resolvers for GroupExpenseSettings and GroupExpenseCategory types.
 */

import type { Context } from "../../utils/context";
import type { GroupExpenseCategory as CategoryDB } from "@/app/db/schema";

// =============================================================================
// GROUP EXPENSE CATEGORY RESOLVER
// =============================================================================

export const GroupExpenseCategory = {
  /**
   * Resolve the user who created this category
   */
  createdBy: async (parent: CategoryDB, _: unknown, ctx: Context) => {
    return ctx.loaders.userById.load(parent.createdBy);
  },

  /**
   * Custom threshold as string (decimal)
   */
  customThreshold: (parent: CategoryDB) => {
    return parent.customThreshold?.toString() ?? null;
  },
};

// GroupExpenseSettings has no custom resolvers needed - all fields are direct mappings
export const GroupExpenseSettings = {};
