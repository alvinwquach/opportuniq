import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getIncomeData } from "./actions";
import { IncomeManager } from "./IncomeManager";

export default async function IncomePage() {
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { incomeStreams, financials } = await getIncomeData(user.id);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white mb-1">Income</h1>
          <p className="text-sm text-[#666]">
            Track your income to calculate your hourly rate and make better DIY vs hire decisions.
          </p>
        </div>

        {/* Summary */}
        {incomeStreams.length > 0 && (
          <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f] mb-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                  Monthly
                </p>
                <p className="text-xl font-semibold text-white">
                  ${financials.monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                  Annual
                </p>
                <p className="text-xl font-semibold text-white">
                  ${financials.annualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                  Hourly Rate
                </p>
                <p className="text-xl font-semibold text-[#5eead4]">
                  ${financials.hourlyRate.toFixed(2)}/hr
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#555] mt-4">
              A 4-hour DIY project costs you ${(financials.hourlyRate * 4).toFixed(0)} in time.
              If hiring costs less, it might be worth it.
            </p>
          </div>
        )}

        <IncomeManager userId={user.id} initialStreams={incomeStreams} />
      </div>
    </div>
  );
}
