"use client";

import { IoWallet } from "react-icons/io5";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Line,
} from "recharts";

interface ContributionData {
  name: string;
  value: number;
  color: string;
}

interface MonthlySavingsData {
  month: string;
  savings: number;
  spent: number;
}

interface ContributionHistoryItem {
  id: string;
  member: string;
  amount: number;
  date: string;
  note: string;
}

interface GroupBudgetTabProps {
  contributionData: ContributionData[];
  monthlySavingsData: MonthlySavingsData[];
  contributionHistory: ContributionHistoryItem[];
  setShowContributionHistory: (show: boolean) => void;
}

export function GroupBudgetTab({
  contributionData,
  monthlySavingsData,
  contributionHistory,
  setShowContributionHistory,
}: GroupBudgetTabProps) {
  return (
    <>
      {/* Shared Budget Overview */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoWallet className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">Shared Budget</h3>
          </div>
          <button
            onClick={() => setShowContributionHistory(true)}
            className="text-[10px] text-blue-600 hover:text-blue-700 transition-colors"
          >
            View History
          </button>
        </div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-blue-600">$1,250</p>
            <p className="text-xs text-gray-500">Available balance</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">$485 <span className="text-gray-600 font-normal">/ $800</span></p>
            <p className="text-[10px] text-gray-500">Monthly spent</p>
          </div>
        </div>
        <div className="h-2 bg-gray-300 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: "60.6%" }} />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">$500</p>
            <p className="text-[10px] text-gray-500">Emergency Fund</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">87%</p>
            <p className="text-[10px] text-gray-500">DIY Rate</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Member Contributions Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Member Contributions</h3>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {contributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 10, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {contributionData.map((member) => (
                <div key={member.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
                    <span className="text-xs text-gray-500">{member.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">{member.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Savings Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Monthly Savings</h3>
          <p className="text-xs text-gray-500 mb-3">Savings vs spending over time</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySavingsData}>
                <defs>
                  <linearGradient id="savingsGradientBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#111827" }} />
                <Area type="monotone" dataKey="savings" stroke="#2563EB" strokeWidth={2} fill="url(#savingsGradientBudget)" name="Saved" />
                <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} dot={false} name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" />Saved
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-red-500" />Spent
            </span>
          </div>
        </div>
      </div>

      {/* Recent Contributions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Recent Contributions</h3>
          <button
            onClick={() => setShowContributionHistory(true)}
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        </div>
        <div className="p-4 space-y-2">
          {contributionHistory.slice(0, 4).map((contrib) => (
            <div key={contrib.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <IoWallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{contrib.member}</p>
                  <p className="text-xs text-gray-500">{contrib.note}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">+${contrib.amount}</p>
                <p className="text-[10px] text-gray-600">{contrib.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
