"use client";

import { IoTrashOutline, IoRefresh } from "react-icons/io5";
import type { Expense, SpendingCategory } from "../types";
import { categoryColors, frequencyLabels } from "../types";

interface ExpensesTabProps {
  expenses: Expense[];
  monthlyExpenses: number;
  oneTimeThisMonth: number;
  spendingByCategory: SpendingCategory[];
  onDelete?: (id: string) => void;
}

export function ExpensesTab({
  expenses,
  monthlyExpenses,
  oneTimeThisMonth,
  spendingByCategory,
  onDelete,
}: ExpensesTabProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const totalThisMonth = monthlyExpenses + oneTimeThisMonth;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total This Month</p>
          <p className="text-xl font-bold text-white">
            ${totalThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Recurring</p>
          <p className="text-xl font-bold text-blue-600">
            ${monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">One-Time</p>
          <p className="text-xl font-bold text-amber-400">
            ${oneTimeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">By Category</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {spendingByCategory.map((cat) => (
            <div
              key={cat.category}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs text-gray-500">{cat.category}</span>
              </div>
              <p className="text-sm font-semibold text-white">
                ${cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-gray-100 rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-white">All Expenses</h3>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No expenses recorded</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-1 h-10 rounded-full"
                    style={{ backgroundColor: categoryColors[expense.category] ?? "#94a3b8" }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {expense.description ?? expense.category}
                      </span>
                      {expense.isRecurring && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded">
                          <IoRefresh className="w-2.5 h-2.5" />
                          {expense.frequency && frequencyLabels[expense.frequency]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {expense.category} • {formatDate(expense.date)}
                      {expense.issueTitle && ` • ${expense.issueTitle}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-white">
                    -${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
