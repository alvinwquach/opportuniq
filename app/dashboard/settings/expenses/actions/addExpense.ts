"use server";

/**
 * ADD EXPENSE
 *
 * Creates a new expense with encrypted data.
 * Client encrypts before sending, server stores ciphertext.
 */

import { db } from "@/app/db/client";
import { userExpenses } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type { EncryptedExpenseInput } from "./types";
import type { ExpenseFrequency } from "../schemas";
import { calculateNextDueDate } from "./helpers";

/**
 * Add a new encrypted expense
 *
 * PSEUDOCODE:
 * 1. Receive encrypted fields from client
 * 2. Calculate isRecurring and nextDueDate from frequency
 * 3. Store ciphertext + IV for each encrypted field
 * 4. Set isEncrypted = true
 * 5. Return the new expense record
 */
export async function addExpense(userId: string, data: EncryptedExpenseInput) {
  const isRecurring = data.frequency !== "one_time";
  const nextDueDate = isRecurring
    ? calculateNextDueDate(data.date, data.frequency)
    : null;

  const [expense] = await db
    .insert(userExpenses)
    .values({
      userId,
      isEncrypted: true,
      keyVersion: data.keyVersion || 1,
      algorithm: "AES-GCM-256",
      // Encrypted fields
      encryptedCategory: data.encryptedCategory,
      categoryIv: data.categoryIv,
      encryptedAmount: data.encryptedAmount,
      amountIv: data.amountIv,
      encryptedDescription: data.encryptedDescription || null,
      descriptionIv: data.descriptionIv || null,
      // Plaintext fields
      date: data.date,
      isRecurring,
      recurringFrequency: isRecurring
        ? (data.frequency as ExpenseFrequency)
        : null,
      nextDueDate,
      issueId: data.issueId || null,
    })
    .returning();

  revalidatePath("/dashboard/settings/expenses");
  revalidatePath("/dashboard");

  return expense;
}

/**
 * Add expense without encryption (legacy support)
 * Use addExpense for new encrypted data
 */
export async function addExpensePlaintext(
  userId: string,
  data: {
    category: string;
    amount: number;
    frequency: ExpenseFrequency;
    description?: string;
    date: Date;
    issueId?: string;
  }
) {
  const isRecurring = data.frequency !== "one_time";
  const nextDueDate = isRecurring
    ? calculateNextDueDate(data.date, data.frequency)
    : null;

  const [expense] = await db
    .insert(userExpenses)
    .values({
      userId,
      isEncrypted: false,
      category: data.category,
      amount: data.amount.toString(),
      date: data.date,
      description: data.description,
      isRecurring,
      recurringFrequency: isRecurring ? data.frequency : null,
      nextDueDate,
      issueId: data.issueId || null,
    })
    .returning();

  revalidatePath("/dashboard/settings/expenses");
  revalidatePath("/dashboard");

  return expense;
}
