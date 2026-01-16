"use server";

/**
 * UPDATE EXPENSE
 *
 * Updates an existing expense with encrypted data.
 * Supports partial updates - only provided fields are updated.
 */

import { db } from "@/app/db/client";
import { userExpenses } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { EncryptedExpenseInput } from "./types";
import { calculateNextDueDate } from "./helpers";

/**
 * Update an existing expense with encrypted data
 *
 * PSEUDOCODE:
 * 1. Receive encrypted fields from client
 * 2. Build update object with provided fields
 * 3. Update ciphertext + IV for each encrypted field
 * 4. Recalculate nextDueDate if frequency changes
 * 5. Verify ownership via userId check
 * 6. Return updated expense
 */
export async function updateExpense(
  expenseId: string,
  userId: string,
  data: Partial<EncryptedExpenseInput> & {
    date?: Date;
    frequency?: string;
    issueId?: string | null;
  }
) {
  const updateData: Record<string, unknown> = {};

  // Encrypted fields (must provide both ciphertext and IV)
  if (data.encryptedCategory && data.categoryIv) {
    updateData.encryptedCategory = data.encryptedCategory;
    updateData.categoryIv = data.categoryIv;
    updateData.category = null; // Clear legacy plaintext
    updateData.isEncrypted = true;
  }
  if (data.encryptedAmount && data.amountIv) {
    updateData.encryptedAmount = data.encryptedAmount;
    updateData.amountIv = data.amountIv;
    updateData.amount = null; // Clear legacy plaintext
    updateData.isEncrypted = true;
  }
  if (data.encryptedDescription !== undefined) {
    updateData.encryptedDescription = data.encryptedDescription || null;
    updateData.descriptionIv = data.descriptionIv || null;
    updateData.description = null; // Clear legacy plaintext
  }

  // Key version update
  if (data.keyVersion !== undefined) {
    updateData.keyVersion = data.keyVersion;
  }

  // Plaintext fields
  if (data.date !== undefined) {
    updateData.date = data.date;
  }
  if (data.issueId !== undefined) {
    updateData.issueId = data.issueId;
  }
  if (data.frequency !== undefined) {
    const isRecurring = data.frequency !== "one_time";
    updateData.isRecurring = isRecurring;
    updateData.recurringFrequency = isRecurring ? data.frequency : null;

    // Recalculate next due date
    if (isRecurring && data.date) {
      updateData.nextDueDate = calculateNextDueDate(data.date, data.frequency);
    } else if (!isRecurring) {
      updateData.nextDueDate = null;
    }
  }

  const [expense] = await db
    .update(userExpenses)
    .set(updateData)
    .where(
      and(eq(userExpenses.id, expenseId), eq(userExpenses.userId, userId))
    )
    .returning();

  revalidatePath("/dashboard/settings/expenses");
  revalidatePath("/dashboard");

  return expense;
}
