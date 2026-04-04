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
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Net Cash Flow</h3>
        <div className="text-center mb-3">
          <p className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500">This month</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2.5 border border-blue-200 text-center">
            <IoTrendingUpOutline className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-blue-600">${monthlyIncome.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500">Income</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 text-center">
            <IoTrendingDownOutline className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-amber-600">${totalSpent.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500">Spent</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Key Metrics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Savings Rate</span>
            <span className="text-sm font-semibold text-blue-600">{savingsRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min(parseFloat(savingsRate), 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">DIY Savings</span>
            <span className="text-sm font-semibold text-blue-600">${diySaved.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Trends Insight */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoStatsChartOutline className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">6-Month Trend</h3>
        </div>
        <div className="space-y-2">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-[10px] text-blue-600 font-medium">Expenses Down 12%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Compared to 6-month average
            </p>
          </div>
          <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
            <p className="text-[10px] text-gray-900 font-medium">Income Stable</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              +2% from last month
            </p>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-2">
          <IoSparkles className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gray-900">AI Insight</p>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              At your current savings rate, you could build a 6-month emergency fund in ~8 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
