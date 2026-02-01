"use client";

import type { CalendarMonthStats } from "@/lib/graphql/types";
import type { CalendarEvent, UpcomingExpense } from "../types";

interface CalendarSidebarProps {
  monthStats: CalendarMonthStats;
  upcomingEvents: CalendarEvent[];
  upcomingExpenses: UpcomingExpense[];
  totalUpcomingExpenses: number;
}

export function CalendarSidebar({
  monthStats,
  upcomingEvents,
  upcomingExpenses,
  totalUpcomingExpenses,
}: CalendarSidebarProps) {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "contractor":
        return "bg-emerald-500";
      case "diy":
        return "bg-emerald-500";
      case "reminder":
        return "bg-amber-500";
      case "income":
        return "bg-emerald-500";
      case "expense":
        return "bg-red-500";
      default:
        return "bg-[#666]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">This Month</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Scheduled Events</span>
            <span className="text-sm font-semibold text-white">
              {monthStats.scheduledEvents}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Completed</span>
            <span className="text-sm font-semibold text-emerald-400">
              {monthStats.completedEvents}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Pro Visits</span>
            <span className="text-sm font-semibold text-emerald-400">
              {monthStats.proVisits}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">DIY Projects</span>
            <span className="text-sm font-semibold text-emerald-400">
              {monthStats.diyProjects}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Reminders</span>
            <span className="text-sm font-semibold text-amber-400">
              {monthStats.reminders}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Upcoming This Week
        </h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-[#666]">No upcoming events</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
              >
                <div
                  className={`w-1 h-10 rounded-full ${getEventTypeColor(event.type)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {event.title}
                  </p>
                  <p className="text-[10px] text-[#666] mt-0.5">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Expenses */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Upcoming Expenses
        </h3>
        {upcomingExpenses.length === 0 ? (
          <p className="text-xs text-[#666]">No upcoming expenses</p>
        ) : (
          <div className="space-y-3">
            {upcomingExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-1 h-8 rounded-full ${getEventTypeColor(expense.type)}`}
                  />
                  <div>
                    <p className="text-xs font-medium text-white">
                      {expense.title}
                    </p>
                    <p className="text-[10px] text-[#666]">{expense.date}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-red-400">
                  -${expense.amount.toFixed(0)}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between">
              <span className="text-xs text-[#666]">Total Upcoming</span>
              <span className="text-sm font-bold text-red-400">
                -${totalUpcomingExpenses.toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Event Types Legend */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">Event Types</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">DIY</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">Pro Visits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-[#888]">Reminders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-[#888]">Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
