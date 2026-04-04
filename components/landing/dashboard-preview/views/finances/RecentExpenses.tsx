"use client";

import { IoRepeat } from "react-icons/io5";
import { Expense } from "./types";
import { getUrgencyColor, getUrgencyLabel } from "./utils";

interface RecentExpensesProps {
  expenses: Expense[];
  onViewAll: () => void;
}

export function RecentExpenses({ expenses, onViewAll }: RecentExpensesProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Recent Expenses</h3>
        <button onClick={onViewAll} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      <div className="space-y-2">
        {expenses.slice(0, 5).map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                {expense.isRecurring && <IoRepeat className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" title="Recurring" />}
                {expense.urgency && expense.urgency !== 'normal' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getUrgencyColor(expense.urgency)}`}>
                    {getUrgencyLabel(expense.urgency)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {expense.category} · {expense.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                {expense.issueTitle && <span className="text-blue-600"> · {expense.issueTitle}</span>}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-900 ml-3">${expense.amount.toFixed(2)}</span>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-6">No expenses recorded yet</p>
        )}
      </div>
    </div>
  );
}
