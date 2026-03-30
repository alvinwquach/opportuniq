"use client";

import { useMemo } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  users: {
    label: "New Users",
    color: "#3ECF8E",
  },
} satisfies ChartConfig;

interface UserGrowthChartProps {
  data: { date: string; count: number }[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  // Fill in missing dates to create a continuous line
  const filledData = useMemo(() => {
    const result: { date: string; users: number }[] = [];

    if (data.length > 0) {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      const dataMap = new Map(data.map(d => [d.date, d.count]));

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          users: dataMap.get(dateStr) || 0,
        });
      }
    }

    return result;
  }, [data]);

  if (filledData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#666] text-xs">
        No user signups in the last 30 days
      </div>
    );
  }

  return (
    <ChartContainer id="user-growth" config={chartConfig} className="h-full w-full">
      <AreaChart
        accessibilityLayer
        data={filledData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: '#555', fontSize: 10 }}
          interval="preserveStartEnd"
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: '#555', fontSize: 10 }}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ stroke: '#333', strokeWidth: 1 }}
          content={<ChartTooltipContent className="bg-[#171717] border-white/[0.06] text-white text-xs" labelClassName="text-white" />}
        />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#3ECF8E"
          strokeWidth={2}
          fill="url(#userGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#3ECF8E', stroke: '#0a0a0a', strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
