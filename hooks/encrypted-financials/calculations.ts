/**
 * Financial calculation utilities.
 * Used after decryption to calculate totals client-side.
 */

import type { DecryptedIncomeStream, DecryptedExpense } from "./types";

// Multipliers to convert any frequency to monthly equivalent
const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

/**
 * Calculate total monthly income from active income streams.
 * Converts each stream's amount to monthly using frequency multiplier.
 */
export function calculateMonthlyIncome(streams: DecryptedIncomeStream[]): number {
  return streams
    .filter((s) => s.isActive)
    .reduce((total, stream) => {
      const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
      return total + stream.amount * multiplier;
    }, 0);
}

/**
 * Calculate total monthly recurring expenses.
 * Only includes recurring expenses (not one-time).
 */
export function calculateMonthlyExpenses(expenses: DecryptedExpense[]): number {
  return expenses
    .filter((e) => e.isRecurring)
    .reduce((total, expense) => {
      const multiplier = FREQUENCY_TO_MONTHLY[expense.recurringFrequency || "monthly"] || 0;
      return total + expense.amount * multiplier;
    }, 0);
}

/**
 * Calculate current month's total spending.
 * Includes all expenses (recurring + one-time) in current month.
 */
export function calculateCurrentMonthTotal(expenses: DecryptedExpense[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    })
    .reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Group current month spending by category.
 * Returns object with category names as keys and totals as values.
 */
export function calculateSpendingByCategory(
  expenses: DecryptedExpense[]
): Record<string, number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const byCategory: Record<string, number> = {};

  for (const expense of expenses) {
    const expenseDate = new Date(expense.date);
    if (expenseDate >= startOfMonth && expenseDate <= endOfMonth) {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
    }
  }

  return byCategory;
}
