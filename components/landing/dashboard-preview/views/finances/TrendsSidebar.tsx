"use client";

import {
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoStatsChartOutline,
  IoSparkles,
} from "react-icons/io5";

interface TrendsSidebarProps {
  monthlyIncome: number;
  totalSpent: number;
  diySaved: number;
}

export function TrendsSidebar({
  monthlyIncome,
  totalSpent,
  diySaved,
}: TrendsSidebarProps) {
  const savingsRate = ((monthlyIncome - totalSpent) / monthlyIncome * 100).toFixed(1);
  const netCashFlow = monthlyIncome - totalSpent;

  return (
    <div className="space-y-4">
      {/* Cash Flow Summary */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
        <h3 className="text-sm font-medium text-white mb-3">Net Cash Flow</h3>
        <div className="text-center mb-3">
          <p className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#666]">This month</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-emerald-500/20 text-center">
            <IoTrendingUpOutline className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-emerald-400">${monthlyIncome.toLocaleString()}</p>
            <p className="text-[9px] text-[#666]">Income</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-[#2a2a2a] text-center">
            <IoTrendingDownOutline className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-amber-400">${totalSpent.toLocaleString()}</p>
            <p className="text-[9px] text-[#666]">Spent</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Key Metrics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#888]">Savings Rate</span>
            <span className="text-sm font-semibold text-emerald-400">{savingsRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(parseFloat(savingsRate), 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
            <span className="text-xs text-[#888]">DIY Savings</span>
            <span className="text-sm font-semibold text-emerald-400">${diySaved.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Trends Insight */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoStatsChartOutline className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-white">6-Month Trend</h3>
        </div>
        <div className="space-y-2">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-[10px] text-emerald-400 font-medium">Expenses Down 12%</p>
            <p className="text-[10px] text-[#888] mt-0.5">
              Compared to 6-month average
            </p>
          </div>
          <div className="p-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg">
            <p className="text-[10px] text-white font-medium">Income Stable</p>
            <p className="text-[10px] text-[#888] mt-0.5">
              +2% from last month
            </p>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-start gap-2">
          <IoSparkles className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-white">AI Insight</p>
            <p className="text-[10px] text-[#888] mt-1 leading-relaxed">
              At your current savings rate, you could build a 6-month emergency fund in ~8 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
