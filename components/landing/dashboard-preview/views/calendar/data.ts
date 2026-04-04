import { CalendarEvent, SyncStatusItem } from './types';

export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const extendedEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Plumber - Kitchen Leak',
    date: 'Apr 8, 2026',
    time: '10:00 AM',
    type: 'contractor',
    isRecurring: false,
    location: '123 Main St, Kitchen',
    assignee: "Mike's Plumbing",
    notes: 'Leak under kitchen sink.',
    estimatedCost: 185,
    reminder: '1 day before',
    linkedIssue: 'Kitchen Sink Leak',
  },
  {
    id: '2',
    title: 'Replace Faucet Cartridge',
    date: 'Apr 5, 2026',
    time: '9:00 AM',
    type: 'diy',
    isRecurring: false,
    location: 'Bathroom',
    assignee: 'Self',
    notes: 'Moen 1225 cartridge replacement.',
    estimatedCost: 33,
    reminder: '1 day before',
    linkedIssue: 'Leaky kitchen faucet',
  },
  {
    id: '3',
    title: 'Gutter Inspection',
    date: 'Apr 12, 2026',
    time: '9:00 AM',
    type: 'reminder',
    isRecurring: true,
    recurringPattern: 'Every 6 months',
    location: 'Exterior',
    assignee: undefined,
    notes: 'Check for debris before spring rains.',
    estimatedCost: 0,
    reminder: '3 days before',
    linkedIssue: null,
  },
  {
    id: '4',
    title: 'HVAC Filter Change',
    date: 'Apr 15, 2026',
    time: '2:00 PM',
    type: 'diy',
    isRecurring: true,
    recurringPattern: 'Every 3 months',
    location: 'Utility Room',
    assignee: 'Self',
    notes: 'Replace 20x25x1 filter.',
    estimatedCost: 25,
    reminder: '1 week before',
    linkedIssue: null,
  },
  {
    id: '5',
    title: 'Paint Garage Door',
    date: 'Apr 6, 2026',
    time: '8:00 AM',
    type: 'diy',
    isRecurring: false,
    location: 'Garage - Exterior',
    assignee: 'Self',
    notes: 'Sand, prime, two coats exterior latex.',
    estimatedCost: 65,
    reminder: '1 day before',
    linkedIssue: 'Garage door peeling',
  },
  {
    id: '6',
    title: 'AC Inspection',
    date: 'Apr 22, 2026',
    time: '11:00 AM',
    type: 'contractor',
    isRecurring: false,
    location: 'Main House',
    assignee: 'Cool Air HVAC',
    notes: 'Pre-summer AC check and refrigerant.',
    estimatedCost: 120,
    reminder: '2 days before',
    linkedIssue: 'AC not cooling',
  },
  {
    id: '7',
    title: 'Smoke Detector Batteries',
    date: 'Apr 18, 2026',
    time: '10:00 AM',
    type: 'reminder',
    isRecurring: true,
    recurringPattern: 'Every 6 months',
    location: 'All rooms',
    assignee: undefined,
    notes: 'Replace 9V batteries in all detectors.',
    estimatedCost: 15,
    reminder: '1 week before',
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
  { id: '1', title: 'Plumber - Kitchen Leak', date: 'Apr 8', amount: 185, type: 'contractor' },
  { id: '2', title: 'Replace Faucet Cartridge', date: 'Apr 5', amount: 33, type: 'diy' },
  { id: '3', title: 'HVAC Filter Change', date: 'Apr 15', amount: 25, type: 'diy' },
  { id: '4', title: 'Paint Garage Door', date: 'Apr 6', amount: 65, type: 'diy' },
  { id: '5', title: 'AC Inspection', date: 'Apr 22', amount: 120, type: 'contractor' },
  { id: '6', title: 'Smoke Detector Batteries', date: 'Apr 18', amount: 15, type: 'diy' },
];

export const monthComparisonData = [
  { month: 'Oct', events: 5, completed: 4 },
  { month: 'Nov', events: 8, completed: 7 },
  { month: 'Dec', events: 6, completed: 6 },
  { month: 'Jan', events: 7, completed: 3 },
];
