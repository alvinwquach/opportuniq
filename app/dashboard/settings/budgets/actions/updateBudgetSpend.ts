"use server";

/**
 * UPDATE BUDGET SPEND
 *
 * Updates only the currentSpend field of a budget.
 * Called when expenses are logged to update budget tracking.
 */

import { db } from "@/app/db/client";
import { userBudgets } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Update only the current spend field
 * Called when expenses are logged to update budget tracking
 *
 * PSEUDOCODE:
 * 1. Receive encrypted currentSpend from client
 * 2. Update only the spend fields
 * 3. Return updated budget
 */
export async function updateBudgetSpend(
  budgetId: string,
  userId: string,
  data: {
    encryptedCurrentSpend: string;
    currentSpendIv: string;
    keyVersion?: number;
  }
) {
  const [budget] = await db
    .update(userBudgets)
    .set({
      encryptedCurrentSpend: data.encryptedCurrentSpend,
      currentSpendIv: data.currentSpendIv,
      currentSpend: null, // Clear legacy plaintext
      keyVersion: data.keyVersion || 1,
      isEncrypted: true,
      updatedAt: new Date(),
    })
    .where(
      and(eq(userBudgets.id, budgetId), eq(userBudgets.userId, userId))
    )
    .returning();

  revalidatePath("/dashboard/settings/budgets");
  revalidatePath("/dashboard");

  return budget;
}

/**
 * Reset current spend to zero (called on 1st of month)
 * Client encrypts "0" and sends encrypted value
 *
 * PSEUDOCODE:
 * 1. Receive encrypted zero value from client
 * 2. Update currentSpend fields
 * 3. Return updated budget
 */
export async function resetBudgetSpend(
  budgetId: string,
  userId: string,
  data: {
    encryptedCurrentSpend: string; // Encrypted "0"
    currentSpendIv: string;
    keyVersion?: number;
  }
) {
  return updateBudgetSpend(budgetId, userId, data);
}
