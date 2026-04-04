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
    { name: "Spent", value: Math.max(0, totalSpent), color: "#2563EB" },
    { name: "Remaining", value: Math.max(0, remaining), color: "#2a2a2a" },
  ];

  // If over budget, show only spent in amber
  if (remaining < 0) {
    data[0].color = "#f59e0b";
    data[1].value = 0;
  }

  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Budget</h3>

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
            <span className={`text-lg font-bold ${remaining < 0 ? "text-amber-400" : "text-blue-600"}`}>
              {usedPercent.toFixed(0)}%
            </span>
            <span className="text-[10px] text-gray-500">used</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-xs text-gray-500">Spent</span>
            </div>
            <span className="text-sm font-medium text-white">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <span className="text-xs text-gray-500">Remaining</span>
            </div>
            <span className={`text-sm font-medium ${remaining < 0 ? "text-amber-400" : "text-gray-900"}`}>
              ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Budget</span>
              <span className="text-sm font-medium text-gray-500">
                ${budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
