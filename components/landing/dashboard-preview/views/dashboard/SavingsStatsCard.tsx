"use client";

import { IoTrendingUp, IoCheckmarkCircle } from "react-icons/io5";

interface SavingsStats {
  totalSavings: number;
  successfulDiyCount: number;
}

interface SavingsStatsCardProps {
  savings: SavingsStats;
}

export function SavingsStatsCard({ savings }: SavingsStatsCardProps) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <IoTrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium text-green-600 uppercase tracking-wide">Total Saved</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-2xl sm:text-3xl font-bold text-green-600">
          ${savings.totalSavings.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
        <IoCheckmarkCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
        <span>{savings.successfulDiyCount} DIY projects</span>
      </div>
    </div>
  );
}
