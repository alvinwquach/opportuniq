"use client";

import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  users: {
    label: "Waitlist Signups",
    color: "#A855F7",
  },
} satisfies ChartConfig;

interface WaitlistGrowthChartProps {
  data: { date: string; users: number }[];
}

export function WaitlistGrowthChart({ data }: WaitlistGrowthChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillWaitlist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="rgba(255,255,255,0.05)"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: '#64748b', fontSize: 10 }}
          interval="preserveStartEnd"
          tickFormatter={(value) => {
            const index = data.findIndex(d => d.date === value);
            if (index % 5 === 0 || index === data.length - 1) {
              return value;
            }
            return '';
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: '#64748b', fontSize: 10 }}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ stroke: 'rgba(168,85,247,0.2)' }}
          content={<ChartTooltipContent className="bg-neutral-900 border-neutral-700 text-white" indicator="line" />}
        />
        <Area
          dataKey="users"
          type="monotone"
          fill="url(#fillWaitlist)"
          stroke="#A855F7"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
