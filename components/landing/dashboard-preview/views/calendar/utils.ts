import { IoConstruct, IoWallet, IoTrendingUp, IoAlertCircle, IoPersonOutline } from "react-icons/io5";
import { calendarEvents } from '../../mockData';
import { CalendarDay } from './types';

// Consistent color scheme for event types
export const eventColors = {
  diy: '#2563EB',        // Emerald - DIY projects
  contractor: '#3b82f6', // Blue - Pro visits
  reminder: '#f59e0b',   // Amber - Reminders
  income: '#22c55e',     // Green - Income
  expense: '#ef4444',    // Red - Expenses
};

export const getEventColor = (type: string) => {
  switch (type) {
    case 'contractor':
      return 'bg-blue-100 border-blue-500/30 text-blue-600';
    case 'diy':
      return 'bg-blue-100 border-blue-500/30 text-blue-600';
    case 'reminder':
      return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    case 'income':
      return 'bg-green-500/20 border-green-500/30 text-green-400';
    case 'expense':
      return 'bg-red-500/20 border-red-500/30 text-red-400';
    default:
      return 'bg-[#333] border-[#444] text-gray-500';
  }
};

export const getEventIcon = (type: string) => {
  switch (type) {
    case 'contractor':
      return IoPersonOutline;
    case 'diy':
      return IoConstruct;
    case 'reminder':
      return IoAlertCircle;
    case 'income':
      return IoTrendingUp;
    case 'expense':
      return IoWallet;
    default:
      return IoWallet;
  }
};

export const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Add days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, events: [], isOtherMonth: true });
  }

  // Add days of the current month
  for (let date = 1; date <= daysInMonth; date++) {
    const dayEvents = calendarEvents.filter((event) => {
      if (year === 2025 && month === 0) {
        if (date === 27) return event.id === '1';
        if (date === 29) return event.id === '2';
        if (date === 31) return event.id === '3';
      }
      if (month === 1 && date === 5) return event.id === '1';
      if (month === 1 && date === 14) return event.id === '2';
      return false;
    });
    days.push({ date, events: dayEvents as typeof dayEvents, isOtherMonth: false });
  }

  // Add days from next month to fill the grid
  const remainingDays = 42 - days.length;
  for (let date = 1; date <= remainingDays; date++) {
    days.push({ date, events: [], isOtherMonth: true });
  }

  return days;
};

export const getWeekStart = (currentWeekStart: Date | null): Date => {
  if (currentWeekStart) return currentWeekStart;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  return weekStart;
};

export const getWeekDays = (currentWeekStart: Date | null): Date[] => {
  const weekStart = getWeekStart(currentWeekStart);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};
