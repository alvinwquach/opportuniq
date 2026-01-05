import type { CostChartData } from "@/lib/types/diagnosis";

interface CostComparisonChartProps {
  data: CostChartData;
  className?: string;
}

export function CostComparisonChart({ data, className }: CostComparisonChartProps) {
  if (!data.diy && !data.pro) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  const maxValue = Math.max(data.diy?.avg || 0, data.pro?.avg || 0);
  const savings = data.pro && data.diy ? data.pro.avg - data.diy.avg : 0;
  const savingsPercent = data.pro && savings > 0 ? Math.round((savings / data.pro.avg) * 100) : 0;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">Cost Comparison</h4>
        {savings > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e]">
            Save {savingsPercent}%
          </span>
        )}
      </div>
      <div className="space-y-4">
        {data.diy && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#5eead4]" />
                <span className="text-sm text-white">DIY</span>
              </div>
              <span className="text-lg font-semibold text-[#5eead4]">
                {formatCurrency(data.diy.avg)}
              </span>
            </div>
            <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5eead4] rounded-full transition-all duration-500"
                style={{ width: `${(data.diy.avg / maxValue) * 100}%` }}
              />
            </div>
            <div className="text-xs text-[#666666]">
              Range: {formatCurrency(data.diy.min)} - {formatCurrency(data.diy.max)}
            </div>
          </div>
        )}
        {data.pro && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#a78bfa]" />
                <span className="text-sm text-white">Professional</span>
              </div>
              <span className="text-lg font-semibold text-[#a78bfa]">
                {formatCurrency(data.pro.avg)}
              </span>
            </div>
            <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#a78bfa] rounded-full transition-all duration-500"
                style={{ width: `${(data.pro.avg / maxValue) * 100}%` }}
              />
            </div>
            <div className="text-xs text-[#666666]">
              Range: {formatCurrency(data.pro.min)} - {formatCurrency(data.pro.max)}
            </div>
          </div>
        )}
      </div>
      {savings > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#22c55e]">DIY Savings</span>
            <span className="text-lg font-bold text-[#22c55e]">{formatCurrency(savings)}</span>
          </div>
        </div>
      )}
      {data.source && data.source !== "estimate" && (
        <div className="mt-3 text-xs text-[#666666] text-center">
          Source: {data.source}
          {data.sampleSize && ` (${data.sampleSize.toLocaleString()} projects)`}
        </div>
      )}
    </div>
  );
}
