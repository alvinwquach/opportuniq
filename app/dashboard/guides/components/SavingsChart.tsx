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
import type { SavingsChartProps } from "../types";
import { tooltipStyles } from "../types";

export function SavingsChart({ data }: SavingsChartProps) {
  // Calculate total saved
  const totalSaved = data.reduce((sum, item) => sum + item.saved, 0);

  if (data.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <IoWalletOutline className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Money Saved by DIY</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <p className="text-xs text-[#666]">Complete guides to see savings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoWalletOutline className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Money Saved by DIY</h3>
        </div>
        <span className="text-xs font-bold text-emerald-400">${totalSaved} saved</span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#888", fontSize: 10 }}
              axisLine={{ stroke: "#2a2a2a" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 10 }}
              axisLine={{ stroke: "#2a2a2a" }}
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
          <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
          <span className="text-[#888]">DIY Cost</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px]">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500 border-dashed" />
          <span className="text-[#888]">Pro Cost</span>
        </div>
      </div>
    </div>
  );
}
