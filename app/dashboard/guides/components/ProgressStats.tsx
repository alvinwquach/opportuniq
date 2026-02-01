"use client";

import {
  IoCheckmarkCircle,
  IoPlayCircleOutline,
  IoBookmark,
} from "react-icons/io5";
import type { ProgressStatsProps } from "../types";

export function ProgressStats({ completedCount, inProgressCount, savedCount }: ProgressStatsProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-white mb-3">Your Progress</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-[#888]">Completed</span>
          </div>
          <span className="text-sm font-bold text-emerald-400">{completedCount}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <IoPlayCircleOutline className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-[#888]">In Progress</span>
          </div>
          <span className="text-sm font-bold text-emerald-400">{inProgressCount}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-amber-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <IoBookmark className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-[#888]">Saved</span>
          </div>
          <span className="text-sm font-bold text-amber-400">{savedCount}</span>
        </div>
      </div>
    </div>
  );
}
