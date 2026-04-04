"use client";

import { IoWalletOutline } from "react-icons/io5";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { guideSavingsData } from "./data";
import { tooltipStyles } from "./types";

export function SavingsChart() {
  // Calculate total saved
  const totalSaved = guideSavingsData.reduce((sum, item) => sum + item.saved, 0);
  const totalWouldCost = guideSavingsData.reduce((sum, item) => sum + item.wouldCost, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoWalletOutline className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-900">Money Saved by DIY</h3>
        </div>
        <span className="text-xs font-bold text-green-600">${totalSaved} saved</span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={guideSavingsData}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              width={35}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              wrapperStyle={tooltipStyles.wrapperStyle}
              contentStyle={tooltipStyles.contentStyle}
              itemStyle={tooltipStyles.itemStyle}
              labelStyle={tooltipStyles.labelStyle}
              formatter={(value: number, name: string) => {
                const label = name === "saved" ? "You Spent (DIY)" : "Would Cost (Pro)";
                return [`$${value}`, label];
              }}
            />
            <Area
              type="monotone"
              dataKey="wouldCost"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#costGradient)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="saved"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#savingsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5 text-[9px]">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-500" />
          <span className="text-gray-500">DIY Cost</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px]">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500 border-dashed" />
          <span className="text-gray-500">Pro Cost</span>
        </div>
      </div>
    </div>
  );
}
