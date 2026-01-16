"use server";

/**
 * ENCRYPT BUDGET
 *
 * Encrypts an existing plaintext budget.
 * Used for migrating legacy data to encrypted format.
 */

import { db } from "@/app/db/client";
import { userBudgets } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Encrypt an existing plaintext budget
 *
 * PSEUDOCODE:
 * 1. Client fetches plaintext budget
 * 2. Client encrypts category, monthlyLimit, currentSpend
 * 3. Client calls this action with encrypted data
 * 4. Server stores encrypted fields and clears plaintext
 * 5. Sets isEncrypted = true
 */
export async function encryptBudget(
  budgetId: string,
  userId: string,
  data: {
    encryptedCategory: string;
    categoryIv: string;
    encryptedMonthlyLimit: string;
    monthlyLimitIv: string;
    encryptedCurrentSpend: string;
    currentSpendIv: string;
    keyVersion?: number;
  }
) {
  const [budget] = await db
    .update(userBudgets)
    .set({
      isEncrypted: true,
      keyVersion: data.keyVersion || 1,
      algorithm: "AES-GCM-256",
      encryptedCategory: data.encryptedCategory,
      categoryIv: data.categoryIv,
      encryptedMonthlyLimit: data.encryptedMonthlyLimit,
      monthlyLimitIv: data.monthlyLimitIv,
      encryptedCurrentSpend: data.encryptedCurrentSpend,
      currentSpendIv: data.currentSpendIv,
      // Clear plaintext
      category: null,
      monthlyLimit: null,
      currentSpend: null,
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
