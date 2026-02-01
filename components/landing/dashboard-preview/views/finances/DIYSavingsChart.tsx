"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { IoTrendingUp } from "react-icons/io5";
import { savingsOverTime } from "../../mockData";

export function DIYSavingsChart() {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">DIY Savings Trend</h3>
        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
          <IoTrendingUp className="w-3 h-3" />+23%
        </span>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={savingsOverTime} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
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
              formatter={(value: number) => [`$${value}`, "Saved"]}
            />
            <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
