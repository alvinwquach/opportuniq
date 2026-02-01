"use client";

import {
  IoCheckmarkCircle,
  IoTrendingUp,
  IoStarOutline,
  IoRepeat,
  IoWalletOutline,
  IoTimeOutline,
  IoRibbonOutline,
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
      <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoRibbonOutline className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-white">Achievements</h3>
        </div>
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-2">
            <IoCheckmarkCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{completedGuides.length}</p>
          <p className="text-[10px] text-[#666]">Guides Completed</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-emerald-500/20 text-center">
            <p className="text-sm font-bold text-emerald-400">${totalSaved}</p>
            <p className="text-[9px] text-[#666]">Money Saved</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-emerald-500/20 text-center">
            <p className="text-sm font-bold text-emerald-400">{timeSaved}</p>
            <p className="text-[9px] text-[#666]">Time Saved</p>
          </div>
        </div>
      </div>

      {/* Savings Over Time */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoWalletOutline className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-white">Savings Trend</h3>
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
                tick={{ fill: "#888", fontSize: 9 }}
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
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoStarOutline className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-white">Skills Mastered</h3>
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
                    <span className="text-[10px] text-[#888]">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoTrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Learning Streak</span>
          </div>
          <span className="text-xl font-bold text-amber-400">{streak} 🔥</span>
        </div>
        <p className="text-[10px] text-[#888] mt-2">
          {streak} guides completed this month. Keep it up!
        </p>
      </div>

      {/* Recent Completions */}
      {completedGuides.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoTimeOutline className="w-4 h-4 text-[#888]" />
            <h3 className="text-sm font-medium text-white">Recently Completed</h3>
          </div>
          <div className="space-y-2">
            {completedGuides.slice(0, 3).map((guide) => (
              <div
                key={guide.id}
                className="p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
              >
                <div className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{guide.title}</p>
                    <p className="text-[9px] text-[#666] mt-0.5">{guide.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revisit Tip */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-start gap-2">
          <IoRepeat className="w-4 h-4 text-[#888] mt-0.5" />
          <div>
            <p className="text-xs font-medium text-white">Refresh Your Skills</p>
            <p className="text-[10px] text-[#888] mt-1">
              Revisit completed guides periodically to stay sharp.
            </p>
            <button className="mt-2 px-3 py-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors">
              Review a Random Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
