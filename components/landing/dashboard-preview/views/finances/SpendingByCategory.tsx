"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { categoryColors } from "./types";

interface CategoryData {
  category: string;
  amount: number;
}

interface SpendingByCategoryProps {
  data: CategoryData[];
}

export function SpendingByCategory({ data }: SpendingByCategoryProps) {
  if (data.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Spending by Category</h3>
          <span className="text-xs text-[#666]">This month</span>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-xs text-[#555]">No expenses this month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Spending by Category</h3>
        <span className="text-xs text-[#666]">This month</span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 10, fill: '#888' }}
              width={80}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              wrapperStyle={{ zIndex: 1000 }}
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#888" }}
              formatter={(value: number) => [`$${value}`, ""]}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
              {data.slice(0, 5).map((entry, index) => (
                <Cell key={index} fill={categoryColors[entry.category] || "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
