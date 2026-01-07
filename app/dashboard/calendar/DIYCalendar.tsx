"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { ScheduleEvent, IncomeEvent, ExpenseEvent } from "./actions";
import { useCalendarState } from "./useCalendarState";
import {
  ViewScheduleDialog,
  FinancialEventDialog,
  CreateScheduleDialog,
} from "./components";

interface DIYCalendarProps {
  initialSchedules: ScheduleEvent[];
  userIssues: {
    id: string;
    title: string;
    status: string;
    priority: string;
    groupId: string;
    groupName: string;
  }[];
  incomeEvents: IncomeEvent[];
  userExpenses: ExpenseEvent[];
  groupExpenses: ExpenseEvent[];
}

export function DIYCalendar({
  initialSchedules,
  userIssues,
  incomeEvents,
  userExpenses,
  groupExpenses,
}: DIYCalendarProps) {
  const {
    calendarRef,
    calendarEvents,
    headerToolbar,
    isLoading,
    selectedEvent,
    selectedFinancialEvent,
    isCreateDialogOpen,
    isViewDialogOpen,
    isFinancialDialogOpen,
    formData,
    groupMembers,
    currentUserMemberId,
    setIsCreateDialogOpen,
    setIsViewDialogOpen,
    setIsFinancialDialogOpen,
    handleDateSelect,
    handleEventClick,
    handleEventDrop,
    handleCreateSchedule,
    handleDeleteSchedule,
    toggleParticipant,
    updateFormData,
  } = useCalendarState(
    initialSchedules,
    userIssues,
    incomeEvents,
    userExpenses,
    groupExpenses
  );

  return (
    <div className="h-full">
      <CalendarStyles />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={headerToolbar}
        events={calendarEvents}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={3}
        weekends={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        editable={true}
        height="auto"
        contentHeight="auto"
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
      />

      <CreateScheduleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        onFormChange={updateFormData}
        onSubmit={handleCreateSchedule}
        onToggleParticipant={toggleParticipant}
        userIssues={userIssues}
        groupMembers={groupMembers}
        currentUserMemberId={currentUserMemberId}
        isLoading={isLoading}
      />

      <ViewScheduleDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        event={selectedEvent}
        onDelete={handleDeleteSchedule}
        isLoading={isLoading}
      />

      <FinancialEventDialog
        open={isFinancialDialogOpen}
        onOpenChange={setIsFinancialDialogOpen}
        event={selectedFinancialEvent}
      />
    </div>
  );
}

function CalendarStyles() {
  return (
    <style jsx global>{`
      .fc {
        --fc-border-color: #1f1f1f;
        --fc-button-bg-color: #1f1f1f;
        --fc-button-border-color: #1f1f1f;
        --fc-button-hover-bg-color: #2a2a2a;
        --fc-button-hover-border-color: #2a2a2a;
        --fc-button-active-bg-color: #00d4ff;
        --fc-button-active-border-color: #00d4ff;
        --fc-page-bg-color: #0c0c0c;
        --fc-neutral-bg-color: #161616;
        --fc-list-event-hover-bg-color: #1f1f1f;
        --fc-today-bg-color: rgba(0, 212, 255, 0.1);
        --fc-event-bg-color: #00d4ff;
        --fc-event-border-color: #00d4ff;
        --fc-event-text-color: #000;
        font-family: inherit;
      }

      .fc .fc-toolbar-title {
        color: #fff;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .fc .fc-button {
        color: #888;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
      }

      .fc .fc-button:hover {
        color: #fff;
      }

      .fc .fc-button-active {
        color: #000 !important;
      }

      .fc .fc-col-header-cell-cushion,
      .fc .fc-daygrid-day-number,
      .fc .fc-list-day-text,
      .fc .fc-list-day-side-text {
        color: #888;
      }

      .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
        color: #00d4ff;
        font-weight: 600;
      }

      .fc .fc-timegrid-slot-label-cushion,
      .fc .fc-timegrid-axis-cushion {
        color: #666;
      }

      .fc .fc-event {
        border-radius: 4px;
        padding: 2px 4px;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .fc .fc-event:hover {
        opacity: 0.9;
      }

      .fc .fc-daygrid-event-dot {
        border-color: currentColor;
      }

      .fc .fc-list-event-title {
        color: #fff;
      }

      .fc .fc-list-event-time {
        color: #888;
      }

      .fc-theme-standard td,
      .fc-theme-standard th {
        border-color: #1f1f1f;
      }

      .fc .fc-scrollgrid {
        border-color: #1f1f1f;
      }

      .fc .fc-list-empty {
        background-color: #161616;
      }

      .fc .fc-list-empty-cushion {
        color: #666;
      }
    `}</style>
  );
}
