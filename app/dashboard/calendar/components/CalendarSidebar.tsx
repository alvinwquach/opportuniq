// Tell React and Next.js to run this component in the browser (client-side).
// Even though this component has no hooks itself, "use client" is required because
// it renders inside a client component tree (CalendarClient.tsx).
"use client";

// CalendarMonthStats = TypeScript type for the summary stats of the current month
// (scheduledEvents, completedEvents, proVisits, diyProjects, reminders).
import type { CalendarMonthStats } from "@/lib/hooks/types";

// CalendarEvent   = the display shape of a single calendar event (id, title, date, type, etc.).
// UpcomingExpense = the shape of an upcoming cost item (id, title, amount, date, type).
import type { CalendarEvent, UpcomingExpense } from "../types";

// Props interface: defines every piece of data this component needs.
interface CalendarSidebarProps {
  // Aggregate stats for the currently displayed month (event counts by type).
  monthStats: CalendarMonthStats;
  // Events occurring in the next 7 days, used in the "Upcoming This Week" section.
  upcomingEvents: CalendarEvent[];
  // Cost items due in the near future, used in the "Upcoming Expenses" section.
  upcomingExpenses: UpcomingExpense[];
  // Pre-summed total of all upcoming expense amounts, shown at the bottom of that section.
  totalUpcomingExpenses: number;
}

// CalendarSidebar is a purely presentational component (no state, no data fetching).
// It receives all its data as props from CalendarClient and renders four stacked panels:
// 1. "This Month" quick stats
// 2. "Upcoming This Week" event list
// 3. "Upcoming Expenses" list
// 4. "Event Types" color legend
export function CalendarSidebar({
  monthStats,
  upcomingEvents,
  upcomingExpenses,
  totalUpcomingExpenses,
}: CalendarSidebarProps) {
  // Return a Tailwind background-color class for the colored left-border strip
  // shown on each event or expense row, based on the event/expense type.
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "contractor":
        // Professional contractor visits: emerald green (positive/productive).
        return "bg-emerald-500";
      case "diy":
        // DIY projects: also emerald green (same category as contractor for color purposes).
        return "bg-emerald-500";
      case "reminder":
        // Reminders: amber/yellow (attention-needed but not urgent).
        return "bg-amber-500";
      case "income":
        // Income events: emerald green (positive financial event).
        return "bg-emerald-500";
      case "expense":
        // Expense events: red (money going out — a warning color).
        return "bg-red-500";
      default:
        // Unknown types: neutral grey fallback.
        return "bg-[#666]";
    }
  };

  return (
    // space-y-6 adds consistent vertical spacing between the four panels.
    <div className="space-y-6">
      {/* ─── PANEL 1: THIS MONTH QUICK STATS ──────────────────── */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">This Month</h3>
        {/* Each row shows a stat label on the left and its value on the right. */}
        <div className="space-y-3">
          {/* Total events scheduled (regardless of completion status). */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Scheduled Events</span>
            <span className="text-sm font-semibold text-white">
              {monthStats.scheduledEvents}
            </span>
          </div>
          {/* Events that have already been marked as completed this month. */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Completed</span>
            {/* Emerald text to signal a positive/accomplished count. */}
            <span className="text-sm font-semibold text-emerald-400">
              {monthStats.completedEvents}
            </span>
          </div>
          {/* Number of professional contractor appointments scheduled this month. */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Pro Visits</span>
            <span className="text-sm font-semibold text-emerald-400">
              {monthStats.proVisits}
            </span>
          </div>
          {/* Number of DIY projects scheduled this month. */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">DIY Projects</span>
            <span className="text-sm font-semibold text-emerald-400">
              {monthStats.diyProjects}
            </span>
          </div>
          {/* Number of reminder events this month. Amber to draw attention. */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Reminders</span>
            <span className="text-sm font-semibold text-amber-400">
              {monthStats.reminders}
            </span>
          </div>
        </div>
      </div>

      {/* ─── PANEL 2: UPCOMING THIS WEEK ──────────────────────── */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Upcoming This Week
        </h3>
        {/* If there are no upcoming events, show a friendly placeholder message. */}
        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-[#666]">No upcoming events</p>
        ) : (
          <div className="space-y-3">
            {/* Render one row per upcoming event. */}
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
              >
                {/* Thin color-coded left border strip indicating the event type. */}
                <div
                  className={`w-1 h-10 rounded-full ${getEventTypeColor(event.type)}`}
                />
                <div className="flex-1 min-w-0">
                  {/* Event title; truncate prevents overflow on long titles. */}
                  <p className="text-xs font-medium text-white truncate">
                    {event.title}
                  </p>
                  {/* Pre-formatted date string (e.g. "Mon, Jan 6"). */}
                  <p className="text-[10px] text-[#666] mt-0.5">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── PANEL 3: UPCOMING EXPENSES ───────────────────────── */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Upcoming Expenses
        </h3>
        {/* If there are no upcoming expenses, show a friendly placeholder message. */}
        {upcomingExpenses.length === 0 ? (
          <p className="text-xs text-[#666]">No upcoming expenses</p>
        ) : (
          <div className="space-y-3">
            {/* Render one row per upcoming expense. */}
            {upcomingExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
              >
                <div className="flex items-center gap-2.5">
                  {/* Thin color-coded left border strip for the expense type. */}
                  <div
                    className={`w-1 h-8 rounded-full ${getEventTypeColor(expense.type)}`}
                  />
                  <div>
                    {/* Expense title. */}
                    <p className="text-xs font-medium text-white">
                      {expense.title}
                    </p>
                    {/* Due date for this expense. */}
                    <p className="text-[10px] text-[#666]">{expense.date}</p>
                  </div>
                </div>
                {/* Amount formatted as a negative number in red to signal money going out.
                    toFixed(0) rounds to the nearest dollar. */}
                <span className="text-xs font-semibold text-red-400">
                  -${expense.amount.toFixed(0)}
                </span>
              </div>
            ))}
            {/* Total row at the bottom: sums all upcoming expense amounts. */}
            <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between">
              <span className="text-xs text-[#666]">Total Upcoming</span>
              {/* Bold red total to make the financial impact clear. */}
              <span className="text-sm font-bold text-red-400">
                -${totalUpcomingExpenses.toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── PANEL 4: EVENT TYPES LEGEND ──────────────────────── */}
      {/* A color key explaining what each dot color means on the calendar. */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">Event Types</h3>
        {/* Two-column grid of color dot + label pairs. */}
        <div className="grid grid-cols-2 gap-2">
          {/* DIY: emerald dot */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">DIY</span>
          </div>
          {/* Pro Visits: emerald dot (same color as DIY) */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">Pro Visits</span>
          </div>
          {/* Reminders: amber/yellow dot */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-[#888]">Reminders</span>
          </div>
          {/* Income: emerald dot (same color as DIY/Pro) */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">Income</span>
          </div>
          {/* Expenses: red dot to signal money going out */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-[#888]">Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
