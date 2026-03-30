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
  Legend,
} from "recharts";

const TIER_COLORS: Record<string, string> = {
  johatsu: "#f43f5e",
  alpha: "#3ECF8E",
  beta: "#249361",
  public: "#1a7f5a",
};

const STATUS_COLORS = {
  pending: "#f59e0b",
  accepted: "#10b981",
  expired: "#6b7280",
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { name: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-white font-medium">{payload[0].name || payload[0].payload?.name}</p>
        <p className="text-[10px] text-[#888]">{payload[0].value} invites</p>
      </div>
    );
  }
  return null;
}

interface InviteStatusChartProps {
  pending: number;
  accepted: number;
  expired: number;
}

export function InviteStatusChart({ pending, accepted, expired }: InviteStatusChartProps) {
  const statusData = [
    { name: "Pending", value: pending, color: STATUS_COLORS.pending },
    { name: "Accepted", value: accepted, color: STATUS_COLORS.accepted },
    { name: "Expired", value: expired, color: STATUS_COLORS.expired },
  ].filter((d) => d.value > 0);

  const total = pending + accepted + expired;

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Invite Status</h2>
        <p className="text-[10px] text-[#666]">Overall invite breakdown</p>
      </div>
      <div className="h-40">
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No invite data
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {statusData.map((status) => (
          <div key={status.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
            <span className="text-[10px] text-[#888]">{status.name}</span>
            <span className="text-[10px] text-white font-medium">{status.value}</span>
            <span className="text-[10px] text-[#555]">
              ({total > 0 ? Math.round((status.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TierBreakdown {
  tier: string | null;
  total: number;
  accepted: number;
}

interface InviteTierChartProps {
  tierBreakdown: TierBreakdown[];
}

export function InviteTierChart({ tierBreakdown }: InviteTierChartProps) {
  const tierData = tierBreakdown.map((t) => ({
    name: (t.tier || "Public").charAt(0).toUpperCase() + (t.tier || "public").slice(1),
    total: t.total,
    accepted: t.accepted,
    color: TIER_COLORS[(t.tier || "public").toLowerCase()] || TIER_COLORS.public,
  }));

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Invites by Tier</h2>
        <p className="text-[10px] text-[#666]">Sent vs accepted by access tier</p>
      </div>
      <div className="h-40">
        {tierData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierData} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#888", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
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
              <Bar dataKey="total" name="Sent" fill="#3ECF8E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accepted" name="Accepted" fill="#249361" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No tier data
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3ECF8E" }} />
          <span className="text-[10px] text-[#888]">Sent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#249361" }} />
          <span className="text-[10px] text-[#888]">Accepted</span>
        </div>
      </div>
    </div>
  );
}

interface DailyInvite {
  date: string;
  sent: number;
  accepted: number;
}

interface InviteTrendChartProps {
  dailyInvites: DailyInvite[];
}

export function InviteTrendChart({ dailyInvites }: InviteTrendChartProps) {
  // Fill in missing days for the last 14 days
  const trendData = useMemo(() => {
    const now = new Date();
    const data: { date: string; sent: number; accepted: number }[] = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isoDate = date.toISOString().split("T")[0];

      const existing = dailyInvites.find((d) => d.date === isoDate);
      data.push({
        date: dateStr,
        sent: existing?.sent || 0,
        accepted: existing?.accepted || 0,
      });
    }

    return data;
  }, [dailyInvites]);

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Invite Activity</h2>
        <p className="text-[10px] text-[#666]">Last 14 days</p>
      </div>
      <div className="h-40">
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
              width={25}
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
            <Bar dataKey="sent" name="Sent" fill="#3ECF8E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="accepted" name="Accepted" fill="#249361" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3ECF8E" }} />
          <span className="text-[10px] text-[#888]">Sent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#249361" }} />
          <span className="text-[10px] text-[#888]">Accepted</span>
        </div>
      </div>
    </div>
  );
}
