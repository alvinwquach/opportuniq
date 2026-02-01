"use client";

import {
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
  Line,
} from "recharts";
import { IoDownloadOutline, IoWalletOutline } from "react-icons/io5";
import type { AdaptedDashboardData } from "../types";

interface SpendingTabProps {
  data: AdaptedDashboardData;
}

export function SpendingTab({ data }: SpendingTabProps) {
  const { budgetCategories, savingsOverTime, financials } = data;

  // Show empty state if no spending data
  const hasSpendingData = budgetCategories.length > 0 || savingsOverTime.length > 0;

  if (!hasSpendingData) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 text-center">
        <IoWalletOutline className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
        <h3 className="text-sm font-medium text-white mb-1">No Spending Data Yet</h3>
        <p className="text-xs text-[#888]">
          Start tracking expenses to see your spending breakdown and savings over time.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Spending by Category Chart */}
      {budgetCategories.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-white">
              Spending by Category
            </h3>
            <button className="p-1 text-[#666] hover:text-white transition-colors">
              <IoDownloadOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="h-32 sm:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetCategories}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9, fill: "#888" }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#888" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 6,
                    border: "1px solid #2a2a2a",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`$${value}`]}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={20}>
                  {budgetCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Savings Over Time Chart */}
      {savingsOverTime.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-white">
              Savings Over Time
            </h3>
            <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px]">
              <span className="flex items-center gap-1 text-[#888]">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                Total
              </span>
              <span className="flex items-center gap-1 text-[#888]">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600" />
                DIY
              </span>
            </div>
          </div>
          <div className="h-32 sm:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={savingsOverTime}
                margin={{ top: 5, right: 5, bottom: 15, left: 30 }}
              >
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3ECF8E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3ECF8E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: "#888" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#888" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 6,
                    border: "1px solid #2a2a2a",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`$${value}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#3ECF8E"
                  strokeWidth={2}
                  fill="url(#savingsGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="diy"
                  stroke="#249361"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Summary Card */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-medium text-white mb-3">
          Monthly Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a]">
            <p className="text-[10px] text-[#888] mb-1">Income</p>
            <p className="text-sm sm:text-base font-semibold text-white">
              ${financials.monthlyIncome.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a]">
            <p className="text-[10px] text-[#888] mb-1">Spent</p>
            <p className="text-sm sm:text-base font-semibold text-white">
              ${financials.totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a]">
            <p className="text-[10px] text-[#888] mb-1">Budget</p>
            <p className="text-sm sm:text-base font-semibold text-white">
              ${financials.totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] text-emerald-400 mb-1">Remaining</p>
            <p className="text-sm sm:text-base font-semibold text-emerald-400">
              ${financials.remaining.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
