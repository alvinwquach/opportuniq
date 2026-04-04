"use client";

import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { IoCash, IoPencil, IoTrash, IoTrendingUp } from "react-icons/io5";
import { IncomeStream, frequencyLabels, frequencyMultipliers } from "./types";
import { incomeHistoryData } from "./data";

interface IncomeTabProps {
  incomeStreams: IncomeStream[];
  monthlyIncome: number;
  onEdit: (income: IncomeStream) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function IncomeTab({ incomeStreams, monthlyIncome, onEdit, onDelete, onAdd }: IncomeTabProps) {
  const activeStreams = incomeStreams.filter(s => s.isActive);
  const pieColors = ["#2563EB", "#249361", "#10b981", "#059669", "#047857"];

  return (
    <div className="space-y-6">
      {/* Income Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Income Trend</h3>
          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <IoTrendingUp className="w-3 h-3" />+4.9% vs 6mo ago
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeHistoryData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
                itemStyle={{ color: "#111827" }}
                labelStyle={{ color: "#6b7280" }}
                formatter={(value: number, name: string) => {
                  const label = name === "total" ? "Total" : name === "primary" ? "Primary" : "Secondary";
                  return [`$${value.toLocaleString()}`, label];
                }}
              />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
              <Line type="monotone" dataKey="primary" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="secondary" stroke="#249361" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-500 rounded" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ background: "repeating-linear-gradient(to right, #2563EB 0, #2563EB 4px, transparent 4px, transparent 8px)" }} />
            <span className="text-xs text-gray-500">Primary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ background: "repeating-linear-gradient(to right, #249361 0, #249361 4px, transparent 4px, transparent 8px)" }} />
            <span className="text-xs text-gray-500">Secondary</span>
          </div>
        </div>
      </div>

      {/* Income Breakdown & Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income Breakdown Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Income Breakdown</h3>
            <span className="text-xs text-gray-500">Monthly normalized</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeStreams.map((s, i) => ({
                      name: s.source,
                      value: Math.round(s.amount * frequencyMultipliers[s.frequency]),
                      color: pieColors[i % pieColors.length],
                    }))}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                  >
                    {activeStreams.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 1000 }}
                    contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
                    itemStyle={{ color: "#111827" }}
                    formatter={(value: number) => [`$${value}/mo`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {activeStreams.map((stream, i) => (
                <div key={stream.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                  <span className="text-xs text-gray-500 flex-1 truncate">{stream.source}</span>
                  <span className="text-xs font-medium text-gray-900">${Math.round(stream.amount * frequencyMultipliers[stream.frequency]).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Monthly Summary</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-600 mb-0.5">Total Monthly Income</p>
              <p className="text-3xl font-bold text-blue-600">${Math.round(monthlyIncome).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-[10px] text-gray-500 mb-0.5">Active Streams</p>
                <p className="text-xl font-semibold text-gray-900">{activeStreams.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-[10px] text-gray-500 mb-0.5">Avg per Stream</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${activeStreams.length > 0 ? Math.round(monthlyIncome / activeStreams.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">All Income Streams</h3>
        </div>
        <div className="space-y-2">
          {incomeStreams.map((stream) => (
            <div key={stream.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <IoCash className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stream.source}</p>
                  <p className="text-xs text-gray-500">{frequencyLabels[stream.frequency]}{stream.description && ` · ${stream.description}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${stream.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-600">${Math.round(stream.amount * frequencyMultipliers[stream.frequency]).toLocaleString()}/mo</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(stream)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded"><IoPencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete(stream.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"><IoTrash className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {incomeStreams.length === 0 && (
            <div className="text-center py-8">
              <IoCash className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No income streams yet</p>
              <button onClick={onAdd} className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">Add your first income</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
