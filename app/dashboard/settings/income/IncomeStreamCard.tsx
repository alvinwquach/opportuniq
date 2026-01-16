"use client";

import { IoTrash, IoCheckmark, IoClose, IoPencil } from "react-icons/io5";
import type { IncomeFrequency } from "./actions/types";
import type { DecryptedIncomeStream } from "@/hooks/useEncryptedFinancials";

const FREQUENCY_LABELS: Record<IncomeFrequency, string> = {
  weekly: "Weekly",
  bi_weekly: "Bi-weekly",
  semi_monthly: "Semi-monthly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  one_time: "One-time",
};

interface IncomeStreamCardProps {
  stream: DecryptedIncomeStream;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  isPending: boolean;
  variant?: "active" | "inactive";
}

export function IncomeStreamCard({
  stream,
  onEdit,
  onDelete,
  onToggleActive,
  isPending,
  variant = "active",
}: IncomeStreamCardProps) {
  const frequencyLabel = FREQUENCY_LABELS[stream.frequency as IncomeFrequency] || stream.frequency;

  return (
    <div
      className={
        variant === "active"
          ? "p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]"
          : "p-4 rounded-xl bg-[#111] border border-[#1a1a1a] opacity-60"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-white">{stream.source}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#666]">
              {frequencyLabel}
            </span>
            {stream.frequency === "one_time" && stream.startDate && (
              <span className="text-[10px] text-[#555]">
                {new Date(stream.startDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-lg font-semibold text-[#5eead4]">
            ${stream.amount.toLocaleString()}
            {stream.frequency !== "one_time" && (
              <span className="text-xs text-[#666] font-normal ml-1">
                /{frequencyLabel.toLowerCase().replace("-", " ")}
              </span>
            )}
          </p>
          {stream.description && (
            <p className="text-xs text-[#555] mt-1">{stream.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleActive}
            disabled={isPending}
            className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-[#1f1f1f] transition-colors"
            title={stream.isActive ? "Mark as inactive" : "Mark as active"}
          >
            {stream.isActive ? (
              <IoCheckmark className="w-4 h-4 text-[#5eead4]" />
            ) : (
              <IoClose className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onEdit}
            disabled={isPending}
            className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          >
            <IoPencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <IoTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
