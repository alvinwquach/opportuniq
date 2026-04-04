"use client";

import {
  IoCheckmarkCircle,
  IoTrendingUp,
  IoStarOutline,
  IoRepeat,
  IoWalletOutline,
  IoTimeOutline,
  IoRibbonOutline,
  IoFlame,
} from "react-icons/io5";
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { MixedGuide } from "../../mockData";
import { guideSavingsData } from "./data";

interface CompletedGuidesSidebarProps {
  completedGuides: MixedGuide[];
  totalSaved: number;
  timeSaved: string;
}

export function CompletedGuidesSidebar({
  completedGuides,
  totalSaved,
  timeSaved,
}: CompletedGuidesSidebarProps) {
  // Group by category
  const byCategory = completedGuides.reduce((acc, guide) => {
    const cat = guide.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value], index) => ({
      name,
      value,
      color: ["#10b981", "#249361", "#059669", "#047857", "#065f46"][index],
    }));

  // Calculate completion streak (mock)
  const streak = 5;

  return (
    <div className="space-y-4">
      {/* Achievement Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoRibbonOutline className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Achievements</h3>
        </div>
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-2">
            <IoCheckmarkCircle className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{completedGuides.length}</p>
          <p className="text-[10px] text-gray-500">Guides Completed</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2.5 border border-blue-200 text-center">
            <p className="text-sm font-bold text-blue-600">${totalSaved}</p>
            <p className="text-[9px] text-gray-500">Money Saved</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-blue-200 text-center">
            <p className="text-sm font-bold text-blue-600">{timeSaved}</p>
            <p className="text-[9px] text-gray-500">Time Saved</p>
          </div>
        </div>
      </div>

      {/* Savings Over Time */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoWalletOutline className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Savings Trend</h3>
        </div>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={guideSavingsData}>
              <defs>
                <linearGradient id="completedSavingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Area
                type="monotone"
                dataKey="saved"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#completedSavingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills by Category */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoStarOutline className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-medium text-gray-900">Skills Mastered</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={30}
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {categoryData.slice(0, 3).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-[10px] text-gray-500">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoTrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-900">Learning Streak</span>
          </div>
          <span className="text-xl font-bold text-amber-600 flex items-center gap-1">{streak} <IoFlame className="w-5 h-5 inline text-amber-500" /></span>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">
          {streak} guides completed this month. Keep it up!
        </p>
      </div>

      {/* Recent Completions */}
      {completedGuides.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoTimeOutline className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Recently Completed</h3>
          </div>
          <div className="space-y-2">
            {completedGuides.slice(0, 3).map((guide) => (
              <div
                key={guide.id}
                className="p-2.5 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{guide.title}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{guide.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revisit Tip */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-2">
          <IoRepeat className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gray-900">Refresh Your Skills</p>
            <p className="text-[10px] text-gray-500 mt-1">
              Revisit completed guides periodically to stay sharp.
            </p>
            <button className="mt-2 px-3 py-1.5 text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
              Review a Random Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
