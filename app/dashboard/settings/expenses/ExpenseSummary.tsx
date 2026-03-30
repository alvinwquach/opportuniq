"use client";

import { useMemo } from "react";
import { useEncryptedFinancials, type DecryptedExpense } from "@/hooks/useEncryptedFinancials";

interface ExpenseSummaryProps {
  expenses: DecryptedExpense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const { calculateMonthlyExpenses } = useEncryptedFinancials();

  // We need to calculate two things from the decrypted expenses:
  //   1. Total spending for the current month (all expenses in this month)
  //   2. Breakdown of spending by category (to show which categories cost most)
  //
  // Why client-side? Because amounts are encrypted - the server only stores
  // ciphertext and cannot perform calculations on encrypted values.
  // ─────────────────────────────────────────────────────────────────────────────

  const { currentMonthTotal, spendingByCategory } = useMemo(() => {
    // Step 1: Define the current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Step 2: Initialize accumulators
    let total = 0;
    const byCategory: Record<string, number> = {};

    // Step 3: Loop through each decrypted expense
    for (const expense of expenses) {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= startOfMonth && expenseDate <= endOfMonth) {
        total += expense.amount;
        byCategory[expense.category] =
          (byCategory[expense.category] || 0) + expense.amount;
      }
    }

    return { currentMonthTotal: total, spendingByCategory: byCategory };
  }, [expenses]);

  // Don't show if no expenses
  if (expenses.length === 0) return null;

  const monthlyRecurring = calculateMonthlyExpenses(expenses);
  const annualRecurring = monthlyRecurring * 12;

  return (
    <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f] mb-6">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
            This Month
          </p>
          <p className="text-xl font-semibold text-[#f87171]">
            ${currentMonthTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
            Monthly Recurring
          </p>
          <p className="text-xl font-semibold text-white">
            ${monthlyRecurring.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
            Annual Recurring
          </p>
          <p className="text-xl font-semibold text-white">
            ${annualRecurring.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
      {Object.keys(spendingByCategory).length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-3">
            This Month by Category
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(spendingByCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, amount]) => (
                <span
                  key={category}
                  className="px-2 py-1 rounded-md bg-[#1f1f1f] text-xs"
                >
                  <span className="text-[#888]">{category}</span>
                  <span className="text-[#f87171] ml-1">
                    ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
