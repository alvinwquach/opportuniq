"use client";

import {
  IoCheckmarkCircle,
  IoPlayCircleOutline,
  IoBookmark,
  IoTrendingUp,
  IoSparkles,
  IoWalletOutline,
  IoSchoolOutline,
  IoStarOutline,
} from "react-icons/io5";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { guideSavingsData, difficultyData } from "./data";
import { tooltipStyles } from "./types";

interface AllGuidesSidebarProps {
  completedCount: number;
  inProgressCount: number;
  savedCount: number;
  timeSaved: string;
}

export function AllGuidesSidebar({
  completedCount,
  inProgressCount,
  savedCount,
  timeSaved,
}: AllGuidesSidebarProps) {
  const started = completedCount + inProgressCount;
  const completionRate = started > 0 ? Math.round((completedCount / started) * 100) : 0;
  const totalSaved = guideSavingsData.reduce((sum, item) => sum + item.saved, 0);

  const progressData = [
    { name: "Completed", value: completedCount, color: "#10b981" },
    { name: "In Progress", value: inProgressCount, color: "#249361" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Your Progress</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 rounded-lg">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#888]">Completed</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">{completedCount}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 rounded-lg">
            <div className="flex items-center gap-2">
              <IoPlayCircleOutline className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#888]">In Progress</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">{inProgressCount}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-amber-500/10 rounded-lg">
            <div className="flex items-center gap-2">
              <IoBookmark className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[#888]">Saved</span>
            </div>
            <span className="text-sm font-bold text-amber-400">{savedCount}</span>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      {started > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-sm font-medium text-white mb-3">Completion Rate</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{completionRate}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-[#888]">Done</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-[10px] text-[#888]">Active</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{inProgressCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Money Saved Chart */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoWalletOutline className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">DIY Savings</h3>
          </div>
          <span className="text-xs font-bold text-emerald-400">${totalSaved}</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={guideSavingsData}>
              <defs>
                <linearGradient id="savingsGradientSidebar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#888", fontSize: 9 }}
                axisLine={{ stroke: "#2a2a2a" }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                wrapperStyle={tooltipStyles.wrapperStyle}
                contentStyle={tooltipStyles.contentStyle}
                itemStyle={tooltipStyles.itemStyle}
                labelStyle={tooltipStyles.labelStyle}
                formatter={(value: number) => [`$${value}`, "Saved"]}
              />
              <Area
                type="monotone"
                dataKey="saved"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#savingsGradientSidebar)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoSchoolOutline className="w-4 h-4 text-[#888]" />
          <h3 className="text-sm font-medium text-white">By Difficulty</h3>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={difficultyData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="level"
                tick={{ fill: "#888", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                wrapperStyle={tooltipStyles.wrapperStyle}
                contentStyle={tooltipStyles.contentStyle}
                itemStyle={tooltipStyles.itemStyle}
                formatter={(value: number) => [value, "Guides"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Saved */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <IoTrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-emerald-400">Time Saved</h3>
        </div>
        <p className="text-xl font-bold text-emerald-300">{timeSaved}</p>
        <p className="text-[10px] text-[#666] mt-1">By following guides instead of guessing</p>
      </div>

      {/* Popular Categories */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoStarOutline className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-white">Popular Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Plumbing", "HVAC", "Electrical", "Appliances", "Garage"].map((cat) => (
            <span
              key={cat}
              className="px-2 py-1 text-[10px] bg-[#0f0f0f] text-[#888] rounded-lg border border-[#2a2a2a] hover:border-emerald-500/30 hover:text-emerald-400 cursor-pointer transition-colors"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Custom Guide */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-2">
          <IoSparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-white">Custom Guides</h3>
        </div>
        <p className="text-[10px] text-[#888] leading-relaxed">
          Can&apos;t find what you need? Describe your issue and we&apos;ll create a personalized guide for you.
        </p>
        <button className="mt-2 w-full px-3 py-2 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors">
          Create Custom Guide
        </button>
      </div>
    </div>
  );
}
