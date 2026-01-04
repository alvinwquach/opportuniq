"use client";

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  users: {
    label: "Users",
    color: "#5eead4",
  },
} satisfies ChartConfig;

interface UserGrowthChartProps {
  data: { date: string; users: number }[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
      >
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: '#555', fontSize: 10 }}
          interval="preserveStartEnd"
          tickFormatter={(value) => {
            const index = data.findIndex(d => d.date === value);
            if (index % 7 === 0 || index === data.length - 1) {
              return value;
            }
            return '';
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
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="users"
          fill="#5eead4"
          radius={[2, 2, 0, 0]}
          maxBarSize={12}
        />
      </BarChart>
    </ChartContainer>
  );
}
