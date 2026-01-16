"use server";

/**
 * ADD BUDGET
 *
 * Creates a new budget with encrypted data.
 * Client encrypts before sending, server stores ciphertext.
 */

import { db } from "@/app/db/client";
import { userBudgets } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type { EncryptedBudgetInput } from "./types";

/**
 * Add a new encrypted budget
 *
 * PSEUDOCODE:
 * 1. Receive encrypted fields from client
 * 2. Store ciphertext + IV for each encrypted field
 * 3. Set isEncrypted = true
 * 4. Return the new budget record
 */
export async function addBudget(userId: string, data: EncryptedBudgetInput) {
  const [budget] = await db
    .insert(userBudgets)
    .values({
      userId,
      isEncrypted: true,
      keyVersion: data.keyVersion || 1,
      algorithm: "AES-GCM-256",
      // Encrypted fields
      encryptedCategory: data.encryptedCategory,
      categoryIv: data.categoryIv,
      encryptedMonthlyLimit: data.encryptedMonthlyLimit,
      monthlyLimitIv: data.monthlyLimitIv,
      encryptedCurrentSpend: data.encryptedCurrentSpend || null,
      currentSpendIv: data.currentSpendIv || null,
    })
    .returning();

  revalidatePath("/dashboard/settings/budgets");
  revalidatePath("/dashboard");

  return budget;
}

/**
 * Add budget without encryption (legacy support)
 * Use addBudget for new encrypted data
 */
export async function addBudgetPlaintext(
  userId: string,
  data: {
    category: string;
    monthlyLimit: number;
    currentSpend?: number;
  }
) {
  const [budget] = await db
    .insert(userBudgets)
    .values({
      userId,
      isEncrypted: false,
      category: data.category,
      monthlyLimit: data.monthlyLimit.toString(),
      currentSpend: (data.currentSpend || 0).toString(),
    })
    .returning();

  revalidatePath("/dashboard/settings/budgets");
  revalidatePath("/dashboard");

  return budget;
}
