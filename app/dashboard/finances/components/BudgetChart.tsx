"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface BudgetChartProps {
  totalSpent: number;
  remaining: number;
  budget: number;
}

export function BudgetChart({ totalSpent, remaining, budget }: BudgetChartProps) {
  const usedPercent = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const data = [
    { name: "Spent", value: Math.max(0, totalSpent), color: "#3ECF8E" },
    { name: "Remaining", value: Math.max(0, remaining), color: "#2a2a2a" },
  ];

  // If over budget, show only spent in amber
  if (remaining < 0) {
    data[0].color = "#f59e0b";
    data[1].value = 0;
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Monthly Budget</h3>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold ${remaining < 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {usedPercent.toFixed(0)}%
            </span>
            <span className="text-[10px] text-[#666]">used</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-[#888]">Spent</span>
            </div>
            <span className="text-sm font-medium text-white">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
              <span className="text-xs text-[#888]">Remaining</span>
            </div>
            <span className={`text-sm font-medium ${remaining < 0 ? "text-amber-400" : "text-white"}`}>
              ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666]">Budget</span>
              <span className="text-sm font-medium text-[#888]">
                ${budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
