"use client";

import type { GuidesHeaderProps } from "./types";

export function GuidesHeader({ sourcesCount, guidesCount, timeSaved }: GuidesHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-gray-900 mb-3 sm:mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">Guides</h2>
          <p className="text-xs sm:text-base text-blue-200">Step-by-step DIY instructions from trusted sources</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1.5 sm:py-2">
            <p className="text-[10px] sm:text-xs text-blue-100 mb-0.5">Sources</p>
            <p className="text-lg sm:text-2xl font-bold">{sourcesCount}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1.5 sm:py-2">
            <p className="text-[10px] sm:text-xs text-blue-100 mb-0.5">Guides</p>
            <p className="text-lg sm:text-2xl font-bold">{guidesCount}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1.5 sm:py-2">
            <p className="text-[10px] sm:text-xs text-blue-100 mb-0.5">Time Saved</p>
            <p className="text-lg sm:text-2xl font-bold">{timeSaved}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
