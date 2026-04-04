"use client";

import { IoWallet } from "react-icons/io5";

interface SavingsStatsSectionProps {
  savings: {
    totalSavings: number;
    successfulDiyCount: number;
  };
}

export function SavingsStatsSection({ savings }: SavingsStatsSectionProps) {
  if (savings.successfulDiyCount <= 0) return null;

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-[#00D4FF]/5 to-transparent border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <IoWallet className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Total Saved</p>
          <p className="text-xl font-semibold text-white">
            ${savings.totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        From {savings.successfulDiyCount} successful DIY{" "}
        {savings.successfulDiyCount === 1 ? "project" : "projects"}
      </p>
    </div>
  );
}
