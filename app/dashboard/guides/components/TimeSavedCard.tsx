"use client";

import { IoTrendingUp } from "react-icons/io5";
import type { TimeSavedCardProps } from "../types";

export function TimeSavedCard({ timeSaved }: TimeSavedCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-green-500/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <IoTrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="text-sm font-semibold text-green-600">Time Saved</h3>
      </div>
      <p className="text-2xl font-bold text-green-500 mb-1">{timeSaved}</p>
      <p className="text-xs text-green-600/70">By following guides instead of guessing</p>
    </div>
  );
}
