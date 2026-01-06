"use server";

import { db } from "@/app/db/client";
import { userExpenses } from "@/app/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ExpenseFrequency } from "./schemas";

// Re-export for convenience
export type { ExpenseFrequency } from "./schemas";

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
 * Calculate the next due date based on frequency
 */
function calculateNextDueDate(
  currentDate: Date,
  frequency: ExpenseFrequency
): Date | null {
  if (frequency === "one_time") return null;

  const next = new Date(currentDate);

  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "bi_weekly":
      next.setDate(next.getDate() + 14);
      break;
    case "semi_monthly":
      // If before 15th, next is 15th; otherwise next month 1st
      if (next.getDate() < 15) {
        next.setDate(15);
      } else {
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
      }
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "annual":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

/**
 * Get all expenses for a user with financial summaries
 */
export async function getExpenseData(userId: string) {
  const expenses = await db
    .select()
    .from(userExpenses)
    .where(eq(userExpenses.userId, userId))
    .orderBy(desc(userExpenses.date));

  // Calculate monthly expenses (only recurring)
  let monthlyExpenses = 0;
  for (const expense of expenses) {
    if (!expense.isRecurring) continue;
    const multiplier =
      FREQUENCY_TO_MONTHLY[expense.recurringFrequency || "monthly"] || 0;
    monthlyExpenses += Number(expense.amount) * multiplier;
  }

  // Get current month expenses (all expenses in current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
  });

  const currentMonthTotal = currentMonthExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  // Group by category for spending breakdown
  const spendingByCategory: Record<string, number> = {};
  for (const expense of currentMonthExpenses) {
    const category = expense.category;
    spendingByCategory[category] =
      (spendingByCategory[category] || 0) + Number(expense.amount);
  }

  return {
    expenses,
    financials: {
      monthlyRecurring: monthlyExpenses,
      annualRecurring: monthlyExpenses * 12,
      currentMonthTotal,
      spendingByCategory,
    },
  };
}

/**
 * Add a new expense
 */
export async function addExpense(
  userId: string,
  data: {
    category: string;
    amount: number;
    frequency: ExpenseFrequency;
    description?: string;
    date: Date;
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
      category: data.category,
      amount: data.amount.toString(),
      date: data.date,
      description: data.description,
      isRecurring,
      recurringFrequency: isRecurring ? data.frequency : null,
      nextDueDate,
    })
    .returning();

  revalidatePath("/dashboard/settings/expenses");
  revalidatePath("/dashboard");

  return expense;
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  expenseId: string,
  userId: string,
  data: {
    category?: string;
    amount?: number;
    frequency?: ExpenseFrequency;
    description?: string;
    date?: Date;
  }
) {
  // Build update object
  const updateData: Record<string, unknown> = {};

  if (data.category !== undefined) {
    updateData.category = data.category;
  }
  if (data.amount !== undefined) {
    updateData.amount = data.amount.toString();
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.date !== undefined) {
    updateData.date = data.date;
  }
  if (data.frequency !== undefined) {
    const isRecurring = data.frequency !== "one_time";
    updateData.isRecurring = isRecurring;
    updateData.recurringFrequency = isRecurring ? data.frequency : null;

    // Recalculate next due date if frequency changed
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

/**
 * Delete an expense
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

/**
 * Get expenses for a specific month
 */
export async function getExpensesForMonth(
  userId: string,
  year: number,
  month: number
) {
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

  return expenses;
}
