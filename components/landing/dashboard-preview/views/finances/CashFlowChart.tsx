"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cashFlowData } from "./data";

export function CashFlowChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Cash Flow</h3>
        <span className="text-xs text-gray-500">Last 6 months</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={cashFlowData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              wrapperStyle={{ zIndex: 1000 }}
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
              }}
              itemStyle={{ color: "#111827" }}
              labelStyle={{ color: "#6b7280" }}
              formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "income" ? "Income" : "Expenses"]}
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="income" />
            <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} name="expenses" />
            <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={2} dot={false} name="income-trend" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-gray-500">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-xs text-gray-500">Expenses</span>
        </div>
      </div>
    </div>
  );
}
