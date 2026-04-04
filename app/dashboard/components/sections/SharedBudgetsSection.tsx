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
          href="/dashboard/groups"
          className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
        >
          Manage
        </Link>
      </div>
      <div className="space-y-3">
        {groupFinances.map((groupFinance) => (
          <div
            key={groupFinance.groupId}
            className="p-4 rounded-xl bg-gray-50 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <IoWallet className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium text-white">{groupFinance.groupName}</span>
              </div>
              <span className="text-lg font-semibold text-green-400">
                ${groupFinance.sharedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            {groupFinance.monthlyBudget && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span>Monthly Budget</span>
                  <span>
                    ${groupFinance.monthlySpent.toLocaleString()} / ${groupFinance.monthlyBudget.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      groupFinance.monthlySpent > groupFinance.monthlyBudget ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (groupFinance.monthlySpent / groupFinance.monthlyBudget) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {groupFinance.recentExpenses.length > 0 && (
              <div className="space-y-1.5">
                {groupFinance.recentExpenses.slice(0, 2).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {expense.isEmergency && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                      <span className="text-[#a3a3a3]">{expense.category}</span>
                    </div>
                    <span className="text-gray-900">-${expense.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            {groupFinance.emergencyBuffer && groupFinance.emergencyBuffer > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                <span className="text-gray-400">Emergency Fund</span>
                <span className="text-amber-400">${groupFinance.emergencyBuffer.toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
