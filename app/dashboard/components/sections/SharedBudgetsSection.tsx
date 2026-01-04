"use client";

import Link from "next/link";
import { IoWallet } from "react-icons/io5";

interface GroupExpense {
  id: string;
  category: string;
  amount: number;
  isEmergency: boolean;
}

interface GroupFinance {
  groupId: string;
  groupName: string;
  sharedBalance: number;
  monthlyBudget: number | null;
  monthlySpent: number;
  emergencyBuffer: number | null;
  recentExpenses: GroupExpense[];
}

interface SharedBudgetsSectionProps {
  groupFinances: GroupFinance[];
}

export function SharedBudgetsSection({ groupFinances }: SharedBudgetsSectionProps) {
  if (groupFinances.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Shared Budgets</h2>
        <Link
          href="/groups"
          className="text-xs text-[#9a9a9a] hover:text-white transition-colors"
        >
          Manage
        </Link>
      </div>
      <div className="space-y-3">
        {groupFinances.map((gf) => (
          <div
            key={gf.groupId}
            className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <IoWallet className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium text-white">{gf.groupName}</span>
              </div>
              <span className="text-lg font-semibold text-green-400">
                ${gf.sharedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Budget Progress */}
            {gf.monthlyBudget && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-[#9a9a9a] mb-1">
                  <span>Monthly Budget</span>
                  <span>
                    ${gf.monthlySpent.toLocaleString()} / ${gf.monthlyBudget.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      gf.monthlySpent > gf.monthlyBudget ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (gf.monthlySpent / gf.monthlyBudget) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Recent Expenses */}
            {gf.recentExpenses.length > 0 && (
              <div className="space-y-1.5">
                {gf.recentExpenses.slice(0, 2).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {expense.isEmergency && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                      <span className="text-[#a3a3a3]">{expense.category}</span>
                    </div>
                    <span className="text-white">-${expense.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Emergency Buffer */}
            {gf.emergencyBuffer && gf.emergencyBuffer > 0 && (
              <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-xs">
                <span className="text-[#9a9a9a]">Emergency Fund</span>
                <span className="text-amber-400">${gf.emergencyBuffer.toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
