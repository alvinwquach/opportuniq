"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { CompletionRateProps } from "../types";

export function CompletionRate({ completed, inProgress, total }: CompletionRateProps) {
  const started = completed + inProgress;
  const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0;

  const data = [
    { name: "Completed", value: completed, color: "#10b981" },
    { name: "In Progress", value: inProgress, color: "#249361" },
  ];

  // Filter out zero values
  const filteredData = data.filter((d) => d.value > 0);

  // If nothing started, show empty state
  if (started === 0) {
    return (
      <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Completion Rate</h3>
        <div className="flex items-center justify-center h-24">
          <p className="text-xs text-gray-500">Start a guide to track progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Completion Rate</h3>
      <div className="flex items-center gap-3">
        {/* Donut Chart */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={24}
                outerRadius={36}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{completionRate}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] text-gray-500">Completed</span>
            </div>
            <span className="text-xs font-semibold text-blue-600">{completed}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[10px] text-gray-500">In Progress</span>
            </div>
            <span className="text-xs font-semibold text-blue-600">{inProgress}</span>
          </div>
          <div className="pt-1 border-t border-gray-200">
            <p className="text-[9px] text-gray-500">
              {completed} of {started} started guides finished
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
