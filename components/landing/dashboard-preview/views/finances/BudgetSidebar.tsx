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
          ? "bg-red-500/10 border-red-500/20"
          : "bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] border-emerald-500/20"
      }`}>
        <h3 className="text-sm font-medium text-white mb-3">Budget Status</h3>
        <div className="text-center mb-3">
          <p className={`text-2xl font-bold ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}>
            {percentUsed}%
          </p>
          <p className="text-[10px] text-[#666]">of ${monthlyBudget} used</p>
        </div>
        <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOverBudget ? "bg-red-500" : percentUsed > 80 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#888]">Remaining</span>
            <span className={`font-medium ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}>
              ${Math.abs(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Spending */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Top Spending</h3>
        <div className="space-y-2">
          {spendingByCategory.slice(0, 4).map((cat, index) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#666] w-4">{index + 1}.</span>
                <span className="text-xs text-[#888]">{cat.category}</span>
              </div>
              <span className="text-xs font-medium text-white">${cat.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Budget Tips</h3>
        <div className="space-y-2">
          {percentUsed < 50 && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                <p className="text-[10px] text-[#888]">
                  Great pace! You&apos;re on track to stay under budget.
                </p>
              </div>
            </div>
          )}
          {percentUsed >= 50 && percentUsed < 80 && (
            <div className="p-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg">
              <div className="flex items-start gap-2">
                <IoTrendingUpOutline className="w-4 h-4 text-[#888] mt-0.5" />
                <p className="text-[10px] text-[#888]">
                  Halfway through your budget. Review upcoming expenses.
                </p>
              </div>
            </div>
          )}
          {percentUsed >= 80 && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <IoAlertCircleOutline className="w-4 h-4 text-amber-400 mt-0.5" />
                <p className="text-[10px] text-[#888]">
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
