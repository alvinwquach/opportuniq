"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface BudgetChartProps {
  totalSpent: number;
  remaining: number;
  budget: number;
}

export function BudgetChart({ totalSpent, remaining, budget }: BudgetChartProps) {
  const isOverBudget = remaining < 0;

  const data = [
    { name: "Spent", value: totalSpent, color: isOverBudget ? "#ef4444" : "#2563EB" },
    { name: "Remaining", value: Math.max(0, remaining), color: "#d1d5db" },
  ];

  const spentPercent = Math.round((totalSpent / budget) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Budget Status</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isOverBudget ? 'bg-red-100 text-red-600' :
          remaining < 100 ? 'bg-amber-100 text-amber-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          {isOverBudget ? 'Over Budget' : `${spentPercent}% Used`}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-32 w-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
                itemStyle={{ color: "#111827" }}
                formatter={(value: number) => [`$${value}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900">${Math.round(totalSpent)}</span>
            <span className="text-[10px] text-gray-500">of ${budget}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500">Spent</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">${Math.round(totalSpent)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <span className="text-xs text-gray-500">Remaining</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">${Math.max(0, Math.round(remaining))}</span>
          </div>
          {isOverBudget && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-red-600">
                ${Math.abs(Math.round(remaining))} over budget
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
