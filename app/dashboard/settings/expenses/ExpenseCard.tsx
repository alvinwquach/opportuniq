"use client";

import { IoTrash, IoRepeat, IoPencil } from "react-icons/io5";
import type { ExpenseFrequency } from "./actions/types";
import type { DecryptedExpense } from "@/hooks/useEncryptedFinancials";

const FREQUENCY_LABELS: Record<ExpenseFrequency, string> = {
  weekly: "Weekly",
  bi_weekly: "Bi-weekly",
  semi_monthly: "Semi-monthly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  one_time: "One-time",
};

interface ExpenseCardProps {
  expense: DecryptedExpense;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  isPending,
}: ExpenseCardProps) {
  const frequencyLabel = expense.isRecurring
    ? FREQUENCY_LABELS[expense.recurringFrequency as ExpenseFrequency] ||
      expense.recurringFrequency
    : "One-time";

  const formattedDate = new Date(expense.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-white">{expense.category}</h4>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                expense.isRecurring
                  ? "bg-[#f87171]/10 text-[#f87171]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {expense.isRecurring && <IoRepeat className="w-3 h-3" />}
              {frequencyLabel}
            </span>
          </div>
          <p className="text-lg font-semibold text-[#f87171]">
            ${expense.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {expense.isRecurring && frequencyLabel && (
              <span className="text-xs text-gray-500 font-normal ml-1">
                /{frequencyLabel.toLowerCase().replace("-", " ")}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400">{formattedDate}</p>
            {expense.description && (
              <>
                <span className="text-[#333]">·</span>
                <p className="text-xs text-gray-400 truncate">
                  {expense.description}
                </p>
              </>
            )}
          </div>
          {expense.isRecurring && expense.nextDueDate && (
            <p className="text-[10px] text-[#444] mt-1">
              Next:{" "}
              {new Date(expense.nextDueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            disabled={isPending}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <IoPencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <IoTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
