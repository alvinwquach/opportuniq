"use client";

import { IoArrowUp, IoArrowDown, IoTrendingUp, IoShieldCheckmark } from "react-icons/io5";

interface SummaryCardsProps {
  monthlyIncome: number;
  monthlyBudget: number;
  remaining: number;
  totalSpent: number;
  diySaved: number;
  emergencyFundPercent: number;
}

export function SummaryCards({
  monthlyIncome,
  monthlyBudget,
  remaining,
  totalSpent,
  diySaved,
  emergencyFundPercent
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoArrowUp className="w-4 h-4 text-emerald-400" />
          <p className="text-xs text-[#888]">Monthly Income</p>
        </div>
        <p className="text-2xl font-bold text-white">${Math.round(monthlyIncome).toLocaleString()}</p>
        <p className="text-xs text-[#555] mt-1">From all sources</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoArrowDown className="w-4 h-4 text-amber-400" />
          <p className="text-xs text-[#888]">Home Budget</p>
        </div>
        <p className="text-2xl font-bold text-white">${monthlyBudget}</p>
        <p className={`text-xs mt-1 ${remaining < 0 ? 'text-red-400' : remaining < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
          ${Math.abs(Math.round(remaining))} {remaining < 0 ? 'over' : 'remaining'}
        </p>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoTrendingUp className="w-4 h-4 text-emerald-400" />
          <p className="text-xs text-[#888]">DIY Savings</p>
        </div>
        <p className="text-2xl font-bold text-emerald-400">${diySaved.toLocaleString()}</p>
        <p className="text-xs text-[#555] mt-1">All time</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoShieldCheckmark className="w-4 h-4 text-emerald-400" />
          <p className="text-xs text-[#888]">Emergency Fund</p>
        </div>
        <p className="text-2xl font-bold text-white">{emergencyFundPercent}%</p>
        <div className="mt-2 h-1.5 bg-[#333] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, emergencyFundPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
