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
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">This Month</h3>
        <div className="text-center mb-3">
          <p className="text-2xl font-bold text-amber-600">
            ${totalSpent.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Total Spent</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
            <p className="text-sm font-bold text-gray-900">${monthlyExpenses}</p>
            <p className="text-[9px] text-gray-500">Recurring</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
            <p className="text-sm font-bold text-gray-900">${oneTimeThisMonth}</p>
            <p className="text-[9px] text-gray-500">One-time</p>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Top Categories</h3>
        <div className="space-y-2">
          {spendingByCategory.slice(0, 4).map((cat) => (
            <div key={cat.category} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: categoryColors[cat.category] || "#6b7280" }}
              />
              <span className="text-xs text-gray-500 flex-1">{cat.category}</span>
              <span className="text-xs font-medium text-gray-900">
                ${cat.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {upcomingUrgent > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <IoAlertCircleOutline className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-600">Upcoming</p>
              <p className="text-[10px] text-gray-500 mt-1">
                {upcomingUrgent} expense{upcomingUrgent !== 1 ? "s" : ""} marked as urgent
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Overview</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Recurring</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{recurringCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoTrendingDownOutline className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{expenses.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <button
          onClick={onAddExpense}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
        >
          <IoAddCircleOutline className="w-4 h-4" />
          Log Expense
        </button>
      </div>
    </div>
  );
}
