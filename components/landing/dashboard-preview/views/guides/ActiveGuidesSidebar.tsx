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
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">In Progress</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
            <p className="text-xl font-bold text-blue-600">{inProgressGuides.length}</p>
            <p className="text-[9px] text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
            <p className="text-xl font-bold text-blue-600">{avgProgress}%</p>
            <p className="text-[9px] text-gray-500">Avg Progress</p>
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      {inProgressGuides.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoTrendingUpOutline className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Progress Distribution</h3>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressBuckets}>
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#6b7280", fontSize: 9 }}
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
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoTrophyOutline className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-medium text-gray-900">Almost Done!</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-medium text-gray-900 truncate">{closestToComplete.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${closestToComplete.progress}%` }}
                />
              </div>
              <span className="text-xs text-amber-600 font-bold">
                {closestToComplete.progress}%
              </span>
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
              <IoPlayCircleOutline className="w-4 h-4" />
              Continue Now
            </button>
          </div>
        </div>
      )}

      {/* Time Estimate */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoCalendarOutline className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">Time to Complete All</h3>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xl font-bold text-gray-900">
            {totalTimeRemaining > 60
              ? `${Math.floor(totalTimeRemaining / 60)}h ${totalTimeRemaining % 60}m`
              : `${totalTimeRemaining} min`}
          </p>
          <p className="text-[9px] text-gray-500 mt-1">Estimated remaining time</p>
        </div>
      </div>

      {/* Quick Resume */}
      {inProgressGuides.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoFlashOutline className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">Quick Resume</h3>
          </div>
          <div className="space-y-2">
            {inProgressGuides.slice(0, 3).map((guide) => (
              <button
                key={guide.id}
                className="w-full flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-left"
              >
                <IoPlayCircleOutline className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 truncate">{guide.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${guide.progress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-500">{guide.progress}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <IoCheckmarkCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-600">Pro Tip</p>
            <p className="text-[10px] text-gray-500 mt-1">
              Complete one guide at a time to build momentum and retain skills better.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
