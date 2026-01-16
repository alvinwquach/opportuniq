"use client";

import { useEncryptedFinancials, type DecryptedIncomeStream } from "@/hooks/useEncryptedFinancials";

const ANNUAL_HOURS = 2080;

interface IncomeSummaryProps {
  streams: DecryptedIncomeStream[];
}

export function IncomeSummary({ streams }: IncomeSummaryProps) {
  const { calculateMonthlyIncome } = useEncryptedFinancials();

  // Don't show if no streams
  if (streams.length === 0) {
    return null;
  }

  // calculateMonthlyIncome filters for active streams and applies
  // frequency multipliers (weekly × 4.33, monthly × 1, annual ÷ 12, etc.)
  const monthlyIncome = calculateMonthlyIncome(streams);
  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / ANNUAL_HOURS;

  return (
    <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f] mb-6">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
            Monthly
          </p>
          <p className="text-xl font-semibold text-white">
            ${monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
            Annual
          </p>
          <p className="text-xl font-semibold text-white">
            ${annualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
            Hourly Rate
          </p>
          <p className="text-xl font-semibold text-[#5eead4]">
            ${hourlyRate.toFixed(2)}/hr
          </p>
        </div>
      </div>
      <p className="text-[11px] text-[#555] mt-4">
        A 4-hour DIY project costs you ${(hourlyRate * 4).toFixed(0)} in time.
        If hiring costs less, it might be worth it.
      </p>
    </div>
  );
}
