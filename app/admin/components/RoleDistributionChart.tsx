"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RoleDistributionChartProps {
  data: { name: string; value: number; color: string }[];
}

export function RoleDistributionChart({ data }: RoleDistributionChartProps) {
  // Safety check: ensure data is valid
  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex items-center justify-center h-full text-[#666] text-[13px]">
        No data available
      </div>
    );
  }

  // Filter out items with zero or invalid values
  const validData = data.filter((item) => item && typeof item.value === "number" && item.value > 0);

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
    <div className="h-full flex flex-col">
      <ChartContainer config={chartConfig} className="flex-1 w-full">
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {validData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {validData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] text-[#888]">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
