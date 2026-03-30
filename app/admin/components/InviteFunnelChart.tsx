"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

const FUNNEL_COLORS = ["#3ECF8E", "#249361", "#166534", "#ef4444"];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: Record<string, unknown> }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl z-[1000]">
        <p className="text-xs text-white font-medium">{payload[0].payload.name}</p>
        <p className="text-[10px] text-[#888]">{payload[0].value} invites</p>
      </div>
    );
  }
  return null;
}

interface InviteFunnelChartProps {
  total: number;
  accepted: number;
  pending: number;
  expired: number;
}

export function InviteFunnelChart({ total, accepted, pending, expired }: InviteFunnelChartProps) {
  const funnelData = [
    { name: "Sent", value: total, fill: FUNNEL_COLORS[0] },
    { name: "Accepted", value: accepted, fill: FUNNEL_COLORS[1] },
    { name: "Pending", value: pending, fill: FUNNEL_COLORS[2] },
    { name: "Expired", value: expired, fill: FUNNEL_COLORS[3] },
  ];

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#666] text-xs">
        No invite data
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#666", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000 }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {funnelData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FUNNEL_COLORS[i] }} />
            <span className="text-[10px] text-[#888]">{item.name}</span>
            <span className="text-[10px] text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
