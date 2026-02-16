"use client";

import { useState } from "react";
import {
  CalendarHeader,
  MonthGrid,
  WeekGrid,
  EventDetailModal,
  AddEventModal,
  CalendarSidebar,
  CalendarCharts,
  CalendarTabs,
  TimelineTab,
  RecurringTab,
  LinkedIssuesTab,
  TimelineSidebar,
  RecurringSidebar,
  LinkedIssuesSidebar,
  ViewMode,
  FilterType,
  EventType,
  extendedEvents,
  monthNamesShort,
  generateCalendarDays,
  getWeekStart,
  getWeekDays,
  type CalendarTab,
} from "./calendar";

export function CalendarView() {
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [activeTab, setActiveTab] = useState<CalendarTab>("calendar");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "diy" as EventType,
    notes: "",
    isRecurring: false,
    recurringPattern: "",
    location: "",
    reminder: "1 day before",
  });

  const todayDate = new Date();
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const isCurrentMonth = currentYear === todayDate.getFullYear() && currentMonth === todayDate.getMonth();
  const today = todayDate.getDate();
  const weekDaysDates = getWeekDays(currentWeekStart);

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
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  // Modal handlers
  const handleAddEvent = () => {
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
    });
  };

  const getSelectedEvent = () => extendedEvents.find((e) => e.id === showEventDetailModal);

  // Week display text
  const weekStart = getWeekStart(currentWeekStart);
  const weekEnd = weekDaysDates[6];
  const weekDisplayText = `${monthNamesShort[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNamesShort[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  const filterButtons: { id: FilterType; label: string; color: string }[] = [
    { id: "all", label: "All Events", color: "" },
    { id: "diy", label: "DIY", color: "bg-emerald-500" },
    { id: "contractor", label: "Pro Visits", color: "bg-blue-500" },
    { id: "reminder", label: "Reminders", color: "bg-amber-500" },
    { id: "income", label: "Income", color: "bg-green-500" },
    { id: "expense", label: "Expenses", color: "bg-red-500" },
  ];

  return (
    <div className="p-4 lg:p-5 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
      {/* Header - Only show for Calendar tab */}
      {activeTab === "calendar" && (
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
      )}

      {/* Tabs */}
      <CalendarTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Layout */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-4 lg:gap-5">
        {/* Main Content */}
        <div className="space-y-4 min-w-0">
          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <>
              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeFilter === filter.id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:bg-[#252525] hover:text-white"
                    }`}
                  >
                    {filter.color && <div className={`w-2 h-2 rounded-full ${filter.color}`} />}
                    {filter.label}
                  </button>
                ))}
              </div>

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
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onEventClick={setShowEventDetailModal}
                />
              )}

              {/* Charts */}
              <CalendarCharts />
            </>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && <TimelineTab />}

          {/* Recurring Tab */}
          {activeTab === "recurring" && <RecurringTab />}

          {/* Linked Issues Tab */}
          {activeTab === "linked" && <LinkedIssuesTab />}
        </div>

        {/* Sidebar - Contextual based on active tab */}
        <div className="min-w-0">
          {activeTab === "calendar" && <CalendarSidebar />}
          {activeTab === "timeline" && <TimelineSidebar />}
          {activeTab === "recurring" && <RecurringSidebar />}
          {activeTab === "linked" && <LinkedIssuesSidebar />}
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {openMenuId && (
        <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
      )}

      {/* Event Detail Modal */}
      <EventDetailModal event={getSelectedEvent()} onClose={() => setShowEventDetailModal(null)} />

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        newEvent={newEvent}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddEvent}
        onChange={setNewEvent}
      />
    </div>
  );
}
