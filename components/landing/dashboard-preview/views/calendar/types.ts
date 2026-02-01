export type EventType = 'contractor' | 'diy' | 'reminder' | 'income' | 'expense';
export type FilterType = 'all' | EventType;
export type ViewMode = 'month' | 'week';
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'disconnected';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  isRecurring?: boolean;
  recurringPattern?: string;
  location?: string;
  assignee?: string;
  notes?: string;
  estimatedCost?: number;
  reminder?: string;
  linkedIssue?: string | null;
}

export interface CalendarDay {
  date: number;
  events: CalendarEvent[];
  isOtherMonth: boolean;
}

export interface SyncStatusItem {
  provider: string;
  status: SyncStatus;
  lastSync: string;
}
