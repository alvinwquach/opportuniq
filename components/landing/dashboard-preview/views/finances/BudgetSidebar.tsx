"use client";

import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

interface BudgetSidebarProps {
  monthlyBudget: number;
  totalSpent: number;
  remaining: number;
  spendingByCategory: { category: string; amount: number }[];
}

export function BudgetSidebar({
  monthlyBudget,
  totalSpent,
  remaining,
  spendingByCategory,
}: BudgetSidebarProps) {
  const percentUsed = Math.round((totalSpent / monthlyBudget) * 100);
  const isOverBudget = remaining < 0;

  return (
    <div className="space-y-4">
      {/* Budget Status */}
      <div className={`rounded-xl border p-4 ${
        isOverBudget
          ? "bg-red-50 border-red-200"
          : "bg-gradient-to-br from-blue-50 to-white border-blue-200"
      }`}>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Budget Status</h3>
        <div className="text-center mb-3">
          <p className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-blue-600"}`}>
            {percentUsed}%
          </p>
          <p className="text-[10px] text-gray-500">of ${monthlyBudget} used</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOverBudget ? "bg-red-500" : percentUsed > 80 ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Remaining</span>
            <span className={`font-medium ${isOverBudget ? "text-red-600" : "text-blue-600"}`}>
              ${Math.abs(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Spending */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Top Spending</h3>
        <div className="space-y-2">
          {spendingByCategory.slice(0, 4).map((cat, index) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-4">{index + 1}.</span>
                <span className="text-xs text-gray-500">{cat.category}</span>
              </div>
              <span className="text-xs font-medium text-gray-900">${cat.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Budget Tips</h3>
        <div className="space-y-2">
          {percentUsed < 50 && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Great pace! You&apos;re on track to stay under budget.
                </p>
              </div>
            </div>
          )}
          {percentUsed >= 50 && percentUsed < 80 && (
            <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2">
                <IoTrendingUpOutline className="w-4 h-4 text-gray-500 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Halfway through your budget. Review upcoming expenses.
                </p>
              </div>
            </div>
          )}
          {percentUsed >= 80 && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <IoAlertCircleOutline className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Approaching budget limit. Consider deferring non-urgent expenses.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
