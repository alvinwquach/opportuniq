"use client";

import { IoWallet, IoAlertCircle, IoCheckmarkCircle, IoWarning } from "react-icons/io5";

interface AvailableFundsCardProps {
  availableFunds: number;
  monthlyIncome: number;
  totalSpent: number;
  pendingUrgent: number;
}

export function AvailableFundsCard({
  availableFunds,
  monthlyIncome,
  totalSpent,
  pendingUrgent
}: AvailableFundsCardProps) {
  const isHealthy = availableFunds > 1000;
  const isWarning = availableFunds > 0 && availableFunds <= 1000;
  const isCritical = availableFunds <= 0;

  return (
    <div className={`rounded-xl border p-5 ${
      isCritical ? 'bg-red-500/10 border-red-500/20' :
      isWarning ? 'bg-amber-500/10 border-amber-500/20' :
      'bg-emerald-500/10 border-emerald-500/20'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <IoWallet className={`w-5 h-5 ${
              isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
            }`} />
            <h3 className="text-sm font-medium text-white">Available for Home Expenses</h3>
          </div>
          <p className="text-xs text-[#888]">What you can spend on repairs right now</p>
        </div>
        {isCritical && <IoAlertCircle className="w-6 h-6 text-red-400" />}
        {isWarning && <IoWarning className="w-6 h-6 text-amber-400" />}
        {isHealthy && <IoCheckmarkCircle className="w-6 h-6 text-emerald-400" />}
      </div>

      <div className="mb-4">
        <p className={`text-4xl font-bold ${
          isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          ${Math.max(0, Math.round(availableFunds)).toLocaleString()}
        </p>
        {isCritical && (
          <p className="text-xs text-red-400 mt-1">You're over budget - consider deferring non-urgent repairs</p>
        )}
        {isWarning && (
          <p className="text-xs text-amber-400 mt-1">Running low - prioritize critical repairs only</p>
        )}
        {isHealthy && (
          <p className="text-xs text-emerald-400 mt-1">You're in good shape for home expenses</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2a2a2a]">
        <div>
          <p className="text-[10px] text-[#666] mb-0.5">Monthly Income</p>
          <p className="text-sm font-semibold text-white">${Math.round(monthlyIncome).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#666] mb-0.5">Spent This Month</p>
          <p className="text-sm font-semibold text-white">${Math.round(totalSpent).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#666] mb-0.5">Pending Urgent</p>
          <p className={`text-sm font-semibold ${pendingUrgent > 0 ? 'text-amber-400' : 'text-white'}`}>
            ${Math.round(pendingUrgent).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
