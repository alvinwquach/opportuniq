"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RoleDistributionChartProps {
  stats: {
    admins: number;
    moderators: number;
    activeUsers: number;
    banned: number;
  };
}

const ROLE_COLORS = {
  Admins: "#ef4444",
  Moderators: "#3b82f6",
  Users: "#10b981",
  Banned: "#6b7280",
};

export function RoleDistributionChart({ stats }: RoleDistributionChartProps) {
  const data = [
    { name: "Admins", value: stats.admins, color: ROLE_COLORS.Admins },
    { name: "Moderators", value: stats.moderators, color: ROLE_COLORS.Moderators },
    { name: "Users", value: stats.activeUsers, color: ROLE_COLORS.Users },
    { name: "Banned", value: stats.banned, color: ROLE_COLORS.Banned },
  ];

  const validData = data.filter((item) => item.value > 0);

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#666] text-[13px]">
        No users yet
      </div>
    );
  }

  const chartConfig = validData.reduce((acc, item) => {
    acc[item.name.toLowerCase()] = {
      label: item.name,
      color: item.color,
    };
    return acc;
  }, {} as ChartConfig);

  const total = validData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full flex items-center">
      <div className="flex-1">
        <ChartContainer id="role-distribution" config={chartConfig} className="h-full w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel className="bg-neutral-900 border-neutral-700 text-white" />} />
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col gap-3 pr-4">
        {validData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-sm text-white font-medium">{item.value}</span>
              <span className="text-xs text-neutral-500">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
