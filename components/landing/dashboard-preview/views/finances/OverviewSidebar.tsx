"use client";

import {
  IoTrendingUpOutline,
  IoWalletOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoChevronForward,
} from "react-icons/io5";

interface OverviewSidebarProps {
  monthlyIncome: number;
  totalSpent: number;
  remaining: number;
  diySaved: number;
}

export function OverviewSidebar({
  monthlyIncome,
  totalSpent,
  remaining,
  diySaved,
}: OverviewSidebarProps) {
  const savingsRate = ((monthlyIncome - totalSpent) / monthlyIncome * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Financial Health Score */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
        <h3 className="text-sm font-medium text-white mb-3">Financial Health</h3>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#3ECF8E"
                strokeWidth="6"
                strokeDasharray={`${85 * 2.2} 220`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-emerald-400">85</span>
            </div>
          </div>
          <p className="text-xs text-[#888]">Excellent</p>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#888]">Savings Rate</span>
            <span className="font-medium text-emerald-400">{savingsRate}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#888]">DIY Savings</span>
            <span className="font-medium text-emerald-400">${diySaved.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">This Month</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoTrendingUpOutline className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#888]">Income</span>
            </div>
            <span className="text-sm font-semibold text-emerald-400">
              ${monthlyIncome.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoWalletOutline className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[#888]">Spent</span>
            </div>
            <span className="text-sm font-semibold text-amber-400">
              ${totalSpent.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#888]">Remaining</span>
            </div>
            <span className="text-sm font-semibold text-white">
              ${remaining.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Smart Tips</h3>
        <div className="space-y-2">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-[10px] text-emerald-400 font-medium">Great savings rate!</p>
            <p className="text-[10px] text-[#888] mt-0.5">
              You&apos;re saving {savingsRate}% of your income this month.
            </p>
          </div>
          <div className="p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <p className="text-[10px] text-white font-medium">DIY Opportunity</p>
            <p className="text-[10px] text-[#888] mt-0.5">
              3 upcoming repairs could save $200+ with DIY.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
