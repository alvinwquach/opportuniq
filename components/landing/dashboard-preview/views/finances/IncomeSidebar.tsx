"use client";

import {
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoAddCircleOutline,
} from "react-icons/io5";
import { IncomeStream, frequencyLabels } from "./types";

interface IncomeSidebarProps {
  incomeStreams: IncomeStream[];
  monthlyIncome: number;
  onAddIncome: () => void;
}

export function IncomeSidebar({
  incomeStreams,
  monthlyIncome,
  onAddIncome,
}: IncomeSidebarProps) {
  const activeStreams = incomeStreams.filter(s => s.isActive).length;
  const primaryIncome = incomeStreams.find(s => s.source.toLowerCase().includes("salary") || s.source.toLowerCase().includes("primary"));
  const primaryPercent = primaryIncome
    ? Math.round((primaryIncome.amount / monthlyIncome) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Income Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Monthly Total</h3>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            ${monthlyIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            From {activeStreams} active source{activeStreams !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Primary Income</span>
            <span className="text-sm font-semibold text-gray-900">{primaryPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${primaryPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Secondary Income</span>
            <span className="text-sm font-semibold text-gray-900">{100 - primaryPercent}%</span>
          </div>
        </div>
      </div>

      {/* Income Sources */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Sources</h3>
        <div className="space-y-2">
          {incomeStreams.slice(0, 4).map((stream) => (
            <div
              key={stream.id}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <IoTrendingUpOutline className="w-3.5 h-3.5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-900">{stream.source}</p>
                  <p className="text-[9px] text-gray-500">{frequencyLabels[stream.frequency]}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-blue-600">
                ${stream.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <button
          onClick={onAddIncome}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <IoAddCircleOutline className="w-4 h-4" />
          Add Income Source
        </button>
      </div>
    </div>
  );
}
