"use client";

import {
  IoCheckmarkCircle,
  IoPlayCircleOutline,
  IoBookmark,
  IoSparkles,
  IoWalletOutline,
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
} from "recharts";
import { guideSavingsData } from "./data";
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
      {/* Your Progress — merged with Completion Rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Your Progress</h3>

        {/* Donut chart row (only when there's something started) */}
        {started > 0 && (
          <div className="flex items-center gap-3 mb-3">
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
                <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-gray-500">Done</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-[10px] text-gray-500">Active</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">{inProgressCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Completed / In Progress / Saved counts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Completed</span>
            </div>
            <span className="text-sm font-bold text-blue-600">{completedCount}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <IoPlayCircleOutline className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">In Progress</span>
            </div>
            <span className="text-sm font-bold text-blue-600">{inProgressCount}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2">
              <IoBookmark className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-gray-500">Saved</span>
            </div>
            <span className="text-sm font-bold text-amber-600">{savedCount}</span>
          </div>
        </div>
      </div>

      {/* DIY Savings */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoWalletOutline className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">DIY Savings</h3>
          </div>
          <span className="text-xs font-bold text-blue-600">${totalSaved}</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 9 }}
                axisLine={{ stroke: "#e5e7eb" }}
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

      {/* Popular Topics */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoStarOutline className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-medium text-gray-900">Popular Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Plumbing", "HVAC", "Electrical", "Appliances", "Garage"].map((cat) => (
            <span
              key={cat}
              className="px-2 py-1 text-[10px] bg-gray-50 text-gray-500 rounded-lg border border-gray-200 hover:border-blue-200 hover:text-blue-600 cursor-pointer transition-colors"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Custom Guides CTA */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <IoSparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Custom Guides</h3>
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Can&apos;t find what you need? Describe your issue and we&apos;ll create a personalized guide for you.
        </p>
        <button className="mt-2 w-full px-3 py-2 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
          Create Custom Guide
        </button>
      </div>
    </div>
  );
}
