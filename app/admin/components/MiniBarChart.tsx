"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface MiniBarChartProps {
  data: { name: string; value: number; color?: string }[];
  color?: string;
}

export function MiniBarChart({ data, color = "#5eead4" }: MiniBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#666] text-[13px]">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#666", fontSize: 10 }}
          interval={0}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
          }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
