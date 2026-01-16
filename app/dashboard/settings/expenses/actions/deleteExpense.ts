"use server";

/**
 * DELETE EXPENSE
 *
 * Removes an expense from the database.
 * Verifies ownership before deletion.
 */

import { db } from "@/app/db/client";
import { userExpenses } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Delete an expense
 *
 * PSEUDOCODE:
 * 1. Verify ownership via userId check in WHERE clause
 * 2. Delete the record
 * 3. Revalidate affected paths
 */
export async function deleteExpense(expenseId: string, userId: string) {
  await db
    .delete(userExpenses)
    .where(
      and(eq(userExpenses.id, expenseId), eq(userExpenses.userId, userId))
    );

  revalidatePath("/dashboard/settings/expenses");
  revalidatePath("/dashboard");
}
