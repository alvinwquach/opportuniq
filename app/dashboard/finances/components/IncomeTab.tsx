"use client";

import { IoAdd, IoTrashOutline, IoPencilOutline, IoCheckmarkCircle } from "react-icons/io5";
import type { IncomeStream } from "../types";
import { frequencyLabels } from "../types";

interface IncomeTabProps {
  incomeStreams: IncomeStream[];
  monthlyIncome: number;
  onEdit?: (income: IncomeStream) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function IncomeTab({
  incomeStreams,
  monthlyIncome,
  onEdit,
  onDelete,
  onAdd,
}: IncomeTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#888] mb-1">Total Monthly Income</p>
            <p className="text-3xl font-bold text-emerald-400">
              ${monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#666] mt-1">
              From {incomeStreams.filter((s) => s.isActive).length} active source
              {incomeStreams.filter((s) => s.isActive).length !== 1 ? "s" : ""}
            </p>
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IoAdd className="w-4 h-4" />
              Add Income
            </button>
          )}
        </div>
      </div>

      {/* Income Streams List */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
        <div className="p-4 border-b border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-white">Income Sources</h3>
        </div>

        {incomeStreams.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#666] mb-4">No income sources added yet</p>
            {onAdd && (
              <button
                onClick={onAdd}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Add your first income source
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {incomeStreams.map((stream) => (
              <div
                key={stream.id}
                className="flex items-center justify-between p-4 hover:bg-[#0f0f0f] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      stream.isActive ? "bg-emerald-500/10" : "bg-[#333]"
                    }`}
                  >
                    <IoCheckmarkCircle
                      className={`w-5 h-5 ${stream.isActive ? "text-emerald-400" : "text-[#666]"}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{stream.source}</span>
                      {!stream.isActive && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#333] text-[#888] rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#666]">
                      {frequencyLabels[stream.frequency]}
                      {stream.description && ` • ${stream.description}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      ${stream.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-[#666]">
                      ${stream.monthlyEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(stream)}
                        className="p-2 text-[#666] hover:text-white hover:bg-[#333] rounded-lg transition-colors"
                      >
                        <IoPencilOutline className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(stream.id)}
                        className="p-2 text-[#666] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
