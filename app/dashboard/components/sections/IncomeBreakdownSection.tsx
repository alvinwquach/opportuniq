"use client";

import Link from "next/link";
import { IncomeBreakdown } from "../charts";

interface IncomeStream {
  id: string;
  source: string;
  amount: string;
  frequency: string;
}

interface IncomeBreakdownSectionProps {
  streams: IncomeStream[];
  monthlyTotal: number;
}

export function IncomeBreakdownSection({
  streams,
  monthlyTotal,
}: IncomeBreakdownSectionProps) {
  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Income</h3>
        <Link
          href="/dashboard/settings/income"
          className="text-[10px] text-[#9a9a9a] hover:text-white transition-colors"
        >
          Edit
        </Link>
      </div>
      <IncomeBreakdown streams={streams} monthlyTotal={monthlyTotal} />
    </div>
  );
}
