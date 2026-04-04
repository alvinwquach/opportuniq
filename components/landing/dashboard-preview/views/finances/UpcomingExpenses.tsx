"use client";

import { useState } from "react";
import { IoFlag, IoAlertCircle } from "react-icons/io5";
import { Expense } from "./types";
import { getUrgencyColor, getUrgencyLabel } from "./utils";

interface UpcomingExpensesProps {
  expenses: Expense[];
}

export function UpcomingExpenses({ expenses }: UpcomingExpensesProps) {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  const [now] = useState(() => Date.now());
  const upcomingBills = expenses
    .filter(e => e.isRecurring && e.nextDueDate)
    .sort((a, b) => (a.nextDueDate?.getTime() || 0) - (b.nextDueDate?.getTime() || 0));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoFlag className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-medium text-gray-900">Upcoming Bills</h3>
        </div>
        <span className="text-xs text-gray-500">Next 90 days</span>
      </div>

      {upcomingBills.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-6">No upcoming bills scheduled</p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200" />

          <div className="space-y-3">
            {upcomingBills.map((expense) => {
              const daysUntil = Math.ceil(((expense.nextDueDate?.getTime() || 0) - now) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntil <= 7;
              const isSoon = daysUntil <= 30;

              return (
                <div key={expense.id} className="flex items-start gap-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    isUrgent ? "bg-red-100 text-red-600" :
                    isSoon ? "bg-amber-100 text-amber-600" :
                    "bg-gray-200 text-gray-500"
                  }`}>
                    {isUrgent ? <IoAlertCircle className="w-3 h-3" /> : <IoFlag className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900">{expense.description}</p>
                      <span className="text-xs font-semibold text-gray-900">${expense.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-gray-500">
                        {expense.nextDueDate?.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isUrgent ? "bg-red-50 text-red-600" :
                        isSoon ? "bg-amber-50 text-amber-600" :
                        "bg-gray-200 text-gray-500"
                      }`}>
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                      </span>
                      {expense.urgency && expense.urgency !== 'normal' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getUrgencyColor(expense.urgency)}`}>
                          {getUrgencyLabel(expense.urgency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
