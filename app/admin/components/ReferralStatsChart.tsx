"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STATUS_COLORS = {
  converted: "#3ECF8E",
  pending: "#249361",
  expired: "#ef4444",
};

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl z-[1000]">
        <p className="text-xs text-white font-medium">{payload[0].name}</p>
        <p className="text-[10px] text-[#888]">{payload[0].value} referrals</p>
      </div>
    );
  }
  return null;
}

interface ReferralStatsChartProps {
  converted: number;
  pending: number;
  expired: number;
}

export function ReferralStatsChart({ converted, pending, expired }: ReferralStatsChartProps) {
  const data = [
    { name: "Converted", value: converted, color: STATUS_COLORS.converted },
    { name: "Pending", value: pending, color: STATUS_COLORS.pending },
    { name: "Expired", value: expired, color: STATUS_COLORS.expired },
  ].filter((d) => d.value > 0);

  const total = converted + pending + expired;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#666] text-xs">
        No referral data
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
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
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-[#888]">{item.name}</span>
            <span className="text-[10px] text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
