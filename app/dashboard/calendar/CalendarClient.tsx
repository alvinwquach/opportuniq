"use client";

import { useState, useMemo } from "react";
import { useCalendarPageData } from "@/lib/graphql/hooks";
import type { ViewMode, FilterType, CalendarDay, CalendarEvent, NewEventFormData } from "./types";
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

const filterButtons: { id: FilterType; label: string }[] = [
  { id: "all", label: "All Events" },
  { id: "diy", label: "DIY" },
  { id: "contractor", label: "Pro Visits" },
  { id: "reminder", label: "Reminders" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expenses" },
];

export function CalendarClient() {
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);
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

  // Fetch calendar data
  const { data, isLoading, error } = useCalendarPageData(currentYear, currentMonth);

  // Calculate derived values
  const isCurrentMonth =
    currentYear === todayDate.getFullYear() &&
    currentMonth === todayDate.getMonth();
  const today = todayDate.getDate();

  // Get week start
  const getWeekStart = (weekStart: Date | null): Date => {
    if (weekStart) return weekStart;
    const dayOfWeek = todayDate.getDay();
    const start = new Date(todayDate);
    start.setDate(todayDate.getDate() - dayOfWeek);
    return start;
  };

  // Get week days
  const getWeekDays = (weekStart: Date | null): Date[] => {
    const start = getWeekStart(weekStart);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDaysDates = getWeekDays(currentWeekStart);

  // Week display text
  const weekStart = getWeekStart(currentWeekStart);
  const weekEnd = weekDaysDates[6];
  const weekDisplayText = `${monthNamesShort[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNamesShort[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];
    if (activeFilter === "all") return data.events;
    return data.events.filter((e) => e.type === activeFilter);
  }, [data?.events, activeFilter]);

  // Generate calendar days for the month view
  const calendarDays = useMemo((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Add days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: daysInPrevMonth - i, events: [], isOtherMonth: true });
    }

    // Add days of the current month
    for (let date = 1; date <= daysInMonth; date++) {
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

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      days.push({ date, events: [], isOtherMonth: true });
    }

    return days;
  }, [currentYear, currentMonth, filteredEvents]);

  // Navigation handlers
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToPrevWeek = () => {
    const current = getWeekStart(currentWeekStart);
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToNextWeek = () => {
    const current = getWeekStart(currentWeekStart);
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const goToToday = () => {
    setCurrentYear(todayDate.getFullYear());
    setCurrentMonth(todayDate.getMonth());
    const dayOfWeek = todayDate.getDay();
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() - dayOfWeek);
    setCurrentWeekStart(weekStart);
  };

  const goToMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // Drag and drop handlers
  const handleDragStart = (eventId: string) => setDraggedEvent(eventId);
  const handleDragOver = (e: React.DragEvent, date: number) => {
    e.preventDefault();
    setDragOverDate(date);
  };
  const handleDragLeave = () => setDragOverDate(null);
  const handleDrop = (e: React.DragEvent, date: number) => {
    e.preventDefault();
    if (draggedEvent) {
      console.log(`Moving event ${draggedEvent} to date ${date}`);
      // TODO: Implement event move via mutation
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  // Modal handlers
  const handleAddEvent = () => {
    // TODO: Implement create event mutation
    setShowAddModal(false);
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

  const getSelectedEvent = () =>
    data?.events.find((e) => e.id === showEventDetailModal) ?? null;

  // Loading state
  if (isLoading) {
    return <CalendarSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading calendar</p>
          <p className="text-sm text-[#666]">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
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

  return (
    <>
      <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Header */}
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

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {filterButtons.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeFilter === filter.id
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:bg-[#333]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Main Layout - Calendar with Sidebar */}
        <div className="grid xl:grid-cols-4 gap-6">
          {/* Calendar + Charts Column */}
          <div className="xl:col-span-3 space-y-6">
            {/* Calendar Grid */}
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
                onEventClick={setShowEventDetailModal}
                onMenuToggle={setOpenMenuId}
              />
            )}

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

            {/* Charts - Below Calendar */}
            <CalendarCharts
              eventTypeDistribution={data.eventTypeDistribution}
              weeklyActivity={data.weeklyActivity}
              monthlyComparison={data.monthlyComparison}
            />
          </div>

          {/* Sidebar - Quick Reference */}
          <div className="xl:col-span-1">
            <CalendarSidebar
              monthStats={data.monthStats}
              upcomingEvents={data.upcomingEvents as CalendarEvent[]}
              upcomingExpenses={data.upcomingExpenses}
              totalUpcomingExpenses={data.totalUpcomingExpenses}
            />
          </div>
        </div>

        {/* Close menu when clicking outside */}
        {openMenuId && (
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpenMenuId(null)}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={getSelectedEvent() as CalendarEvent | null}
        onClose={() => setShowEventDetailModal(null)}
        onEdit={() => {
          // TODO: Implement edit
          setShowEventDetailModal(null);
        }}
        onDelete={() => {
          // TODO: Implement delete
          setShowEventDetailModal(null);
        }}
      />

      {/* Add Event Modal */}
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
