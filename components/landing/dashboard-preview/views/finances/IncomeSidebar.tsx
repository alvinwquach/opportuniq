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
      <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
        <h3 className="text-sm font-medium text-white mb-3">Monthly Total</h3>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">
            ${monthlyIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#666] mt-1">
            From {activeStreams} active source{activeStreams !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#888]">Primary Income</span>
            <span className="text-sm font-semibold text-white">{primaryPercent}%</span>
          </div>
          <div className="w-full bg-[#2a2a2a] rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${primaryPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#888]">Secondary Income</span>
            <span className="text-sm font-semibold text-white">{100 - primaryPercent}%</span>
          </div>
        </div>
      </div>

      {/* Income Sources */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Sources</h3>
        <div className="space-y-2">
          {incomeStreams.slice(0, 4).map((stream) => (
            <div
              key={stream.id}
              className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
            >
              <div className="flex items-center gap-2">
                <IoTrendingUpOutline className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <p className="text-xs text-white">{stream.source}</p>
                  <p className="text-[9px] text-[#666]">{frequencyLabels[stream.frequency]}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-400">
                ${stream.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
        <button
          onClick={onAddIncome}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
        >
          <IoAddCircleOutline className="w-4 h-4" />
          Add Income Source
        </button>
      </div>
    </div>
  );
}
