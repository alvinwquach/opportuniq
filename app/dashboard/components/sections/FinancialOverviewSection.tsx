"use client";

import { IoCash, IoTrendingUp, IoFlash, IoTime } from "react-icons/io5";
import { MetricCard } from "../MetricCard";

interface FinancialOverviewSectionProps {
  financials: {
    monthlyIncome: number;
    annualIncome?: number;
    totalSpent: number;
    remaining: number;
    budgetUsedPercent?: number;
    totalBudget?: number;
    hourlyRate: number;
  };
}

export function FinancialOverviewSection({ financials }: FinancialOverviewSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricCard
        label="Monthly Income"
        value={`$${financials.monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        icon={IoCash}
        color="teal"
      />
      <MetricCard
        label="Spent"
        value={`$${financials.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        icon={IoTrendingUp}
        color="purple"
      />
      <MetricCard
        label="Remaining"
        value={`$${Math.max(0, financials.remaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        icon={IoFlash}
        color={financials.remaining < 0 ? "red" : "blue"}
      />
      <MetricCard
        label="Hourly Rate"
        value={`$${financials.hourlyRate.toFixed(2)}`}
        icon={IoTime}
        color="amber"
      />
    </div>
  );
}
