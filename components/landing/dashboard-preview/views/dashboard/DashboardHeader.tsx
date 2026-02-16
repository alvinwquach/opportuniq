import { IoCheckmarkCircle } from "react-icons/io5";

interface DashboardHeaderProps {
  userName?: string;
  hourlyRate?: number;
  monthlyIncome?: number;
}

export function DashboardHeader({ hourlyRate = 45, monthlyIncome = 7800 }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-white">Dashboard</h2>
        <p className="text-xs sm:text-sm text-[#888]">
          <span className="text-emerald-400 font-medium">${hourlyRate}/hr</span>
          <span className="mx-1.5 sm:mx-2 text-[#444]">·</span>
          ${monthlyIncome.toLocaleString()}/mo income
        </p>
      </div>
      <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1 sm:gap-1.5 border border-emerald-500/20 w-fit">
        <IoCheckmarkCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        All systems operational
      </span>
    </div>
  );
}
