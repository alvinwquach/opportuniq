"use client";

import type { SpendingCategory } from "../types";

interface SpendingByCategoryProps {
  data: SpendingCategory[];
}

export function SpendingByCategory({ data }: SpendingByCategoryProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Spending by Category</h3>

      {data.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[#666]">No expenses this month</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 5).map((item) => {
            const percent = total > 0 ? (item.amount / total) * 100 : 0;
            return (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-[#888]">{item.category}</span>
                  </div>
                  <span className="text-xs font-medium text-white">
                    ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
