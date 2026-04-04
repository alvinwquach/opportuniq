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
      <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Monthly Income</p>
            <p className="text-3xl font-bold text-blue-600">
              ${monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              From {incomeStreams.filter((s) => s.isActive).length} active source
              {incomeStreams.filter((s) => s.isActive).length !== 1 ? "s" : ""}
            </p>
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              <IoAdd className="w-4 h-4" />
              Add Income
            </button>
          )}
        </div>
      </div>

      {/* Income Streams List */}
      <div className="bg-gray-100 rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-white">Income Sources</h3>
        </div>

        {incomeStreams.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 mb-4">No income sources added yet</p>
            {onAdd && (
              <button
                onClick={onAdd}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
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
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      stream.isActive ? "bg-blue-50" : "bg-[#333]"
                    }`}
                  >
                    <IoCheckmarkCircle
                      className={`w-5 h-5 ${stream.isActive ? "text-blue-600" : "text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{stream.source}</span>
                      {!stream.isActive && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#333] text-gray-500 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
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
                    <div className="text-xs text-gray-500">
                      ${stream.monthlyEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(stream)}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-[#333] rounded-lg transition-colors"
                      >
                        <IoPencilOutline className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(stream.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
