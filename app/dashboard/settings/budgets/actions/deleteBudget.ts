"use server";

/**
 * DELETE BUDGET
 *
 * Removes a budget from the database.
 * Verifies ownership before deletion.
 */

import { db } from "@/app/db/client";
import { userBudgets } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Delete a budget
 *
 * PSEUDOCODE:
 * 1. Verify ownership via userId check in WHERE clause
 * 2. Delete the record
 * 3. Revalidate affected paths
 */
export async function deleteBudget(budgetId: string, userId: string) {
  await db
    .delete(userBudgets)
    .where(
      and(eq(userBudgets.id, budgetId), eq(userBudgets.userId, userId))
    );

  revalidatePath("/dashboard/settings/budgets");
  revalidatePath("/dashboard");
}
