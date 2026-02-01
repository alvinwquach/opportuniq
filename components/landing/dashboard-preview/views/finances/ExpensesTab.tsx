"use client";

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { IoRepeat, IoTime, IoTrash } from "react-icons/io5";
import { Expense, frequencyLabels, frequencyMultipliers, categoryColors } from "./types";
import { expenseHistoryData, budgetVsActualData } from "./data";
import { getUrgencyColor, getUrgencyLabel } from "./utils";

interface ExpensesTabProps {
  expenses: Expense[];
  monthlyExpenses: number;
  oneTimeThisMonth: number;
  spendingByCategory: { category: string; amount: number }[];
  onDelete: (id: string) => void;
}

export function ExpensesTab({
  expenses,
  monthlyExpenses,
  oneTimeThisMonth,
  spendingByCategory,
  onDelete
}: ExpensesTabProps) {
  const totalSpent = monthlyExpenses + oneTimeThisMonth;
  const recurringExpenses = expenses.filter(e => e.isRecurring);
  const oneTimeExpenses = expenses.filter(e => !e.isRecurring);

  return (
    <div className="space-y-6">
      {/* Expense Trend */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Expense Trend</h3>
          <span className="text-xs text-[#666]">Last 6 months</span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={expenseHistoryData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="recurringGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="oneTimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
                formatter={(value: number, name: string) => {
                  const label = name === "recurring" ? "Recurring" : name === "oneTime" ? "One-time" : "Total";
                  return [`$${value}`, label];
                }}
              />
              <Area type="monotone" dataKey="recurring" stackId="1" stroke="#3ECF8E" strokeWidth={2} fill="url(#recurringGrad)" />
              <Area type="monotone" dataKey="oneTime" stackId="1" stroke="#f59e0b" strokeWidth={2} fill="url(#oneTimeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-[#888]">Recurring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-xs text-[#888]">One-time</span>
          </div>
        </div>
      </div>

      {/* Type Breakdown & Category */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recurring vs One-time */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Expense Type</h3>
            <span className="text-xs text-[#666]">This month</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-28 w-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Recurring", value: Math.round(monthlyExpenses), color: "#3ECF8E" },
                      { name: "One-time", value: Math.round(oneTimeThisMonth), color: "#f59e0b" },
                    ]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                  >
                    <Cell fill="#3ECF8E" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 1000 }}
                    contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number) => [`$${value}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#888] flex-1">Recurring</span>
                <span className="text-xs font-medium text-white">${Math.round(monthlyExpenses)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-[#888] flex-1">One-time</span>
                <span className="text-xs font-medium text-white">${Math.round(oneTimeThisMonth)}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#888]">Total</span>
                  <span className="text-sm font-bold text-white">${Math.round(totalSpent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* By Category */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
          <h3 className="text-sm font-medium text-white mb-4">By Category</h3>
          {spendingByCategory.length > 0 ? (
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingByCategory.slice(0, 4)} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#888' }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip
                    wrapperStyle={{ zIndex: 1000 }}
                    contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number) => [`$${value}`, ""]}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {spendingByCategory.slice(0, 4).map((entry, index) => (
                      <Cell key={index} fill={categoryColors[entry.category] || "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center">
              <p className="text-xs text-[#555]">No expenses yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget vs Actual */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Budget vs Actual</h3>
          <span className="text-xs text-[#666]">This month</span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetVsActualData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#888' }} width={80} axisLine={false} tickLine={false} />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
                formatter={(value: number, name: string) => [`$${value}`, name === "budget" ? "Budget" : "Actual"]}
              />
              <Bar dataKey="budget" fill="#333" radius={[0, 4, 4, 0]} name="budget" />
              <Bar dataKey="actual" radius={[0, 4, 4, 0]} name="actual">
                {budgetVsActualData.map((entry, index) => (
                  <Cell key={index} fill={entry.actual > entry.budget ? "#ef4444" : "#10b981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#333]" />
            <span className="text-xs text-[#888]">Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-[#888]">Under</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-[#888]">Over</span>
          </div>
        </div>
      </div>

      {/* Recurring & One-time Expense Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recurring */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IoRepeat className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-medium text-white">Recurring</h3>
            </div>
            <p className="text-xs text-[#666]">${Math.round(monthlyExpenses)}/mo</p>
          </div>
          <div className="space-y-2">
            {recurringExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] hover:bg-[#252525] transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{expense.description}</p>
                  <p className="text-[10px] text-[#666]">{expense.category} · {frequencyLabels[expense.frequency || "monthly"]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">${expense.amount}</span>
                  <button onClick={() => onDelete(expense.id)} className="p-1 text-[#666] hover:text-red-400 opacity-0 group-hover:opacity-100"><IoTrash className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
            {recurringExpenses.length === 0 && (
              <p className="text-xs text-[#555] text-center py-4">No recurring expenses</p>
            )}
          </div>
        </div>

        {/* One-time */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoTime className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-white">One-time</h3>
          </div>
          <div className="space-y-2">
            {oneTimeExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#252525] transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-white">{expense.description}</p>
                    {expense.urgency && expense.urgency !== 'normal' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getUrgencyColor(expense.urgency)}`}>
                        {getUrgencyLabel(expense.urgency)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#666]">
                    {expense.category} · {expense.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    {expense.issueTitle && <span className="text-emerald-400"> · {expense.issueTitle}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">${expense.amount.toFixed(2)}</span>
                  <button onClick={() => onDelete(expense.id)} className="p-1 text-[#666] hover:text-red-400 opacity-0 group-hover:opacity-100"><IoTrash className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
            {oneTimeExpenses.length === 0 && (
              <p className="text-xs text-[#555] text-center py-4">No one-time expenses</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
