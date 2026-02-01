"use client";

import {
  IoPlayCircleOutline,
  IoTimeOutline,
  IoTrophyOutline,
  IoFlashOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import type { MixedGuide } from "../../mockData";

interface ActiveGuidesSidebarProps {
  inProgressGuides: MixedGuide[];
}

export function ActiveGuidesSidebar({ inProgressGuides }: ActiveGuidesSidebarProps) {
  // Calculate average progress
  const avgProgress = inProgressGuides.length > 0
    ? Math.round(inProgressGuides.reduce((sum, g) => sum + (g.progress || 0), 0) / inProgressGuides.length)
    : 0;

  // Find closest to completion
  const closestToComplete = inProgressGuides
    .filter(g => g.progress && g.progress > 0)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];

  // Progress distribution data
  const progressBuckets = [
    { range: "0-25%", count: inProgressGuides.filter(g => (g.progress || 0) <= 25).length, color: "#ef4444" },
    { range: "26-50%", count: inProgressGuides.filter(g => (g.progress || 0) > 25 && (g.progress || 0) <= 50).length, color: "#f59e0b" },
    { range: "51-75%", count: inProgressGuides.filter(g => (g.progress || 0) > 50 && (g.progress || 0) <= 75).length, color: "#84cc16" },
    { range: "76-99%", count: inProgressGuides.filter(g => (g.progress || 0) > 75 && (g.progress || 0) < 100).length, color: "#10b981" },
  ];

  // Estimate time to complete all
  const totalTimeRemaining = inProgressGuides.reduce((sum, g) => {
    const match = g.timeEstimate?.match(/(\d+)/);
    const totalMins = match ? parseInt(match[1]) : 0;
    const remainingPercent = 100 - (g.progress || 0);
    return sum + Math.round(totalMins * remainingPercent / 100);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Active Summary */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
        <h3 className="text-sm font-medium text-white mb-3">In Progress</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-emerald-500/20 text-center">
            <p className="text-xl font-bold text-emerald-400">{inProgressGuides.length}</p>
            <p className="text-[9px] text-[#666]">Active</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-emerald-500/20 text-center">
            <p className="text-xl font-bold text-emerald-400">{avgProgress}%</p>
            <p className="text-[9px] text-[#666]">Avg Progress</p>
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      {inProgressGuides.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoTrendingUpOutline className="w-4 h-4 text-[#888]" />
            <h3 className="text-sm font-medium text-white">Progress Distribution</h3>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressBuckets}>
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#888", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {progressBuckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Closest to Complete */}
      {closestToComplete && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoTrophyOutline className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-white">Almost Done!</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-xs font-medium text-white truncate">{closestToComplete.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${closestToComplete.progress}%` }}
                />
              </div>
              <span className="text-xs text-amber-400 font-bold">
                {closestToComplete.progress}%
              </span>
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors">
              <IoPlayCircleOutline className="w-4 h-4" />
              Continue Now
            </button>
          </div>
        </div>
      )}

      {/* Time Estimate */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoCalendarOutline className="w-4 h-4 text-[#888]" />
          <h3 className="text-sm font-medium text-white">Time to Complete All</h3>
        </div>
        <div className="text-center p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
          <p className="text-xl font-bold text-white">
            {totalTimeRemaining > 60
              ? `${Math.floor(totalTimeRemaining / 60)}h ${totalTimeRemaining % 60}m`
              : `${totalTimeRemaining} min`}
          </p>
          <p className="text-[9px] text-[#666] mt-1">Estimated remaining time</p>
        </div>
      </div>

      {/* Quick Resume */}
      {inProgressGuides.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoFlashOutline className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">Quick Resume</h3>
          </div>
          <div className="space-y-2">
            {inProgressGuides.slice(0, 3).map((guide) => (
              <button
                key={guide.id}
                className="w-full flex items-center gap-2 p-2.5 bg-[#0f0f0f] hover:bg-[#151515] rounded-lg border border-[#2a2a2a] transition-colors text-left"
              >
                <IoPlayCircleOutline className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{guide.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${guide.progress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-[#666]">{guide.progress}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-emerald-400">Pro Tip</p>
            <p className="text-[10px] text-[#888] mt-1">
              Complete one guide at a time to build momentum and retain skills better.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
