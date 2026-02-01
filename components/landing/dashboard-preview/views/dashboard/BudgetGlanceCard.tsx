interface BudgetGlanceCardProps {
  totalSpent: number;
  remaining: number;
  budget: number;
  monthlyIncome: number;
  hourlyRate: number;
}

export function BudgetGlanceCard({
  totalSpent,
  remaining,
  budget,
  monthlyIncome,
  hourlyRate,
}: BudgetGlanceCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-lg border border-emerald-500/20 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-400 font-medium">This Month</p>
        <span className="text-[10px] sm:text-xs text-emerald-400 font-medium">${totalSpent} spent</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-xl sm:text-2xl font-bold text-emerald-400">${remaining.toLocaleString()}</p>
        <p className="text-[10px] sm:text-xs text-[#888]">remaining</p>
      </div>
      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mb-3">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(totalSpent / budget) * 100}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
        <div>
          <p className="text-[#888]">Buffer</p>
          <p className="text-white font-medium">${(monthlyIncome * 0.2).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[#888]">Time value</p>
          <p className="text-white font-medium">${hourlyRate}/hr</p>
        </div>
      </div>
    </div>
  );
}
