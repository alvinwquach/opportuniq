"use client";

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
  AreaChart,
  Area,
} from "recharts";

const TIER_COLORS: Record<string, string> = {
  johatsu: "#f43f5e",
  alpha: "#3ECF8E",
  beta: "#249361",
  public: "#1a7f5a",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "#3ECF8E",
  moderator: "#249361",
  user: "#1a7f5a",
  banned: "#ef4444",
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: Record<string, unknown> }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-white font-medium">{payload[0].name}</p>
        <p className="text-[10px] text-[#888]">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
}

interface TierData {
  name: string;
  value: number;
  color: string;
}

interface RoleData {
  name: string;
  value: number;
  color: string;
}

interface TierDistributionChartProps {
  johatsu: number;
  alpha: number;
  beta: number;
  total: number;
  banned: number;
}

export function TierDistributionChart({ johatsu, alpha, beta, total, banned }: TierDistributionChartProps) {
  const tierData: TierData[] = [
    { name: "Johatsu", value: johatsu, color: TIER_COLORS.johatsu },
    { name: "Alpha", value: alpha, color: TIER_COLORS.alpha },
    { name: "Beta", value: beta, color: TIER_COLORS.beta },
    { name: "Public", value: total - johatsu - alpha - beta - banned, color: TIER_COLORS.public },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Tier Distribution</h2>
        <p className="text-[10px] text-[#666]">Users by access tier</p>
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

interface RoleDistributionChartProps {
  admins: number;
  moderators: number;
  activeUsers: number;
  banned: number;
}

export function RoleDistributionChart({ admins, moderators, activeUsers, banned }: RoleDistributionChartProps) {
  const roleData: RoleData[] = [
    { name: "Admin", value: admins, color: ROLE_COLORS.admin },
    { name: "Moderator", value: moderators, color: ROLE_COLORS.moderator },
    { name: "User", value: activeUsers, color: ROLE_COLORS.user },
    { name: "Banned", value: banned, color: ROLE_COLORS.banned },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">Role Distribution</h2>
        <p className="text-[10px] text-[#666]">Users by role</p>
      </div>
      <div className="h-48">
        {roleData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", fontSize: "12px" }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No role data
          </div>
        )}
      </div>
    </div>
  );
}

interface UserGrowthData {
  date: string;
  count: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const formattedData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    users: Number(d.count),
  }));

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-white">User Growth</h2>
        <p className="text-[10px] text-[#666]">New signups over the last 30 days</p>
      </div>
      <div className="h-48">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
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
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
              />
              <Area
                type="monotone"
                dataKey="users"
                name="New Users"
                stroke="#3ECF8E"
                strokeWidth={2}
                fill="url(#userGrowthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] text-xs">
            No growth data yet
          </div>
        )}
      </div>
    </div>
  );
}
