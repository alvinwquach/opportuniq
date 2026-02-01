"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IoCash, IoWallet, IoTrendingUp, IoPieChart } from "react-icons/io5";

interface FinanceAnalyticsProps {
  stats: {
    usersWithIncome: number;
    usersWithExpenses: number;
    usersWithBudgets: number;
    totalIncomeStreams: number;
    totalExpenses: number;
    totalBudgets: number;
    avgIncomeStreamsPerUser: number;
    avgExpensesPerUser: number;
    adoptionTrend: { date: string; income: number; expenses: number; budgets: number }[];
  };
}

const tooltipStyle = {
  backgroundColor: "#171717",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function FinanceAnalyticsCard({ stats }: FinanceAnalyticsProps) {
  const hasData = stats.usersWithIncome > 0 || stats.usersWithExpenses > 0 || stats.usersWithBudgets > 0;

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-white">Finance Tracking</h2>
          <p className="text-[10px] text-[#666]">User financial feature adoption</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <IoCash className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#111111] rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <IoWallet className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] text-[#666]">Income</span>
          </div>
          <p className="text-lg font-bold text-emerald-400">{stats.usersWithIncome}</p>
          <p className="text-[9px] text-[#666]">{stats.totalIncomeStreams} streams</p>
        </div>
        <div className="bg-[#111111] rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <IoTrendingUp className="w-3 h-3 text-rose-400" />
            <span className="text-[9px] text-[#666]">Expenses</span>
          </div>
          <p className="text-lg font-bold text-rose-400">{stats.usersWithExpenses}</p>
          <p className="text-[9px] text-[#666]">{stats.totalExpenses} tracked</p>
        </div>
        <div className="bg-[#111111] rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <IoPieChart className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] text-[#666]">Budgets</span>
          </div>
          <p className="text-lg font-bold text-emerald-400">{stats.usersWithBudgets}</p>
          <p className="text-[9px] text-[#666]">{stats.totalBudgets} active</p>
        </div>
      </div>

      {/* Averages */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-[#111111] rounded-lg p-2 text-center">
          <p className="text-sm font-semibold text-white">
            {stats.avgIncomeStreamsPerUser.toFixed(1)}
          </p>
          <p className="text-[9px] text-[#666]">Avg income/user</p>
        </div>
        <div className="flex-1 bg-[#111111] rounded-lg p-2 text-center">
          <p className="text-sm font-semibold text-white">
            {stats.avgExpensesPerUser.toFixed(1)}
          </p>
          <p className="text-[9px] text-[#666]">Avg expenses/user</p>
        </div>
      </div>

      {/* Adoption Trend */}
      <div>
        <p className="text-[10px] text-[#888] mb-2">Feature Adoption (30 days)</p>
        {hasData && stats.adoptionTrend.length > 0 ? (
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.adoptionTrend} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#888" }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fill="url(#incomeGrad)"
                  strokeWidth={1.5}
                  name="Income Users"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  fill="url(#expenseGrad)"
                  strokeWidth={1.5}
                  name="Expense Users"
                />
                <Area
                  type="monotone"
                  dataKey="budgets"
                  stroke="#3ECF8E"
                  fill="url(#budgetGrad)"
                  strokeWidth={1.5}
                  name="Budget Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center text-[#666] text-xs">
            No finance data yet
          </div>
        )}
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-[#888]">Income</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-[9px] text-[#888]">Expenses</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-[#888]">Budgets</span>
          </div>
        </div>
      </div>
    </div>
  );
}
