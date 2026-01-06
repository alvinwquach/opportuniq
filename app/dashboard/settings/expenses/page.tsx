import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getExpenseData } from "./actions";
import { ExpenseManager } from "./ExpenseManager";

export default async function ExpensesPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { expenses, financials } = await getExpenseData(user.id);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white mb-1">Expenses</h1>
          <p className="text-sm text-[#666]">
            Track your expenses to understand your spending patterns and stay on
            budget.
          </p>
        </div>
        {expenses.length > 0 && (
          <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f] mb-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                  This Month
                </p>
                <p className="text-xl font-semibold text-[#f87171]">
                  $
                  {financials.currentMonthTotal.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                  Monthly Recurring
                </p>
                <p className="text-xl font-semibold text-white">
                  $
                  {financials.monthlyRecurring.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                  Annual Recurring
                </p>
                <p className="text-xl font-semibold text-white">
                  $
                  {financials.annualRecurring.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
            {Object.keys(financials.spendingByCategory).length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-3">
                  This Month by Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(financials.spendingByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => (
                      <span
                        key={category}
                        className="px-2 py-1 rounded-md bg-[#1f1f1f] text-xs"
                      >
                        <span className="text-[#888]">{category}</span>
                        <span className="text-[#f87171] ml-1">
                          ${amount.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
        <ExpenseManager userId={user.id} initialExpenses={expenses} />
      </div>
    </div>
  );
}
