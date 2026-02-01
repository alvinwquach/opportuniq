"use client";

import { IoReceiptOutline, IoArrowForward } from "react-icons/io5";
import type { Expense } from "../types";
import { categoryColors } from "../types";

interface RecentExpensesProps {
  expenses: Expense[];
  onViewAll?: () => void;
}

export function RecentExpenses({ expenses, onViewAll }: RecentExpensesProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoReceiptOutline className="w-4 h-4 text-[#888]" />
          <h3 className="text-sm font-semibold text-white">Recent Expenses</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All
            <IoArrowForward className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[#666]">No recent expenses</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.slice(0, 5).map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg hover:bg-[#151515] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: categoryColors[expense.category] ?? "#94a3b8" }}
                />
                <div>
                  <div className="text-sm font-medium text-white">
                    {expense.description ?? expense.category}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#666]">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                    {expense.isRecurring && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">Recurring</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-white">
                -${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
