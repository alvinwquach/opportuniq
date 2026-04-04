"use client";

import {
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
  Line,
} from "recharts";
import { IoDownloadOutline, IoTrendingUp, IoCart, IoCheckmarkCircle } from "react-icons/io5";

interface BudgetCategory {
  category: string;
  amount: number;
  color: string;
}

interface SavingsData {
  month: string;
  savings: number;
  diy: number;
}

interface ShoppingItem {
  id: string;
  productName: string;
  storeName: string;
  estimatedCost: number;
  inStock: boolean;
}

interface FinancesTabProps {
  budgetCategories: BudgetCategory[];
  savingsOverTime: SavingsData[];
  shoppingList: ShoppingItem[];
  totalSpent: number;
  budget: number;
  totalSavings: number;
}

export function FinancesTab({
  budgetCategories,
  savingsOverTime,
  shoppingList,
  totalSpent,
  budget,
  totalSavings,
}: FinancesTabProps) {
  const remaining = budget - totalSpent;
  const percentUsed = (totalSpent / budget) * 100;

  return (
    <>
      {/* Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Monthly Budget</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">${totalSpent}</span>
            <span className="text-xs text-gray-500">/ ${budget}</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">${remaining} remaining</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Saved</p>
          <div className="flex items-center gap-2">
            <IoTrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-blue-600">${totalSavings.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">From DIY repairs</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">DIY Success Rate</p>
          <div className="flex items-center gap-2">
            <IoCheckmarkCircle className="w-5 h-5 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">92%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">12 successful repairs</p>
        </div>
      </div>

      {/* Spending by Category Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Spending by Category</h3>
          <button className="p-1 text-gray-500 hover:text-gray-900 transition-colors">
            <IoDownloadOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <div className="h-32 sm:h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={budgetCategories}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fontSize: 9, fill: "#888" }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#888" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={35}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#111827" }}
                formatter={(value: number) => [`$${value}`]}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={20}>
                {budgetCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Savings Over Time</h3>
          <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px]">
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
              Total
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600" />
              DIY
            </span>
          </div>
        </div>
        <div className="h-32 sm:h-40">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={savingsOverTime}
              margin={{ top: 5, right: 5, bottom: 15, left: 30 }}
            >
              <defs>
                <linearGradient id="savingsGradientFinances" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: "#888" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#888" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={30}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#111827" }}
                formatter={(value: number) => [`$${value}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#savingsGradientFinances)"
              />
              <Line
                type="monotone"
                dataKey="diy"
                stroke="#249361"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shopping List */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-medium text-gray-900">Shopping List</h3>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500">{shoppingList.length} items</span>
        </div>
        <div className="space-y-2">
          {shoppingList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-white"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-[10px] text-gray-500">{item.storeName}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-gray-900">${item.estimatedCost.toFixed(2)}</span>
                {item.inStock && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                    In Stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">Estimated Total</span>
          <span className="text-sm font-semibold text-gray-900">
            ${shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </>
  );
}
