"use server";

/**
 * GET BUDGET DATA
 *
 * Fetches all budgets for a user.
 * Returns encrypted data - client will decrypt.
 */

import { db } from "@/app/db/client";
import { userBudgets } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import type { BudgetResponse } from "./types";

/**
 * Get all budgets for a user
 *
 * PSEUDOCODE:
 * 1. Query all budgets for the user
 * 2. Return encrypted data - client will decrypt
 * 3. Return hasEncryptedData flag for client
 */
export async function getBudgetData(userId: string): Promise<{
  budgets: BudgetResponse[];
  hasEncryptedData: boolean;
}> {
  const budgets = await db
    .select()
    .from(userBudgets)
    .where(eq(userBudgets.userId, userId));

  const hasEncryptedData = budgets.some((b) => b.isEncrypted);

  return {
    budgets: budgets as BudgetResponse[],
    hasEncryptedData,
  };
}
