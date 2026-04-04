import { CalendarEvent, SyncStatusItem } from './types';

export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const extendedEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Plumber - Fix Leak',
    date: 'Jan 27, 2025',
    time: '10:00 AM',
    type: 'contractor',
    isRecurring: false,
    location: '123 Main St, Kitchen',
    assignee: "Mike's Plumbing",
    notes: 'Leak under kitchen sink. Bring replacement P-trap.',
    estimatedCost: 150,
    reminder: '1 day before',
    linkedIssue: 'Kitchen Sink Leak',
  },
  {
    id: '2',
    title: 'HVAC Filter Change',
    date: 'Jan 29, 2025',
    time: '2:00 PM',
    type: 'diy',
    isRecurring: true,
    recurringPattern: 'Every 3 months',
    location: 'Utility Room',
    assignee: 'Self',
    notes: 'Replace 20x25x1 filter. Check for dust buildup.',
    estimatedCost: 45,
    reminder: '1 week before',
    linkedIssue: null,
  },
  {
    id: '3',
    title: 'Gutter Inspection',
    date: 'Jan 31, 2025',
    time: '9:00 AM',
    type: 'reminder',
    isRecurring: true,
    recurringPattern: 'Every 6 months',
    location: 'Exterior',
    assignee: undefined,
    notes: 'Check for debris and ensure proper drainage before spring.',
    estimatedCost: 0,
    reminder: '3 days before',
    linkedIssue: null,
  },
];

export const calendarSyncStatus: SyncStatusItem[] = [
  { provider: 'Google Calendar', status: 'synced', lastSync: '2 min ago' },
  { provider: 'Apple Calendar', status: 'synced', lastSync: '5 min ago' },
];

export const eventTypeData = [
  { name: 'DIY Projects', value: 3, color: '#2563EB' },
  { name: 'Pro Visits', value: 2, color: '#3b82f6' },
  { name: 'Reminders', value: 2, color: '#f59e0b' },
];

export const weeklyActivityData = [
  { week: 'Week 1', events: 2, expenses: 800 },
  { week: 'Week 2', events: 1, expenses: 150 },
  { week: 'Week 3', events: 3, expenses: 420 },
  { week: 'Week 4', events: 1, expenses: 85 },
];

export const upcomingExpensesData = [
  { id: '1', title: 'Plumber Visit', date: 'Jan 27', amount: 150, type: 'contractor' },
  { id: '2', title: 'HVAC Filter', date: 'Jan 29', amount: 45, type: 'diy' },
  { id: '3', title: 'Gutter Cleaning Service', date: 'Feb 3', amount: 200, type: 'contractor' },
  { id: '4', title: 'Smoke Detector Batteries', date: 'Feb 10', amount: 25, type: 'diy' },
];

export const monthComparisonData = [
  { month: 'Oct', events: 5, completed: 4 },
  { month: 'Nov', events: 8, completed: 7 },
  { month: 'Dec', events: 6, completed: 6 },
  { month: 'Jan', events: 7, completed: 3 },
];
