"use client";

import {
  IoAlertCircleOutline,
  IoTrendingDownOutline,
  IoCalendarOutline,
  IoAddCircleOutline,
} from "react-icons/io5";
import { Expense, categoryColors } from "./types";

interface ExpensesSidebarProps {
  expenses: Expense[];
  monthlyExpenses: number;
  oneTimeThisMonth: number;
  spendingByCategory: { category: string; amount: number }[];
  onAddExpense: () => void;
}

export function ExpensesSidebar({
  expenses,
  monthlyExpenses,
  oneTimeThisMonth,
  spendingByCategory,
  onAddExpense,
}: ExpensesSidebarProps) {
  const totalSpent = monthlyExpenses + oneTimeThisMonth;
  const recurringCount = expenses.filter(e => e.isRecurring).length;
  const upcomingUrgent = expenses.filter(
    e => e.urgency === "critical" || e.urgency === "important"
  ).length;

  return (
    <div className="space-y-4">
      {/* Expense Summary */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">This Month</h3>
        <div className="text-center mb-3">
          <p className="text-2xl font-bold text-amber-400">
            ${totalSpent.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#666] mt-1">Total Spent</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-[#2a2a2a]">
            <p className="text-sm font-bold text-white">${monthlyExpenses}</p>
            <p className="text-[9px] text-[#666]">Recurring</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-[#2a2a2a]">
            <p className="text-sm font-bold text-white">${oneTimeThisMonth}</p>
            <p className="text-[9px] text-[#666]">One-time</p>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Top Categories</h3>
        <div className="space-y-2">
          {spendingByCategory.slice(0, 4).map((cat) => (
            <div key={cat.category} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: categoryColors[cat.category] || "#888" }}
              />
              <span className="text-xs text-[#888] flex-1">{cat.category}</span>
              <span className="text-xs font-medium text-white">
                ${cat.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {upcomingUrgent > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <IoAlertCircleOutline className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-400">Upcoming</p>
              <p className="text-[10px] text-[#888] mt-1">
                {upcomingUrgent} expense{upcomingUrgent !== 1 ? "s" : ""} marked as urgent
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Overview</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="w-4 h-4 text-[#888]" />
              <span className="text-xs text-[#888]">Recurring</span>
            </div>
            <span className="text-sm font-semibold text-white">{recurringCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoTrendingDownOutline className="w-4 h-4 text-[#888]" />
              <span className="text-xs text-[#888]">This Month</span>
            </div>
            <span className="text-sm font-semibold text-white">{expenses.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
        <button
          onClick={onAddExpense}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
        >
          <IoAddCircleOutline className="w-4 h-4" />
          Log Expense
        </button>
      </div>
    </div>
  );
}
