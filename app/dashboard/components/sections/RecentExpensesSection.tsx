"use client";

import Link from "next/link";

interface PersonalExpense {
  id: string;
  description: string | null;
  category: string;
  amount: number;
  date: Date | string;
}

interface RecentExpensesSectionProps {
  expenses: PersonalExpense[];
}

export function RecentExpensesSection({ expenses }: RecentExpensesSectionProps) {
  if (expenses.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Recent Expenses</h3>
        <Link
          href="/dashboard/settings"
          className="text-[10px] text-[#9a9a9a] hover:text-white transition-colors"
        >
          Add
        </Link>
      </div>
      <div className="space-y-2">
        {expenses.slice(0, 5).map((expense) => (
          <div key={expense.id} className="flex items-center justify-between text-xs">
            <div className="flex-1 min-w-0">
              <p className="text-white truncate">
                {expense.description || expense.category}
              </p>
              <p className="text-[10px] text-[#9a9a9a]">
                {expense.category} ·{" "}
                {new Date(expense.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="text-[#a3a3a3] ml-2">-${expense.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
