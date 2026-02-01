/**
 * Calendar Page Types
 *
 * Types for the calendar page components.
 */

export type EventType = 'contractor' | 'diy' | 'reminder' | 'income' | 'expense';
export type FilterType = 'all' | EventType;
export type ViewMode = 'month' | 'week';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: EventType;
  isRecurring?: boolean;
  recurringPattern?: string | null;
  location?: string | null;
  assignee?: string | null;
  notes?: string | null;
  estimatedCost?: number | null;
  reminder?: string | null;
  linkedIssueId?: string | null;
  linkedIssueTitle?: string | null;
  groupId?: string | null;
  groupName?: string | null;
}

export interface CalendarDay {
  date: number;
  events: CalendarEvent[];
  isOtherMonth: boolean;
}

export interface CalendarStats {
  scheduledEvents: number;
  completedEvents: number;
  proVisits: number;
  diyProjects: number;
  reminders: number;
  upcomingExpenses: number;
}

export interface UpcomingExpense {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: EventType;
}

export interface EventTypeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyActivity {
  week: string;
  events: number;
  expenses: number;
}

export interface MonthlyComparison {
  month: string;
  events: number;
  completed: number;
}

export interface NewEventFormData {
  title: string;
  date: string;
  time: string;
  type: EventType;
  notes: string;
  isRecurring: boolean;
  recurringPattern: string;
  location: string;
  reminder: string;
  estimatedCost: string;
  linkedIssueId: string;
}
