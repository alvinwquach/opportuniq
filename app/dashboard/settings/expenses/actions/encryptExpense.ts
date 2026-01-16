"use server";

/**
 * ENCRYPT EXPENSE
 *
 * Encrypts an existing plaintext expense.
 * Used for migrating legacy data to encrypted format.
 */

import { db } from "@/app/db/client";
import { userExpenses } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Encrypt an existing plaintext expense
 *
 * PSEUDOCODE:
 * 1. Client fetches plaintext expense
 * 2. Client encrypts category, amount, description
 * 3. Client calls this action with encrypted data
 * 4. Server stores encrypted fields and clears plaintext
 * 5. Sets isEncrypted = true
 */
export async function encryptExpense(
  expenseId: string,
  userId: string,
  data: {
    encryptedCategory: string;
    categoryIv: string;
    encryptedAmount: string;
    amountIv: string;
    encryptedDescription?: string;
    descriptionIv?: string;
    keyVersion?: number;
  }
) {
  const [expense] = await db
    .update(userExpenses)
    .set({
      isEncrypted: true,
      keyVersion: data.keyVersion || 1,
      algorithm: "AES-GCM-256",
      encryptedCategory: data.encryptedCategory,
      categoryIv: data.categoryIv,
      encryptedAmount: data.encryptedAmount,
      amountIv: data.amountIv,
      encryptedDescription: data.encryptedDescription || null,
      descriptionIv: data.descriptionIv || null,
      // Clear plaintext
      category: null,
      amount: null,
      description: null,
    })
    .where(
      and(eq(userExpenses.id, expenseId), eq(userExpenses.userId, userId))
    )
    .returning();

  revalidatePath("/dashboard/settings/expenses");
  revalidatePath("/dashboard");

  return expense;
}
