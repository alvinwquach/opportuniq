"use client";

import { IoTrendingUp } from "react-icons/io5";
import type { TimeSavedCardProps } from "./types";

export function TimeSavedCard({ timeSaved }: TimeSavedCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <IoTrendingUp className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-semibold text-emerald-400">Time Saved</h3>
      </div>
      <p className="text-2xl font-bold text-emerald-300 mb-1">{timeSaved}</p>
      <p className="text-xs text-emerald-400/70">By following guides instead of guessing</p>
    </div>
  );
}
