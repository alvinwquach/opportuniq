"use client";

import { IoWallet, IoTrendingDown, IoWarning, IoAdd } from "react-icons/io5";
import { IncomeSetupDialog } from "./IncomeSetupDialog";

interface BudgetGlanceCardProps {
  financials: {
    monthlyIncome: number;
    totalSpent: number;
    remaining: number;
    hourlyRate: number;
  } | null;
  pendingDecisionsCount?: number;
  userId?: string;
}

export function BudgetGlanceCard({ financials, pendingDecisionsCount = 0, userId }: BudgetGlanceCardProps) {
  if (!financials || financials.monthlyIncome === 0) {
    return userId ? (
      <IncomeSetupDialog userId={userId} variant="budget" />
    ) : null;
  }

  const { monthlyIncome, totalSpent, remaining, hourlyRate } = financials;
  const percentUsed = monthlyIncome > 0 ? (totalSpent / monthlyIncome) * 100 : 0;
  const isOverBudget = remaining < 0;
  const isLowBudget = remaining > 0 && percentUsed > 75;

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-wider text-[#9a9a9a]">This Month</p>
        {isOverBudget && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10">
            <IoWarning className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-red-400">Over budget</span>
          </div>
        )}
        {isLowBudget && !isOverBudget && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10">
            <IoTrendingDown className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-amber-400">{Math.round(percentUsed)}% used</span>
          </div>
        )}
      </div>

      {/* Available Amount - Hero Display */}
      <div className="flex items-baseline gap-2 mb-1">
        <p className="text-[10px] text-[#9a9a9a]">Available</p>
        <p className={`text-2xl font-semibold ${
          isOverBudget ? "text-red-400" : isLowBudget ? "text-amber-400" : "text-emerald-400"
        }`}>
          ${Math.abs(remaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          {isOverBudget && <span className="text-sm ml-1">over</span>}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${
            isOverBudget ? "bg-red-500" : isLowBudget ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>

      {/* Sub-stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[#9a9a9a]">Emergency buffer</p>
          <p className="text-white font-medium">
            ${(monthlyIncome * 0.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[#9a9a9a]">
            {pendingDecisionsCount > 0 ? "Pending decisions" : "Your time value"}
          </p>
          <p className="text-white font-medium">
            {pendingDecisionsCount > 0
              ? `${pendingDecisionsCount} awaiting`
              : `$${hourlyRate.toFixed(0)}/hr`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
