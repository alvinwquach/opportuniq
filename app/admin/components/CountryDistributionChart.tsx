"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = ['#00F0FF', '#A855F7', '#22C55E', '#F59E0B', '#EF4444', '#6366F1'];

interface CountryDistributionChartProps {
  data: { name: string; value: number; color?: string }[];
}

export function CountryDistributionChart({ data }: CountryDistributionChartProps) {
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-50 text-slate-500 text-sm">
        No location data available
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8">
      <ChartContainer config={chartConfig} className="min-h-50 w-50">
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex-1 space-y-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-slate-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">{item.value}</span>
              <span className="text-xs text-slate-500">
                ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
        {data.length > 6 && (
          <p className="text-xs text-slate-500">+{data.length - 6} more countries</p>
        )}
      </div>
    </div>
  );
}
