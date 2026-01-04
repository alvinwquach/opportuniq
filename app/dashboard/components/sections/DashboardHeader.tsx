interface DashboardHeaderProps {
  firstName: string;
  isNewUser: boolean;
  hasIncomeSetup: boolean;
  financials?: {
    hourlyRate: number;
    monthlyIncome: number;
    annualIncome?: number;
    totalSpent?: number;
    remaining?: number;
    budgetUsedPercent?: number;
    totalBudget?: number;
  };
}

export function DashboardHeader({
  firstName,
  isNewUser,
  hasIncomeSetup,
  financials,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-lg font-medium text-white">
        {isNewUser ? "Welcome to OpportunIQ" : `Welcome back, ${firstName}`}
      </h1>
      {hasIncomeSetup && financials && (
        <p className="text-[13px] text-[#9a9a9a] mt-0.5">
          <span className="text-[#00D4FF]">${financials.hourlyRate.toFixed(2)}</span>/hr
          <span className="mx-2 text-[#333]">·</span>
          ${financials.monthlyIncome.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
          /mo
        </p>
      )}
    </div>
  );
}
