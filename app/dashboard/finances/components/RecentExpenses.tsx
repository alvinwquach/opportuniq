"use client";

import { IoReceiptOutline, IoArrowForward, IoFolderOutline, IoRefresh } from "react-icons/io5";
import type { Expense } from "../types";
import { categoryColors, frequencyLabels } from "../types";

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
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoReceiptOutline className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-white">Recent Expenses</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 transition-colors"
          >
            View All
            <IoArrowForward className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No recent expenses</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.slice(0, 5).map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: categoryColors[expense.category] ?? "#94a3b8" }}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">
                      {expense.description ?? expense.category}
                    </span>
                    {expense.isRecurring && expense.frequency && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded">
                        <IoRefresh className="w-2.5 h-2.5" />
                        {frequencyLabels[expense.frequency]}
                      </span>
                    )}
                    {expense.urgency === "critical" && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-red-500/10 text-red-400 rounded">Urgent</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                    {expense.issueTitle && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <IoFolderOutline className="w-3 h-3" />
                          {expense.issueTitle}
                        </span>
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
