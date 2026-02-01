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
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Recent Expenses</h3>
        <button onClick={onViewAll} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
          View All
        </button>
      </div>
      <div className="space-y-2">
        {expenses.slice(0, 5).map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#333] transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">{expense.description}</p>
                {expense.isRecurring && <IoRepeat className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" title="Recurring" />}
                {expense.urgency && expense.urgency !== 'normal' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getUrgencyColor(expense.urgency)}`}>
                    {getUrgencyLabel(expense.urgency)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#666] mt-0.5">
                {expense.category} · {expense.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                {expense.issueTitle && <span className="text-emerald-400"> · {expense.issueTitle}</span>}
              </p>
            </div>
            <span className="text-sm font-semibold text-white ml-3">${expense.amount.toFixed(2)}</span>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="text-xs text-[#555] text-center py-6">No expenses recorded yet</p>
        )}
      </div>
    </div>
  );
}
