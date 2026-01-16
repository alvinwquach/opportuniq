"use server";

/**
 * UPDATE BUDGET
 *
 * Updates an existing budget with encrypted data.
 * Supports partial updates - only provided fields are updated.
 */

import { db } from "@/app/db/client";
import { userBudgets } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { EncryptedBudgetInput } from "./types";

/**
 * Update an existing budget with encrypted data
 *
 * PSEUDOCODE:
 * 1. Receive encrypted fields from client
 * 2. Build update object with provided fields
 * 3. Update ciphertext + IV for each encrypted field
 * 4. Verify ownership via userId check
 * 5. Return updated budget
 */
export async function updateBudget(
  budgetId: string,
  userId: string,
  data: Partial<EncryptedBudgetInput>
) {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Encrypted fields (must provide both ciphertext and IV)
  if (data.encryptedCategory && data.categoryIv) {
    updateData.encryptedCategory = data.encryptedCategory;
    updateData.categoryIv = data.categoryIv;
    updateData.category = null; // Clear legacy plaintext
    updateData.isEncrypted = true;
  }
  if (data.encryptedMonthlyLimit && data.monthlyLimitIv) {
    updateData.encryptedMonthlyLimit = data.encryptedMonthlyLimit;
    updateData.monthlyLimitIv = data.monthlyLimitIv;
    updateData.monthlyLimit = null; // Clear legacy plaintext
    updateData.isEncrypted = true;
  }
  if (data.encryptedCurrentSpend !== undefined) {
    updateData.encryptedCurrentSpend = data.encryptedCurrentSpend || null;
    updateData.currentSpendIv = data.currentSpendIv || null;
    updateData.currentSpend = null; // Clear legacy plaintext
  }

  // Key version update
  if (data.keyVersion !== undefined) {
    updateData.keyVersion = data.keyVersion;
  }

  const [budget] = await db
    .update(userBudgets)
    .set(updateData)
    .where(
      and(eq(userBudgets.id, budgetId), eq(userBudgets.userId, userId))
    )
    .returning();

  revalidatePath("/dashboard/settings/budgets");
  revalidatePath("/dashboard");

  return budget;
}
