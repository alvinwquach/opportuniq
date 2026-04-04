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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoArrowUp className="w-4 h-4 text-green-600" />
          <p className="text-xs text-gray-500">Monthly Income</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">${Math.round(monthlyIncome).toLocaleString()}</p>
        <p className="text-xs text-gray-600 mt-1">From all sources</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoArrowDown className="w-4 h-4 text-amber-600" />
          <p className="text-xs text-gray-500">Home Budget</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">${monthlyBudget}</p>
        <p className={`text-xs mt-1 ${remaining < 0 ? 'text-red-400' : remaining < 100 ? 'text-amber-400' : 'text-green-600'}`}>
          ${Math.abs(Math.round(remaining))} {remaining < 0 ? 'over' : 'remaining'}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoTrendingUp className="w-4 h-4 text-green-600" />
          <p className="text-xs text-gray-500">DIY Savings</p>
        </div>
        <p className="text-2xl font-bold text-green-600">${diySaved.toLocaleString()}</p>
        <p className="text-xs text-gray-600 mt-1">All time</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <IoShieldCheckmark className="w-4 h-4 text-green-600" />
          <p className="text-xs text-gray-500">Emergency Fund</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{emergencyFundPercent}%</p>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, emergencyFundPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
