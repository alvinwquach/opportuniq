"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import { format } from "date-fns";
import type { ScheduleEvent, IncomeEvent, ExpenseEvent } from "./actions";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getGroupMembersForScheduling,
} from "./actions";
import { getEventColor, generateRecurringDates, getResponsiveCalendarConfig } from "./utils";

interface UserIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
  groupId: string;
  groupName: string;
}

interface GroupMember {
  memberId: string;
  userId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  extendedProps: {
    type: "diy" | "income" | "user_expense" | "group_expense";
    schedule?: ScheduleEvent;
    data?: IncomeEvent | ExpenseEvent;
  };
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
}

export function useCalendarState(
  initialSchedules: ScheduleEvent[],
  userIssues: UserIssue[],
  incomeEvents: IncomeEvent[],
  userExpenses: ExpenseEvent[],
  groupExpenses: ExpenseEvent[]
) {
  const calendarRef = useRef<FullCalendar>(null);
  const [schedules, setSchedules] = useState<ScheduleEvent[]>(initialSchedules);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedFinancialEvent, setSelectedFinancialEvent] = useState<{
    type: "income" | "user_expense" | "group_expense";
    data: IncomeEvent | ExpenseEvent;
  } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Toolbar state for responsive view
  const [headerToolbar, setHeaderToolbar] = useState({
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  });

  // Form state for creating schedules
  const [formData, setFormData] = useState({
    issueId: "",
    scheduledTime: "",
    estimatedDuration: 60,
    participants: [] as string[],
  });

  // Group members for participant selection
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserMemberId, setCurrentUserMemberId] = useState<string>("");

  // Generate calendar events
  const calendarEvents = useCallback((): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // DIY schedule events
    schedules.forEach((schedule) => {
      events.push({
        id: schedule.id,
        title: schedule.issueTitle,
        start: new Date(schedule.scheduledTime),
        end: schedule.estimatedDuration
          ? new Date(new Date(schedule.scheduledTime).getTime() + schedule.estimatedDuration * 60000)
          : new Date(new Date(schedule.scheduledTime).getTime() + 60 * 60000),
        extendedProps: {
          type: "diy",
          schedule,
        },
        backgroundColor: getEventColor(schedule.groupName),
        borderColor: getEventColor(schedule.groupName),
      });
    });

    // Income events
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfRange = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    incomeEvents.forEach((income) => {
      const baseDate = income.startDate ? new Date(income.startDate) : startOfMonth;
      const dates = generateRecurringDates(baseDate, income.frequency, startOfMonth, endOfRange);

      dates.forEach((date, index) => {
        events.push({
          id: `income-${income.id}-${index}`,
          title: `💰 ${income.source}: $${parseFloat(income.amount).toLocaleString()}`,
          start: date,
          allDay: true,
          extendedProps: {
            type: "income",
            data: income,
          },
          backgroundColor: "#10B981",
          borderColor: "#10B981",
          textColor: "#fff",
        });
      });
    });

    // User expenses
    userExpenses.forEach((expense) => {
      if (expense.isRecurring && expense.recurringFrequency) {
        const baseDate = expense.nextDueDate ? new Date(expense.nextDueDate) : new Date(expense.date);
        const dates = generateRecurringDates(baseDate, expense.recurringFrequency, startOfMonth, endOfRange);

        dates.forEach((date, index) => {
          events.push({
            id: `user-expense-${expense.id}-${index}`,
            title: `💸 ${expense.category}: $${parseFloat(expense.amount).toLocaleString()}`,
            start: date,
            allDay: true,
            extendedProps: {
              type: "user_expense",
              data: expense,
            },
            backgroundColor: "#EF4444",
            borderColor: "#EF4444",
            textColor: "#fff",
          });
        });
      } else {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= startOfMonth && expenseDate <= endOfRange) {
          events.push({
            id: `user-expense-${expense.id}`,
            title: `💸 ${expense.category}: $${parseFloat(expense.amount).toLocaleString()}`,
            start: expenseDate,
            allDay: true,
            extendedProps: {
              type: "user_expense",
              data: expense,
            },
            backgroundColor: "#EF4444",
            borderColor: "#EF4444",
            textColor: "#fff",
          });
        }
      }
    });

    // Group expenses
    groupExpenses.forEach((expense) => {
      if (expense.isRecurring && expense.recurringFrequency) {
        const baseDate = expense.nextDueDate ? new Date(expense.nextDueDate) : new Date(expense.date);
        const dates = generateRecurringDates(baseDate, expense.recurringFrequency, startOfMonth, endOfRange);

        dates.forEach((date, index) => {
          events.push({
            id: `group-expense-${expense.id}-${index}`,
            title: `👥 ${expense.category}: $${parseFloat(expense.amount).toLocaleString()}`,
            start: date,
            allDay: true,
            extendedProps: {
              type: "group_expense",
              data: expense,
            },
            backgroundColor: "#F59E0B",
            borderColor: "#F59E0B",
            textColor: "#fff",
          });
        });
      } else {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= startOfMonth && expenseDate <= endOfRange) {
          events.push({
            id: `group-expense-${expense.id}`,
            title: `👥 ${expense.category}: $${parseFloat(expense.amount).toLocaleString()}`,
            start: expenseDate,
            allDay: true,
            extendedProps: {
              type: "group_expense",
              data: expense,
            },
            backgroundColor: "#F59E0B",
            borderColor: "#F59E0B",
            textColor: "#fff",
          });
        }
      }
    });

    return events;
  }, [schedules, incomeEvents, userExpenses, groupExpenses]);

  // Load group members when issue is selected
  useEffect(() => {
    async function loadGroupMembers() {
      if (!formData.issueId) {
        setGroupMembers([]);
        return;
      }

      const issue = userIssues.find((i) => i.id === formData.issueId);
      if (!issue) return;

      const result = await getGroupMembersForScheduling(issue.groupId);
      if (result.success && result.members) {
        setGroupMembers(result.members);
        setCurrentUserMemberId(result.currentUserMemberId || "");
        if (result.currentUserMemberId && formData.participants.length === 0) {
          setFormData((prev) => ({
            ...prev,
            participants: [result.currentUserMemberId],
          }));
        }
      }
    }

    loadGroupMembers();
  }, [formData.issueId, userIssues, formData.participants.length]);

  // Responsive view
  useEffect(() => {
    const updateViewBasedOnScreenSize = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      const config = getResponsiveCalendarConfig(window.innerWidth);
      requestAnimationFrame(() => {
        calendarApi.changeView(config.view);
        setHeaderToolbar(config.toolbar);
      });
    };

    window.addEventListener("resize", updateViewBasedOnScreenSize);
    updateViewBasedOnScreenSize();
    return () => window.removeEventListener("resize", updateViewBasedOnScreenSize);
  }, []);

  // Event handlers
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.start);
    setFormData({
      issueId: "",
      scheduledTime: format(selectInfo.start, "yyyy-MM-dd'T'HH:mm"),
      estimatedDuration: 60,
      participants: [],
    });
    setIsCreateDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const eventType = clickInfo.event.extendedProps.type;

    if (eventType === "diy") {
      const schedule = clickInfo.event.extendedProps.schedule as ScheduleEvent;
      setSelectedEvent(schedule);
      setIsViewDialogOpen(true);
    } else if (eventType === "income") {
      const incomeData = clickInfo.event.extendedProps.data as IncomeEvent;
      setSelectedFinancialEvent({ type: "income", data: incomeData });
      setIsFinancialDialogOpen(true);
    } else if (eventType === "user_expense" || eventType === "group_expense") {
      const expenseData = clickInfo.event.extendedProps.data as ExpenseEvent;
      setSelectedFinancialEvent({ type: eventType, data: expenseData });
      setIsFinancialDialogOpen(true);
    }
  }, []);

  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const eventType = dropInfo.event.extendedProps.type;

    // Only allow dragging DIY events
    if (eventType !== "diy") {
      dropInfo.revert();
      return;
    }

    const schedule = dropInfo.event.extendedProps.schedule as ScheduleEvent;
    const newStart = dropInfo.event.start;

    if (!newStart) {
      dropInfo.revert();
      return;
    }

    setIsLoading(true);
    const result = await updateSchedule(schedule.id, {
      scheduledTime: newStart,
    });

    if (result.success && result.schedule) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === schedule.id
            ? { ...s, scheduledTime: result.schedule.scheduledTime }
            : s
        )
      );
    } else {
      dropInfo.revert();
    }
    setIsLoading(false);
  }, []);

  const handleCreateSchedule = async () => {
    if (!formData.issueId || !formData.scheduledTime) return;

    setIsLoading(true);
    const result = await createSchedule({
      issueId: formData.issueId,
      scheduledTime: new Date(formData.scheduledTime),
      estimatedDuration: formData.estimatedDuration,
      participants: formData.participants,
    });

    if (result.success) {
      window.location.reload();
    }
    setIsLoading(false);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteSchedule = async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    const result = await deleteSchedule(selectedEvent.id);

    if (result.success) {
      setSchedules((prev) => prev.filter((s) => s.id !== selectedEvent.id));
      setIsViewDialogOpen(false);
      setSelectedEvent(null);
    }
    setIsLoading(false);
  };

  const toggleParticipant = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(memberId)
        ? prev.participants.filter((id) => id !== memberId)
        : [...prev.participants, memberId],
    }));
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return {
    // Refs
    calendarRef,
    // State
    calendarEvents: calendarEvents(),
    headerToolbar,
    isLoading,
    // Dialog states
    selectedEvent,
    selectedFinancialEvent,
    isCreateDialogOpen,
    isViewDialogOpen,
    isFinancialDialogOpen,
    selectedDate,
    // Form state
    formData,
    groupMembers,
    currentUserMemberId,
    // Setters
    setIsCreateDialogOpen,
    setIsViewDialogOpen,
    setIsFinancialDialogOpen,
    // Handlers
    handleDateSelect,
    handleEventClick,
    handleEventDrop,
    handleCreateSchedule,
    handleDeleteSchedule,
    toggleParticipant,
    updateFormData,
  };
}
