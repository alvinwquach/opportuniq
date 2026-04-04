"use client";

import { IoWallet, IoTrendingUp, IoTrendingDown, IoWarning } from "react-icons/io5";

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
  pendingUrgent,
}: AvailableFundsCardProps) {
  const isLow = availableFunds < monthlyIncome * 0.2;

  return (
    <div
      className={`p-6 rounded-xl border ${
        isLow
          ? "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30"
          : "bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/30"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <IoWallet className={`w-5 h-5 ${isLow ? "text-amber-400" : "text-green-600"}`} />
            <h3 className="text-sm font-medium text-gray-500">Available for Repairs & Upgrades</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${isLow ? "text-amber-400" : "text-green-600"}`}>
              ${availableFunds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm text-gray-500">/ month</span>
          </div>
          {isLow && (
            <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-xs">
              <IoWarning className="w-3.5 h-3.5" />
              <span>Running low this month</span>
            </div>
          )}
        </div>

        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <IoTrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span>Income: ${monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <IoTrendingDown className="w-3.5 h-3.5 text-red-400" />
            <span>Spent: ${totalSpent.toLocaleString()}</span>
          </div>
          {pendingUrgent > 0 && (
            <div className="flex items-center justify-end gap-1.5 text-xs text-amber-400">
              <IoWarning className="w-3.5 h-3.5" />
              <span>Pending: ${pendingUrgent.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
