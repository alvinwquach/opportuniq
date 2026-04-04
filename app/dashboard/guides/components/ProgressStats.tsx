"use client";

import {
  IoCheckmarkCircle,
  IoPlayCircleOutline,
  IoBookmark,
} from "react-icons/io5";
import type { ProgressStatsProps } from "../types";

export function ProgressStats({ completedCount, inProgressCount, savedCount }: ProgressStatsProps) {
  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Progress</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <IoCheckmarkCircle className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-gray-500">Completed</span>
          </div>
          <span className="text-sm font-bold text-blue-600">{completedCount}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <IoPlayCircleOutline className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-gray-500">In Progress</span>
          </div>
          <span className="text-sm font-bold text-blue-600">{inProgressCount}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-amber-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <IoBookmark className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-gray-500">Saved</span>
          </div>
          <span className="text-sm font-bold text-amber-400">{savedCount}</span>
        </div>
      </div>
    </div>
  );
}
