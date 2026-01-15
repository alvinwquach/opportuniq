"use client";

interface StatsListProps {
  items: {
    label: string;
    value: number | string;
    color?: string;
    percentage?: number;
  }[];
  showBar?: boolean;
}

export function StatsList({ items, showBar = false }: StatsListProps) {
  const maxValue = Math.max(...items.map((item) => (typeof item.value === "number" ? item.value : 0)));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {item.color && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-[13px] text-[#999]">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-white">{item.value}</span>
              {item.percentage !== undefined && (
                <span className="text-[11px] text-[#555]">{item.percentage}%</span>
              )}
            </div>
          </div>
          {showBar && typeof item.value === "number" && maxValue > 0 && (
            <div className="h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || "#5eead4",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
