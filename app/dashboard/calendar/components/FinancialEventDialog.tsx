"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IoCash, IoWallet, IoCalendar, IoRepeat } from "react-icons/io5";
import type { IncomeEvent, ExpenseEvent } from "../actions";
import { formatFrequency } from "../utils";

interface FinancialEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    type: "income" | "user_expense" | "group_expense";
    data: IncomeEvent | ExpenseEvent;
  } | null;
}

export function FinancialEventDialog({
  open,
  onOpenChange,
  event,
}: FinancialEventDialogProps) {
  if (!event) return null;

  const isIncome = event.type === "income";
  const isUserExpense = event.type === "user_expense";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-50 border-gray-200 sm:max-w-md">
        {isIncome ? (
          <IncomeContent data={event.data as IncomeEvent} />
        ) : (
          <ExpenseContent
            data={event.data as ExpenseEvent}
            isUserExpense={isUserExpense}
          />
        )}

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IncomeContent({ data }: { data: IncomeEvent }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
            <IoCash className="w-4 h-4 text-[#10B981]" />
          </div>
          {data.source}
        </DialogTitle>
        <DialogDescription className="text-gray-500">Income</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-gray-500">Amount</span>
          <span className="text-[#10B981] font-semibold text-lg">
            ${parseFloat(data.amount).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-500">
          <IoRepeat className="w-4 h-4" />
          <span className="capitalize">{formatFrequency(data.frequency)}</span>
        </div>

        {data.description && (
          <p className="text-sm text-gray-500">{data.description}</p>
        )}
      </div>
    </>
  );
}

function ExpenseContent({
  data,
  isUserExpense,
}: {
  data: ExpenseEvent;
  isUserExpense: boolean;
}) {
  const colorClass = isUserExpense ? "text-[#EF4444]" : "text-[#F59E0B]";
  const bgClass = isUserExpense ? "bg-[#EF4444]/20" : "bg-[#F59E0B]/20";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              bgClass
            )}
          >
            <IoWallet className={cn("w-4 h-4", colorClass)} />
          </div>
          {data.category}
        </DialogTitle>
        <DialogDescription className="text-gray-500">
          {isUserExpense
            ? "Personal Expense"
            : `Group Expense • ${data.groupName}`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-gray-500">Amount</span>
          <span className={cn("font-semibold text-lg", colorClass)}>
            ${parseFloat(data.amount).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-500">
          <IoCalendar className="w-4 h-4" />
          <span>{format(new Date(data.date), "MMMM d, yyyy")}</span>
        </div>

        {data.isRecurring && data.recurringFrequency && (
          <div className="flex items-center gap-3 text-gray-500">
            <IoRepeat className="w-4 h-4" />
            <span className="capitalize">
              Recurring • {formatFrequency(data.recurringFrequency)}
            </span>
          </div>
        )}

        {data.description && (
          <p className="text-sm text-gray-500">{data.description}</p>
        )}
      </div>
    </>
  );
}
