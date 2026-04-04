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
import { IoDownloadOutline } from "react-icons/io5";

interface BudgetCategory {
  category: string;
  amount: number;
  color: string;
}

interface SavingsData {
  month: string;
  savings: number;
  diy: number;
}

interface SpendingTabProps {
  budgetCategories: BudgetCategory[];
  savingsOverTime: SavingsData[];
}

export function SpendingTab({ budgetCategories, savingsOverTime }: SpendingTabProps) {
  return (
    <>
      {/* Spending by Category Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Spending by Category</h3>
          <button className="p-1 text-gray-500 hover:text-gray-900 transition-colors">
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
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#111827" }}
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

      {/* Savings Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Savings Over Time</h3>
          <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px]">
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
              Total
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600" />
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
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
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
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#111827" }}
                formatter={(value: number) => [`$${value}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#2563EB"
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
    </>
  );
}
