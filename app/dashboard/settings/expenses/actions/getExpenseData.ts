"use server";

/**
 * GET EXPENSE DATA
 *
 * Fetches all expenses for a user with financial summaries.
 * Returns encrypted data - client will decrypt.
 */

import { db } from "@/app/db/client";
import { userExpenses } from "@/app/db/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import type { ExpenseResponse } from "./types";
import { FREQUENCY_TO_MONTHLY } from "./types";

/**
 * Get all expenses for a user with financial summaries
 *
 * PSEUDOCODE:
 * 1. Query all expenses for the user, ordered by date
 * 2. Return encrypted data - client will decrypt
 * 3. Calculate financials only for unencrypted legacy rows
 *    (encrypted amounts must be calculated client-side after decryption)
 */
export async function getExpenseData(userId: string): Promise<{
  expenses: ExpenseResponse[];
  financials: {
    monthlyRecurring: number;
    annualRecurring: number;
    currentMonthTotal: number;
    hasEncryptedData: boolean;
  };
}> {
  const expenses = await db
    .select()
    .from(userExpenses)
    .where(eq(userExpenses.userId, userId))
    .orderBy(desc(userExpenses.date));

  // Calculate monthly expenses (only for unencrypted legacy rows)
  let monthlyRecurring = 0;
  let hasEncryptedData = false;

  for (const expense of expenses) {
    if (expense.isEncrypted) {
      hasEncryptedData = true;
      continue; // Skip - client must calculate after decryption
    }
    if (!expense.isRecurring) continue;
    const multiplier =
      FREQUENCY_TO_MONTHLY[expense.recurringFrequency || "monthly"] || 0;
    monthlyRecurring += Number(expense.amount) * multiplier;
  }

  // Get current month total (unencrypted only)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  let currentMonthTotal = 0;
  for (const expense of expenses) {
    if (expense.isEncrypted) continue;
    const expenseDate = new Date(expense.date);
    if (expenseDate >= startOfMonth && expenseDate <= endOfMonth) {
      currentMonthTotal += Number(expense.amount);
    }
  }

  return {
    expenses: expenses as ExpenseResponse[],
    financials: {
      monthlyRecurring,
      annualRecurring: monthlyRecurring * 12,
      currentMonthTotal,
      hasEncryptedData,
    },
  };
}

/**
 * Get expenses for a specific month
 */
export async function getExpensesForMonth(
  userId: string,
  year: number,
  month: number
): Promise<ExpenseResponse[]> {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const expenses = await db
    .select()
    .from(userExpenses)
    .where(
      and(
        eq(userExpenses.userId, userId),
        gte(userExpenses.date, startOfMonth),
        lte(userExpenses.date, endOfMonth)
      )
    )
    .orderBy(desc(userExpenses.date));

  return expenses as ExpenseResponse[];
}
