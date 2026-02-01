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
  const pieColors = ["#3ECF8E", "#249361", "#10b981", "#059669", "#047857"];

  return (
    <div className="space-y-6">
      {/* Income Trend Chart */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Income Trend</h3>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <IoTrendingUp className="w-3 h-3" />+4.9% vs 6mo ago
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeHistoryData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
                formatter={(value: number, name: string) => {
                  const label = name === "total" ? "Total" : name === "primary" ? "Primary" : "Secondary";
                  return [`$${value.toLocaleString()}`, label];
                }}
              />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
              <Line type="monotone" dataKey="primary" stroke="#3ECF8E" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="secondary" stroke="#249361" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-500 rounded" />
            <span className="text-xs text-[#888]">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ background: "repeating-linear-gradient(to right, #3ECF8E 0, #3ECF8E 4px, transparent 4px, transparent 8px)" }} />
            <span className="text-xs text-[#888]">Primary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ background: "repeating-linear-gradient(to right, #249361 0, #249361 4px, transparent 4px, transparent 8px)" }} />
            <span className="text-xs text-[#888]">Secondary</span>
          </div>
        </div>
      </div>

      {/* Income Breakdown & Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income Breakdown Pie */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Income Breakdown</h3>
            <span className="text-xs text-[#666]">Monthly normalized</span>
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
                    contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number) => [`$${value}/mo`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {activeStreams.map((stream, i) => (
                <div key={stream.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                  <span className="text-xs text-[#888] flex-1 truncate">{stream.source}</span>
                  <span className="text-xs font-medium text-white">${Math.round(stream.amount * frequencyMultipliers[stream.frequency]).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
          <h3 className="text-sm font-medium text-white mb-4">Monthly Summary</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 mb-0.5">Total Monthly Income</p>
              <p className="text-3xl font-bold text-emerald-400">${Math.round(monthlyIncome).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0f0f0f]">
                <p className="text-[10px] text-[#666] mb-0.5">Active Streams</p>
                <p className="text-xl font-semibold text-white">{activeStreams.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0f0f0f]">
                <p className="text-[10px] text-[#666] mb-0.5">Avg per Stream</p>
                <p className="text-xl font-semibold text-white">
                  ${activeStreams.length > 0 ? Math.round(monthlyIncome / activeStreams.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">All Income Streams</h3>
        </div>
        <div className="space-y-2">
          {incomeStreams.map((stream) => (
            <div key={stream.id} className="flex items-center justify-between p-4 rounded-lg bg-[#0f0f0f] hover:bg-[#252525] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <IoCash className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{stream.source}</p>
                  <p className="text-xs text-[#666]">{frequencyLabels[stream.frequency]}{stream.description && ` · ${stream.description}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">${stream.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-[#555]">${Math.round(stream.amount * frequencyMultipliers[stream.frequency]).toLocaleString()}/mo</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(stream)} className="p-1.5 text-[#666] hover:text-white hover:bg-[#333] rounded"><IoPencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete(stream.id)} className="p-1.5 text-[#666] hover:text-red-400 hover:bg-[#333] rounded"><IoTrash className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {incomeStreams.length === 0 && (
            <div className="text-center py-8">
              <IoCash className="w-8 h-8 text-[#444] mx-auto mb-2" />
              <p className="text-sm text-[#666]">No income streams yet</p>
              <button onClick={onAdd} className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium">Add your first income</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
