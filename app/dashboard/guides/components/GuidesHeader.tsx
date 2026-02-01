"use client";

import type { GuidesHeaderProps } from "../types";

export function GuidesHeader({ sourcesCount, guidesCount, timeSaved }: GuidesHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Guides</h2>
          <p className="text-emerald-200">Step-by-step DIY instructions from trusted sources</p>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-emerald-100 mb-0.5">Sources</p>
            <p className="text-2xl font-bold">{sourcesCount}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-emerald-100 mb-0.5">Guides Available</p>
            <p className="text-2xl font-bold">{guidesCount}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-emerald-100 mb-0.5">Time Saved</p>
            <p className="text-2xl font-bold">{timeSaved}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
