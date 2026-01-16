"use client";

import { useEncryptedFinancials, type DecryptedExpense } from "@/hooks/useEncryptedFinancials";

interface ExpenseSummaryProps {
  expenses: DecryptedExpense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const { calculateMonthlyExpenses } = useEncryptedFinancials();

  // Don't show if no expenses
  if (expenses.length === 0) {
    return null;
  }

  // Calculate financials from decrypted data
  const monthlyRecurring = calculateMonthlyExpenses(expenses);
  const annualRecurring = monthlyRecurring * 12;

  // We need to calculate two things from the decrypted expenses:
  //   1. Total spending for the current month (all expenses in this month)
  //   2. Breakdown of spending by category (to show which categories cost most)
  //
  // Why client-side? Because amounts are encrypted - the server only stores
  // ciphertext and cannot perform calculations on encrypted values.
  // ─────────────────────────────────────────────────────────────────────────────

  // Step 1: Define the current month boundaries
  // - startOfMonth: First day of current month at midnight (e.g., Jan 1, 2026 00:00:00)
  // - endOfMonth: Last day of current month (e.g., Jan 31, 2026 23:59:59)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Step 2: Initialize accumulators
  // - currentMonthTotal: Running sum of all expense amounts this month
  // - spendingByCategory: Object mapping category names to their totals
  //   Example: { "Food": 450, "Transportation": 120, "Entertainment": 80 }
  let currentMonthTotal = 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // Why Record<string, number> instead of other options?
  //
  // 1. Plain object `{}` - No type safety. TypeScript treats it as `{}` type,
  //    meaning we'd lose autocomplete and type checking on the values.
  //
  // 2. Map<string, number> - Overkill for this use case. Maps are better when:
  //    - You need non-string keys (objects, functions, etc.)
  //    - You need to preserve insertion order (though modern JS objects do too)
  //    - You need frequent additions/deletions (Maps are optimized for this)
  //    Maps are also harder to use with Object.entries(), can't be spread with
  //    {...map}, and require .get()/.set() instead of bracket notation.
  //
  // 3. Interface with specific keys - Won't work because expense categories are
  //    dynamic (user-defined), not known at compile time. We can't predict what
  //    categories like "Food", "Rent", "Entertainment" will exist.
  //
  // Record<string, number> is the sweet spot:
  // - Type-safe: TypeScript knows all values are numbers
  // - Flexible: Any string key is valid (perfect for dynamic categories)
  // - Familiar: Uses standard object syntax (bracket notation, Object.entries)
  // - Serializable: Works seamlessly with JSON for debugging/logging
  // ─────────────────────────────────────────────────────────────────────────────
  const spendingByCategory: Record<string, number> = {};

  // Step 3: Loop through each decrypted expense
  for (const expense of expenses) {
    // Convert the expense date string to a Date object for comparison
    const expenseDate = new Date(expense.date);

    // Step 4: Check if this expense falls within the current month
    // Only include expenses where: startOfMonth <= expenseDate <= endOfMonth
    if (expenseDate >= startOfMonth && expenseDate <= endOfMonth) {
      // Step 5a: Add to the running total
      currentMonthTotal += expense.amount;

      // Step 5b: Add to the category breakdown
      // If category doesn't exist yet, initialize it to 0, then add the amount
      // This creates entries like: { "Food": 0 + 25 } → { "Food": 25 + 30 } → { "Food": 55 }
      spendingByCategory[expense.category] =
        (spendingByCategory[expense.category] || 0) + expense.amount;
    }
  }

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
