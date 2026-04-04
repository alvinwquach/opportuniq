"use client";

import { BudgetDonut } from "../charts";

interface BudgetChartSectionProps {
  financials: {
    totalSpent: number;
    remaining: number;
    monthlyIncome: number;
    annualIncome?: number;
    budgetUsedPercent?: number;
    totalBudget?: number;
    hourlyRate?: number;
  };
}

export function BudgetChartSection({ financials }: BudgetChartSectionProps) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Budget</h3>
      <div className="flex items-center justify-center">
        <BudgetDonut
          spent={financials.totalSpent}
          remaining={financials.remaining}
          total={financials.monthlyIncome}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Spent</p>
          <p className="text-sm font-medium text-white">
            ${financials.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Remaining</p>
          <p
            className={`text-sm font-medium ${
              financials.remaining < 0 ? "text-red-400" : "text-blue-600"
            }`}
          >
            ${Math.abs(financials.remaining).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
            {financials.remaining < 0 && " over"}
          </p>
        </div>
      </div>
    </div>
  );
}
