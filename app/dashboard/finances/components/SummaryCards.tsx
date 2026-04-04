"use client";

import {
  IoTrendingUp,
  IoWallet,
  IoShieldCheckmark,
  IoConstruct,
} from "react-icons/io5";

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
  emergencyFundPercent,
}: SummaryCardsProps) {
  const budgetUsedPercent = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const cards = [
    {
      label: "Monthly Income",
      value: `$${monthlyIncome.toLocaleString()}`,
      icon: IoTrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Budget Used",
      value: `$${totalSpent.toLocaleString()}`,
      subtext: `${budgetUsedPercent.toFixed(0)}% of $${monthlyBudget.toLocaleString()}`,
      icon: IoWallet,
      color: budgetUsedPercent > 80 ? "text-amber-400" : "text-green-600",
      bgColor: budgetUsedPercent > 80 ? "bg-amber-500/10" : "bg-green-50",
    },
    {
      label: "Emergency Fund",
      value: `${emergencyFundPercent}%`,
      subtext: "of 6-month target",
      icon: IoShieldCheckmark,
      color: emergencyFundPercent >= 50 ? "text-green-600" : "text-amber-400",
      bgColor: emergencyFundPercent >= 50 ? "bg-green-50" : "bg-amber-500/10",
    },
    {
      label: "DIY Savings",
      value: `$${diySaved.toLocaleString()}`,
      subtext: "this year",
      icon: IoConstruct,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">{card.label}</span>
            <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
          <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
          {card.subtext && (
            <div className="text-xs text-gray-500 mt-1">{card.subtext}</div>
          )}
        </div>
      ))}
    </div>
  );
}
