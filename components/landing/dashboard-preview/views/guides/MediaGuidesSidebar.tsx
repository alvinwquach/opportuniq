"use client";

import {
  IoVideocamOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import type { MixedGuide } from "../../mockData";

interface MediaGuidesSidebarProps {
  guides: MixedGuide[];
  mediaType: "videos" | "articles";
}

export function MediaGuidesSidebar({ guides, mediaType }: MediaGuidesSidebarProps) {
  const isVideos = mediaType === "videos";
  const Icon = isVideos ? IoVideocamOutline : IoDocumentTextOutline;
  const label = isVideos ? "Videos" : "Articles";
  const color = isVideos ? "text-blue-400" : "text-purple-400";
  const bgColor = isVideos ? "bg-blue-500/10" : "bg-purple-500/10";
  const borderColor = isVideos ? "border-blue-500/20" : "border-purple-500/20";

  // Calculate stats
  const completedCount = guides.filter(g => g.progress === 100).length;
  const inProgressCount = guides.filter(g => g.progress && g.progress > 0 && g.progress < 100).length;

  // Calculate total duration
  const totalMinutes = guides.reduce((sum, guide) => {
    const match = guide.duration?.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  // Group by source
  const bySource = guides.reduce((acc, guide) => {
    const src = guide.source || "Unknown";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSources = Object.entries(bySource)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Media Summary */}
      <div className={`bg-gradient-to-br ${bgColor} to-[#1a1a1a] rounded-xl border ${borderColor} p-4`}>
        <h3 className="text-sm font-medium text-white mb-3">{label} Library</h3>
        <div className="text-center mb-3">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${bgColor} mb-2`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <p className={`text-2xl font-bold ${color}`}>{guides.length}</p>
          <p className="text-[10px] text-[#666]">Total {label}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-[#2a2a2a] text-center">
            <p className="text-sm font-bold text-emerald-400">{completedCount}</p>
            <p className="text-[9px] text-[#666]">Completed</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-[#2a2a2a] text-center">
            <p className="text-sm font-bold text-amber-400">{inProgressCount}</p>
            <p className="text-[9px] text-[#666]">In Progress</p>
          </div>
        </div>
      </div>

      {/* Duration Stats */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoTimeOutline className="w-4 h-4 text-[#888]" />
          <h3 className="text-sm font-medium text-white">
            {isVideos ? "Watch Time" : "Read Time"}
          </h3>
        </div>
        <div className="text-center">
          <p className={`text-xl font-bold ${color}`}>
            {totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins} min`}
          </p>
          <p className="text-[10px] text-[#666] mt-1">
            Total {isVideos ? "video" : "reading"} content
          </p>
        </div>
      </div>

      {/* By Source */}
      {topSources.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoStatsChartOutline className="w-4 h-4 text-[#888]" />
            <h3 className="text-sm font-medium text-white">By Source</h3>
          </div>
          <div className="space-y-2">
            {topSources.map(([source, count]) => (
              <div
                key={source}
                className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
              >
                <span className="text-xs text-[#888]">{source}</span>
                <span className={`text-xs font-medium ${color}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <p className="text-xs font-medium text-white mb-1">
          {isVideos ? "Visual Learner?" : "Prefer Reading?"}
        </p>
        <p className="text-[10px] text-[#888] leading-relaxed">
          {isVideos
            ? "Videos are great for seeing techniques in action. Watch at 1.5x speed to save time."
            : "Articles let you go at your own pace. Bookmark sections you want to revisit."}
        </p>
      </div>
    </div>
  );
}
