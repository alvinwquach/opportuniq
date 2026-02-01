"use client";

import { IoCalendarOutline, IoWarning } from "react-icons/io5";
import type { UpcomingExpense } from "../types";

interface UpcomingExpensesProps {
  expenses: UpcomingExpense[];
}

export function UpcomingExpenses({ expenses }: UpcomingExpensesProps) {
  const getUrgencyColor = (urgency?: string | null) => {
    switch (urgency) {
      case "critical":
        return "text-red-400 bg-red-500/10";
      case "important":
        return "text-amber-400 bg-amber-500/10";
      default:
        return "text-[#888] bg-[#333]";
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Upcoming Expenses</h3>
        <IoCalendarOutline className="w-4 h-4 text-[#666]" />
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[#666]">No upcoming expenses</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getUrgencyColor(expense.urgency)}`}>
                  {expense.urgency === "critical" ? (
                    <IoWarning className="w-4 h-4" />
                  ) : (
                    <IoCalendarOutline className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{expense.description}</div>
                  <div className="text-xs text-[#666]">
                    {expense.category} • Due {formatDate(expense.dueDate)}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-white">
                ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
