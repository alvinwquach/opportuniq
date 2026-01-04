"use client";

import Link from "next/link";

interface PersonalBudget {
  category: string;
  monthlyLimit: number;
  spent: number;
  percentUsed: number;
  isOverBudget: boolean;
}

interface PersonalBudgetsSectionProps {
  budgets: PersonalBudget[];
}

export function PersonalBudgetsSection({ budgets }: PersonalBudgetsSectionProps) {
  if (budgets.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Budget Limits</h3>
        <Link
          href="/dashboard/settings"
          className="text-[10px] text-[#9a9a9a] hover:text-white transition-colors"
        >
          Edit
        </Link>
      </div>
      <div className="space-y-3">
        {budgets.map((budget) => (
          <div key={budget.category}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#a3a3a3]">{budget.category}</span>
              <span className={budget.isOverBudget ? "text-red-400" : "text-[#9a9a9a]"}>
                ${budget.spent.toLocaleString()} / ${budget.monthlyLimit.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budget.isOverBudget
                    ? "bg-red-500"
                    : budget.percentUsed > 80
                    ? "bg-amber-500"
                    : "bg-[#00D4FF]"
                }`}
                style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
