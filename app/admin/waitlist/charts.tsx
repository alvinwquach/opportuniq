"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const SOURCE_COLORS: Record<string, string> = {
  landing: "#3ECF8E",
  website: "#249361",
  referral: "#1a7f5a",
  social: "#34d399",
  direct: "#6b7280",
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: Record<string, unknown> }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-white font-medium">{payload[0].name || payload[0].payload?.name}</p>
        <p className="text-[10px] text-[#888]">{payload[0].value} signups</p>
      </div>
    );
  }
  return null;
}

interface SourceBreakdown {
  source: string | null;
  count: number;
}

interface SourceDistributionChartProps {
  sourceBreakdown: SourceBreakdown[];
  total: number;
}

export function SourceDistributionChart({ sourceBreakdown, total }: SourceDistributionChartProps) {
  const pieData = sourceBreakdown.map((s) => ({
    name: getSourceLabel(s.source),
    value: s.count,
    color: SOURCE_COLORS[(s.source || "direct").toLowerCase()] || SOURCE_COLORS.direct,
  }));

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Source Distribution</h2>
        <p className="text-[10px] text-[#666]">Signups by traffic source</p>
      </div>
      <div className="h-48">
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No source data
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {pieData.map((source) => (
          <div key={source.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
            <span className="text-[10px] text-[#888]">{source.name}</span>
            <span className="text-[10px] text-white font-medium">{source.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSourceLabel(source: string | null): string {
  const key = (source || "direct").toLowerCase();
  const labels: Record<string, string> = {
    landing: "Landing Page",
    website: "Website",
    referral: "Referral",
    social: "Social Media",
    direct: "Direct",
  };
  return labels[key] || source || "Direct";
}

interface WaitlistEntry {
  createdAt: Date | string;
}

interface SignupsTrendChartProps {
  entries: WaitlistEntry[];
}

export function SignupsTrendChart({ entries }: SignupsTrendChartProps) {
  // Group entries by date for the last 14 days
  const trendData = useMemo(() => {
    const now = new Date();
    const data: { date: string; signups: number }[] = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const count = entries.filter((e) => {
        const entryDate = new Date(e.createdAt);
        return entryDate >= dayStart && entryDate <= dayEnd;
      }).length;

      data.push({ date: dateStr, signups: count });
    }

    return data;
  }, [entries]);

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Signups Trend</h2>
        <p className="text-[10px] text-[#666]">Last 14 days</p>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="signupsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#666", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#666", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                fontSize: "12px"
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#888" }}
            />
            <Area
              type="monotone"
              dataKey="signups"
              stroke="#3ECF8E"
              strokeWidth={2}
              fill="url(#signupsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface ConversionStats {
  total: number;
  converted: number;
  pending: number;
  conversionRate: number;
}

interface ConversionFunnelChartProps {
  stats: ConversionStats;
}

export function ConversionFunnelChart({ stats }: ConversionFunnelChartProps) {
  const funnelData = [
    { name: "Total Waitlist", value: stats.total, fill: "#3ECF8E" },
    { name: "Converted", value: stats.converted, fill: "#249361" },
    { name: "Pending", value: stats.pending, fill: "#f59e0b" },
  ];

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-medium text-white">Conversion Funnel</h2>
          <p className="text-[10px] text-[#666]">Waitlist to user conversion</p>
        </div>
        <span className="text-lg font-bold text-emerald-400">{stats.conversionRate}%</span>
      </div>
      <div className="h-40">
        {stats.total > 0 ? (
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
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No conversion data
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {funnelData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="text-[10px] text-[#888]">{item.name}</span>
            <span className="text-[10px] text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
