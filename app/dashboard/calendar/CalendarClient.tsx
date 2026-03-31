// Tell React and Next.js to run this component in the browser (client-side).
// Without this, hooks like useState/useMemo wouldn't work.
"use client";

// useState  = track pieces of UI state that cause a re-render when changed
//             (current month/year, view mode, active filter, modal open/close, drag state, etc.).
// useMemo   = cache expensive computed values (filtered events, calendar day grid)
//             so they only recalculate when their inputs change.
import { useState, useMemo } from "react";

// useCalendarPageData = TanStack Query hook that fetches all calendar data for the
// current year+month from the server. Returns { data, isLoading, error }.
import { useCalendarPageData } from "@/lib/hooks";

// TypeScript types for this page's local data shapes.
// ViewMode        = "month" | "week"
// FilterType      = "all" | "diy" | "contractor" | "reminder" | "income" | "expense"
// CalendarDay     = { date: number; events: CalendarEvent[]; isOtherMonth: boolean }
// CalendarEvent   = the display shape of a single event on the calendar
// NewEventFormData = shape of the form data in the "Add Event" modal
import type { ViewMode, FilterType, CalendarDay, CalendarEvent, NewEventFormData } from "./types";

// Import every presentational sub-component used on this page.
// CalendarSkeleton      = loading placeholder shown while data is fetching.
// CalendarEmptyState    = message shown when there are no events at all.
// CalendarHeader        = top bar with month/year display, navigation arrows, view toggle, and "Add Event" button.
// MonthGrid             = the main 6-week calendar grid (month view).
// WeekGrid              = the 7-column week view.
// CalendarSidebar       = right panel with stats, upcoming events, and event type legend.
// CalendarCharts        = charts below the calendar (event type distribution, weekly activity, monthly comparison).
// EventDetailModal      = dialog showing full details of a clicked event.
// AddEventModal         = dialog with a form to create a new event.
import {
  CalendarSkeleton,
  CalendarEmptyState,
  CalendarHeader,
  MonthGrid,
  WeekGrid,
  CalendarSidebar,
  CalendarCharts,
  EventDetailModal,
  AddEventModal,
} from "./components";

// Short month names used to build the week-range display text (e.g. "Jan 6 - Jan 12, 2025").
const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// The set of filter buttons rendered below the calendar header.
// Each button has an id (used for the activeFilter comparison) and a display label.
const filterButtons: { id: FilterType; label: string }[] = [
  { id: "all",        label: "All Events" },
  { id: "diy",        label: "DIY" },
  { id: "contractor", label: "Pro Visits" },
  { id: "reminder",   label: "Reminders" },
  { id: "income",     label: "Income" },
  { id: "expense",    label: "Expenses" },
];

// CalendarClient is the page-level shell for the Calendar section.
// It owns all data fetching, UI state (navigation, filters, modals, drag-and-drop),
// and passes derived data down to presentational components.
export function CalendarClient() {
  // The year currently displayed. Initialized to the current calendar year.
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  // The zero-indexed month currently displayed (0 = January, 11 = December).
  // Initialized to the current calendar month.
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  // The Date object representing the first day (Sunday) of the displayed week.
  // null = default to the current week (calculated on the fly).
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);

  // Whether to show the month grid ("month") or the 7-column week grid ("week").
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // Which event type filter is active. "all" means show every event.
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Whether the "Add Event" modal is currently open.
  const [showAddModal, setShowAddModal] = useState(false);

  // The ID of the event whose detail modal is open, or null if no modal is open.
  const [showEventDetailModal, setShowEventDetailModal] = useState<string | null>(null);

  // The ID of the event whose context menu (three-dot menu) is open, or null.
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // The ID of the event currently being dragged, or null if no drag is in progress.
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);

  // The date number (1-31) the user is currently dragging an event over, or null.
  // Used to highlight the target cell during a drag.
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);

  // Form state for the "Add Event" modal. Starts with empty/default field values.
  const [newEvent, setNewEvent] = useState<NewEventFormData>({
    title: "",
    date: "",
    time: "",
    type: "diy",
    notes: "",
    isRecurring: false,
    recurringPattern: "",
    location: "",
    reminder: "1 day before",
    estimatedCost: "",
    linkedIssueId: "",
  });

  // Snapshot of "today" used for comparisons (is it the current month? what date is today?).
  // Defined outside hooks so it doesn't change between renders.
  const todayDate = new Date();

  // Fetch calendar events, stats, and chart data for the currently displayed month/year.
  // Passing currentYear and currentMonth means the hook re-fetches whenever the user
  // navigates to a different month.
  const { data, isLoading, error } = useCalendarPageData(currentYear, currentMonth);

  // True only when the displayed month/year matches the actual current month/year.
  // Used to show/hide the "Today" button (no point showing it if we're already on today's month).
  const isCurrentMonth =
    currentYear === todayDate.getFullYear() &&
    currentMonth === todayDate.getMonth();

  // Today's date number (1-31) used to highlight the "today" cell in the month grid.
  const today = todayDate.getDate();

  // Calculate the Sunday that starts the given week.
  // If weekStart is null, use the current week's Sunday.
  const getWeekStart = (weekStart: Date | null): Date => {
    if (weekStart) return weekStart;
    // dayOfWeek = 0 (Sunday) through 6 (Saturday).
    const dayOfWeek = todayDate.getDay();
    const start = new Date(todayDate);
    // Subtract the day-of-week offset to land on the preceding Sunday.
    start.setDate(todayDate.getDate() - dayOfWeek);
    return start;
  };

  // Build an array of 7 Date objects (Sun through Sat) for the given week.
  // Used by WeekGrid to render the column headers.
  const getWeekDays = (weekStart: Date | null): Date[] => {
    const start = getWeekStart(weekStart);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      // Add i days to the start date to get each day of the week.
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // The 7 Date objects for the currently displayed week; recalculated when currentWeekStart changes.
  const weekDaysDates = getWeekDays(currentWeekStart);

  // The Sunday starting the currently displayed week.
  const weekStart = getWeekStart(currentWeekStart);
  // The Saturday ending the currently displayed week (last element of the 7-day array).
  const weekEnd = weekDaysDates[6];
  // Human-readable week range string, e.g. "Jan 6 - Jan 12, 2025".
  const weekDisplayText = `${monthNamesShort[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNamesShort[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  // Apply the active filter to the fetched events array.
  // useMemo caches the result so filtering only reruns when events or the filter changes.
  const filteredEvents = useMemo(() => {
    // If data hasn't loaded yet, return an empty array.
    if (!data?.events) return [];
    // "all" means no filter: return every event.
    if (activeFilter === "all") return data.events;
    // Otherwise, keep only events whose type matches the active filter.
    return data.events.filter((e) => e.type === activeFilter);
  }, [data?.events, activeFilter]);

  // Build the full 42-cell (6 rows × 7 columns) array of CalendarDay objects for the month grid.
  // useMemo caches this so the grid only recalculates when the month, year, or filtered events change.
  const calendarDays = useMemo((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    // What day of the week does the 1st of the month fall on? (0 = Sunday)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // How many days are in the current month?
    // Trick: day 0 of the NEXT month = the last day of the current month.
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // How many days are in the previous month? Used to fill the leading "ghost" cells.
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Fill the leading cells with tail-end days of the previous month.
    // These are greyed out (isOtherMonth: true) and have no events.
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: daysInPrevMonth - i, events: [], isOtherMonth: true });
    }

    // Fill the main cells with the actual days of the current month.
    for (let date = 1; date <= daysInMonth; date++) {
      // Find every filtered event that falls on this specific date.
      const dayEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === date &&
          eventDate.getMonth() === currentMonth &&
          eventDate.getFullYear() === currentYear
        );
      });
      days.push({
        date,
        events: dayEvents as CalendarEvent[],
        isOtherMonth: false,
      });
    }

    // Fill the trailing cells with leading days of the next month so the grid
    // always has exactly 42 cells (a complete 6-row calendar).
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      days.push({ date, events: [], isOtherMonth: true });
    }

    return days;
  }, [currentYear, currentMonth, filteredEvents]);

  // Navigate one month backwards. When on January (month 0), wrap to December of the previous year.
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate one month forwards. When on December (month 11), wrap to January of the next year.
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Navigate one week backwards by subtracting 7 days from the current week start.
  const goToPrevWeek = () => {
    const current = getWeekStart(currentWeekStart);
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  // Navigate one week forwards by adding 7 days to the current week start.
  const goToNextWeek = () => {
    const current = getWeekStart(currentWeekStart);
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  // Jump back to the current date: reset month, year, and week to today's values.
  const goToToday = () => {
    setCurrentYear(todayDate.getFullYear());
    setCurrentMonth(todayDate.getMonth());
    // Also reset the week view to the current week.
    const dayOfWeek = todayDate.getDay();
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() - dayOfWeek);
    setCurrentWeekStart(weekStart);
  };

  // Jump to a specific month and year, used by the year picker in the header.
  const goToMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // Drag-and-drop handlers for rescheduling events by dragging them on the calendar.
  // Record which event started being dragged.
  const handleDragStart = (eventId: string) => setDraggedEvent(eventId);

  // While dragging over a day cell, highlight it and prevent the default browser behavior.
  const handleDragOver = (e: React.DragEvent, date: number) => {
    e.preventDefault(); // Required to allow the drop to fire.
    setDragOverDate(date);
  };

  // When the drag leaves a cell, remove the highlight.
  const handleDragLeave = () => setDragOverDate(null);

  // When the event is dropped on a cell, record the move (TODO: call a mutation).
  const handleDrop = (e: React.DragEvent, date: number) => {
    e.preventDefault();
    if (draggedEvent) {
      console.log(`Moving event ${draggedEvent} to date ${date}`);
      // TODO: Implement event move via mutation
    }
    // Reset drag state regardless of whether the move succeeded.
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  // Handle the user submitting the "Add Event" form.
  // TODO: send the newEvent data to the server via a mutation.
  const handleAddEvent = () => {
    // TODO: Implement create event mutation
    setShowAddModal(false);
    // Reset the form back to empty defaults for the next time the modal opens.
    setNewEvent({
      title: "",
      date: "",
      time: "",
      type: "diy",
      notes: "",
      isRecurring: false,
      recurringPattern: "",
      location: "",
      reminder: "1 day before",
      estimatedCost: "",
      linkedIssueId: "",
    });
  };

  // Find the full event object for the currently open detail modal, or null if none.
  const getSelectedEvent = () =>
    data?.events.find((e) => e.id === showEventDetailModal) ?? null;

  // Guard: while the server request is in flight, show the skeleton placeholder.
  if (isLoading) {
    return <CalendarSkeleton />;
  }

  // Guard: if the server request failed, show a centered error message.
  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading calendar</p>
          {/* Show the specific error message so the user knows what went wrong. */}
          <p className="text-sm text-[#666]">{error.message}</p>
        </div>
      </div>
    );
  }

  // Guard: if data loaded but there are no events yet, show the empty state with
  // a CTA to add the first event. The AddEventModal is also rendered here so
  // the CTA button can open it.
  if (!data || data.events.length === 0) {
    return (
      <>
        <CalendarEmptyState onAddEvent={() => setShowAddModal(true)} />
        <AddEventModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEvent}
          newEvent={newEvent}
          onChange={setNewEvent}
        />
      </>
    );
  }

  // Happy path: data loaded and events exist — render the full calendar page.
  return (
    <>
      <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Top navigation bar: month/year display, prev/next/today buttons,
            view mode toggle (month/week), and "Add Event" button. */}
        <CalendarHeader
          currentYear={currentYear}
          currentMonth={currentMonth}
          viewMode={viewMode}
          isCurrentMonth={isCurrentMonth}
          weekDisplayText={weekDisplayText}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
          onGoToToday={goToToday}
          onGoToMonth={goToMonth}
          onViewModeChange={setViewMode}
          onAddEvent={() => setShowAddModal(true)}
          setCurrentYear={setCurrentYear}
        />

        {/* Filter chips row: "All Events", "DIY", "Pro Visits", "Reminders", "Income", "Expenses".
            Clicking a chip sets activeFilter, which re-derives filteredEvents via useMemo. */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {filterButtons.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                // Active filter chip gets the emerald highlight; others get the grey default.
                activeFilter === filter.id
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:bg-[#333]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Main layout: calendar + charts column (3/4 width) | sidebar (1/4 width) */}
        <div className="grid xl:grid-cols-4 gap-6">
          {/* Left/main column: calendar grid + analytics charts below it */}
          <div className="xl:col-span-3 space-y-6">
            {/* Month view: 6×7 grid of day cells with event dots/chips.
                Only rendered when viewMode is "month". */}
            {viewMode === "month" && (
              <MonthGrid
                calendarDays={calendarDays}
                today={today}
                isCurrentMonth={isCurrentMonth}
                draggedEvent={draggedEvent}
                dragOverDate={dragOverDate}
                openMenuId={openMenuId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                // Clicking an event chip opens the detail modal for that event's ID.
                onEventClick={setShowEventDetailModal}
                // Clicking the "..." menu toggles openMenuId for that event.
                onMenuToggle={setOpenMenuId}
              />
            )}

            {/* Week view: 7-column grid with time slots.
                Only rendered when viewMode is "week". */}
            {viewMode === "week" && (
              <WeekGrid
                weekDays={weekDaysDates}
                todayDate={todayDate}
                events={filteredEvents as CalendarEvent[]}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onEventClick={setShowEventDetailModal}
              />
            )}

            {/* Analytics charts section below the calendar grid.
                Receives pre-computed chart data from the server response. */}
            <CalendarCharts
              eventTypeDistribution={data.eventTypeDistribution}
              weeklyActivity={data.weeklyActivity}
              monthlyComparison={data.monthlyComparison}
            />
          </div>

          {/* Right sidebar column: quick stats, upcoming events, upcoming expenses, legend. */}
          <div className="xl:col-span-1">
            <CalendarSidebar
              monthStats={data.monthStats}
              upcomingEvents={data.upcomingEvents as CalendarEvent[]}
              upcomingExpenses={data.upcomingExpenses}
              totalUpcomingExpenses={data.totalUpcomingExpenses}
            />
          </div>
        </div>

        {/* Invisible full-screen overlay that captures clicks outside any open event menu.
            z-[9998] sits below the menu (z-50) but above everything else. */}
        {openMenuId && (
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpenMenuId(null)}
          />
        )}
      </div>

      {/* Event Detail Modal: shown when the user clicks on an event chip.
          getSelectedEvent() looks up the full event object from the data array.
          Passing null when no event is selected means the modal renders hidden. */}
      <EventDetailModal
        event={getSelectedEvent() as CalendarEvent | null}
        onClose={() => setShowEventDetailModal(null)}
        onEdit={() => {
          // TODO: Implement edit — for now just close the modal.
          setShowEventDetailModal(null);
        }}
        onDelete={() => {
          // TODO: Implement delete — for now just close the modal.
          setShowEventDetailModal(null);
        }}
      />

      {/* Add Event Modal: shown when the user clicks the "+ Add Event" button.
          newEvent is the controlled form state; onChange updates it field by field. */}
      <AddEventModal
        isOpen={showAddModal}
        newEvent={newEvent}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddEvent}
        onChange={setNewEvent}
      />
    </>
  );
}
