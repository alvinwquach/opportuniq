"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  FunnelChart,
  Funnel,
  LabelList,
  AreaChart,
  Area,
} from "recharts";

const TIER_COLORS: Record<string, string> = {
  johatsu: "#f43f5e",
  alpha: "#3ECF8E",
  beta: "#249361",
};

const FUNNEL_COLORS = ["#3ECF8E", "#f59e0b", "#249361"];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: Record<string, unknown> }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-white font-medium">{payload[0].name || payload[0].payload?.name}</p>
        <p className="text-[10px] text-[#888]">{payload[0].value}</p>
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

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Tier Distribution</h2>
        <p className="text-[10px] text-[#666]">Referrers by access tier</p>
      </div>
      <div className="h-48">
        {tierData.length > 0 ? (
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
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No tier data
          </div>
        )}
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

interface ReferralFunnelChartProps {
  total: number;
  pending: number;
  converted: number;
}

export function ReferralFunnelChart({ total, pending, converted }: ReferralFunnelChartProps) {
  const funnelData = [
    { name: "Shared", value: total, fill: FUNNEL_COLORS[0] },
    { name: "Pending", value: pending, fill: FUNNEL_COLORS[1] },
    { name: "Converted", value: converted, fill: FUNNEL_COLORS[2] },
  ];

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Referral Funnel</h2>
        <p className="text-[10px] text-[#666]">Conversion visualization</p>
      </div>
      <div className="h-48">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={70}
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
            No referral data
          </div>
        )}
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

interface Referral {
  createdAt: Date | string;
  status: string;
}

interface ReferralTrendChartProps {
  referrals: Referral[];
}

export function ReferralTrendChart({ referrals }: ReferralTrendChartProps) {
  // Group referrals by date for the last 14 days
  const trendData = useMemo(() => {
    const now = new Date();
    const data: { date: string; total: number; converted: number }[] = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayReferrals = referrals.filter((r) => {
        const refDate = new Date(r.createdAt);
        return refDate >= dayStart && refDate <= dayEnd;
      });

      data.push({
        date: dateStr,
        total: dayReferrals.length,
        converted: dayReferrals.filter((r) => r.status === "converted").length,
      });
    }

    return data;
  }, [referrals]);

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Referral Activity</h2>
        <p className="text-[10px] text-[#666]">Last 14 days</p>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
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
                fontSize: "12px",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#888" }}
            />
            <Bar dataKey="total" name="Total" fill="#3ECF8E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-[#888]">Total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-[#888]">Converted</span>
        </div>
      </div>
    </div>
  );
}

interface ReferralGrowthData {
  date: string;
  total: number;
  converted: number;
}

interface ReferralGrowthChartProps {
  data: ReferralGrowthData[];
}

export function ReferralGrowthChart({ data }: ReferralGrowthChartProps) {
  const formattedData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total: Number(d.total),
    converted: Number(d.converted),
  }));

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Referral Growth</h2>
        <p className="text-[10px] text-[#666]">Total vs converted over 30 days</p>
      </div>
      <div className="h-48">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="referralTotalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="referralConvertedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#3ECF8E"
                strokeWidth={2}
                fill="url(#referralTotalGradient)"
              />
              <Area
                type="monotone"
                dataKey="converted"
                name="Converted"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#referralConvertedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No growth data yet
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-[#888]">Total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-[#888]">Converted</span>
        </div>
      </div>
    </div>
  );
}
