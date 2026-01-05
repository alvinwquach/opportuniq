"use client";

import { useMemo } from "react";
import type { CostBreakdownData } from "@/lib/types/diagnosis";

interface CostBreakdownChartProps {
  data: CostBreakdownData;
  className?: string;
}

const categoryConfig: Record<string, { color: string; label: string }> = {
  materials: { color: "#5eead4", label: "Materials" },
  tools: { color: "#a78bfa", label: "Tools" },
  rental: { color: "#f97316", label: "Rentals" },
  ppe: { color: "#22c55e", label: "Safety Gear" },
};

export function CostBreakdownChart({ data, className }: CostBreakdownChartProps) {
  const items = useMemo(() => {
    const result = [];

    if (data.materials && data.materials > 0) {
      result.push({ key: "materials", cost: data.materials, ...categoryConfig.materials });
    }
    if (data.tools && data.tools > 0) {
      result.push({ key: "tools", cost: data.tools, ...categoryConfig.tools });
    }
    if (data.rental && data.rental > 0) {
      result.push({ key: "rental", cost: data.rental, ...categoryConfig.rental });
    }
    if (data.ppe && data.ppe > 0) {
      result.push({ key: "ppe", cost: data.ppe, ...categoryConfig.ppe });
    }

    return result;
  }, [data]);

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + item.cost, 0);
  }, [items]);

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  if (items.length === 0) {
    return null;
  }

  const maxCost = Math.max(...items.map(i => i.cost));

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">DIY Cost Breakdown</h4>
        <span className="text-sm font-semibold text-[#5eead4]">
          {formatCurrency(totalCost)} total
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#888888]">{item.label}</span>
              </div>
              <span className="text-white font-medium">{formatCurrency(item.cost)}</span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.cost / maxCost) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {data.budgetComparison && (
        <div className="mt-4 p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#888888]">Your budget</span>
            <span className="text-white">{formatCurrency(data.budgetComparison.budget)}</span>
          </div>
          <div className="h-2 bg-[#0c0c0c] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((totalCost / data.budgetComparison.budget) * 100, 100)}%`,
                backgroundColor: totalCost <= data.budgetComparison.budget ? "#22c55e" : "#ef4444",
              }}
            />
          </div>
          <div className="mt-2 text-xs text-center">
            {totalCost <= data.budgetComparison.budget ? (
              <span className="text-[#22c55e]">
                {formatCurrency(data.budgetComparison.budget - totalCost)} under budget
              </span>
            ) : (
              <span className="text-[#ef4444]">
                {formatCurrency(totalCost - data.budgetComparison.budget)} over budget
              </span>
            )}
          </div>
        </div>
      )}
      {data.whereToBuy && data.whereToBuy.length > 0 && (
        <div className="mt-4 space-y-2">
          <span className="text-xs text-[#888888]">Where to buy:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.whereToBuy.map((store, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-[#5eead4]/10 text-[#5eead4] border border-[#5eead4]/20"
              >
                {store}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
