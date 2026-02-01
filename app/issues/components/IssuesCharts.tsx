"use client";

import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { MonthlySavingsPoint, CategoryCount, IssueResolutionStats } from "@/lib/graphql/types";

interface IssuesChartsProps {
  savingsOverTime: MonthlySavingsPoint[];
  categoryDistribution: CategoryCount[];
  resolutionBreakdown: IssueResolutionStats;
}

export function IssuesCharts({
  savingsOverTime,
  categoryDistribution,
  resolutionBreakdown,
}: IssuesChartsProps) {
  const resolutionData = [
    { name: "DIY", value: resolutionBreakdown.diy, color: "#3ECF8E" },
    { name: "Professional", value: resolutionBreakdown.pro, color: "#8b5cf6" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* Savings Over Time */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-1">Savings Over Time</h3>
        <p className="text-xs text-[#666] mb-3">Cumulative savings from DIY repairs</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsOverTime}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666", fontSize: 10 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#888" }}
                formatter={(value: number) => [`$${value.toFixed(0)}`, "Saved"]}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#3ECF8E"
                strokeWidth={2}
                fill="url(#savingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Issues by Category */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-1">By Category</h3>
        <p className="text-xs text-[#666] mb-3">Issue distribution</p>
        <div className="flex items-center gap-4">
          <div className="h-32 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {categoryDistribution.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[#888]">{cat.name}</span>
                </div>
                <span className="text-white font-medium">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resolution Breakdown */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-1">How Issues Were Resolved</h3>
        <p className="text-xs text-[#666] mb-3">DIY vs Professional</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resolutionData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888", fontSize: 11 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [value, "Issues"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {resolutionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2a2a2a]">
          <span className="text-xs text-[#666]">DIY Success Rate</span>
          <span className="text-sm font-semibold text-emerald-400">
            {resolutionBreakdown.diySuccessRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
