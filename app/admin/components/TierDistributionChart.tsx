"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const TIER_COLORS: Record<string, string> = {
  johatsu: "#f43f5e",
  alpha: "#3ECF8E",
  beta: "#249361",
  public: "#166534",
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: Record<string, unknown> }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl z-[1000]">
        <p className="text-xs text-white font-medium">{payload[0].name}</p>
        <p className="text-[10px] text-[#888]">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
}

interface TierDistributionChartProps {
  johatsu: number;
  alpha: number;
  beta: number;
}

export function TierDistributionChart({ johatsu, alpha, beta }: TierDistributionChartProps) {
  const tierData = [
    { name: "Johatsu", value: johatsu, color: TIER_COLORS.johatsu },
    { name: "Alpha", value: alpha, color: TIER_COLORS.alpha },
    { name: "Beta", value: beta, color: TIER_COLORS.beta },
  ].filter((d) => d.value > 0);

  const total = tierData.reduce((sum, d) => sum + d.value, 0);

  if (tierData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#666] text-xs">
        No tier data
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={tierData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {tierData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {tierData.map((tier) => (
          <div key={tier.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
            <span className="text-[10px] text-[#888]">{tier.name}</span>
            <span className="text-[10px] text-white font-medium">{tier.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
