import { IoConstruct, IoWallet, IoTrendingUp, IoAlertCircle, IoPersonOutline } from "react-icons/io5";
import { extendedEvents } from './data';
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
      return 'bg-indigo-50 border-indigo-200 text-indigo-600';
    case 'diy':
      return 'bg-blue-50 border-blue-200 text-blue-600';
    case 'reminder':
      return 'bg-amber-50 border-amber-200 text-amber-600';
    case 'income':
      return 'bg-green-50 border-green-200 text-green-600';
    case 'expense':
      return 'bg-red-50 border-red-200 text-red-600';
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
    const dayEvents = extendedEvents.filter((event) => {
      const eventDate = new Date(event.date || '');
      return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === date;
    });
    days.push({ date, events: dayEvents, isOtherMonth: false });
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
