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
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-blue-600 font-medium">This Month</p>
        <span className="text-[10px] sm:text-xs text-blue-600 font-medium">${totalSpent} spent</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-xl sm:text-2xl font-bold text-blue-600">${remaining.toLocaleString()}</p>
        <p className="text-[10px] sm:text-xs text-gray-500">remaining</p>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(totalSpent / budget) * 100}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
        <div>
          <p className="text-gray-500">Buffer</p>
          <p className="text-gray-900 font-medium">${(monthlyIncome * 0.2).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Time value</p>
          <p className="text-gray-900 font-medium">${hourlyRate}/hr</p>
        </div>
      </div>
    </div>
  );
}
