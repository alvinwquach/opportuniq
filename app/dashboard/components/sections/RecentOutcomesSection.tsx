"use client";

import { IoLocate, IoCheckmarkCircle, IoAlertCircle, IoBulb } from "react-icons/io5";

interface Outcome {
  issueTitle: string;
  success: boolean;
  optionType: string;
  actualCost: number | null;
  costDelta: number | null;
  lessonsLearned: string | null;
}

interface RecentOutcomesSectionProps {
  outcomes: Outcome[];
}

export function RecentOutcomesSection({ outcomes }: RecentOutcomesSectionProps) {
  if (outcomes.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <IoLocate className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-medium text-white">Recent Outcomes</h3>
      </div>
      <div className="space-y-3">
        {outcomes.slice(0, 3).map((outcome, index) => (
          <div key={index} className="p-2.5 -mx-1 rounded-lg bg-gray-100">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-900 truncate flex-1">{outcome.issueTitle}</p>
              {outcome.success ? (
                <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 ml-2" />
              ) : (
                <IoAlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-2" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span
                className={`px-1.5 py-0.5 rounded ${
                  outcome.optionType === "diy"
                    ? "bg-blue-50 text-blue-600"
                    : outcome.optionType === "hire"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {outcome.optionType.toUpperCase()}
              </span>
              {outcome.actualCost && (
                <span className="text-[#a3a3a3]">${outcome.actualCost.toLocaleString()}</span>
              )}
              {outcome.costDelta !== null && outcome.costDelta !== 0 && (
                <span className={outcome.costDelta > 0 ? "text-red-400" : "text-green-400"}>
                  {outcome.costDelta > 0 ? "+" : ""}${outcome.costDelta.toLocaleString()}
                </span>
              )}
            </div>
            {outcome.lessonsLearned && (
              <div className="mt-2 flex items-start gap-1.5">
                <IoBulb className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#a3a3a3] line-clamp-2">
                  {outcome.lessonsLearned}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
