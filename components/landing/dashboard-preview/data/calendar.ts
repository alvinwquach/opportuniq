import { CalendarEvent } from '../types';

export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Plumber - Kitchen Leak',
    date: 'Apr 8, 2026',
    time: '10:00 AM',
    type: 'contractor',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: '2',
    title: 'Replace Faucet Cartridge',
    date: 'Apr 5, 2026',
    time: '9:00 AM',
    type: 'diy',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: '3',
    title: 'Gutter Inspection',
    date: 'Apr 12, 2026',
    time: '9:00 AM',
    type: 'reminder',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    id: '4',
    title: 'HVAC Filter Change',
    date: 'Apr 15, 2026',
    time: '2:00 PM',
    type: 'diy',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: '5',
    title: 'Paint Garage Door',
    date: 'Apr 6, 2026',
    time: '8:00 AM',
    type: 'diy',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: '6',
    title: 'AC Inspection',
    date: 'Apr 22, 2026',
    time: '11:00 AM',
    type: 'contractor',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: '7',
    title: 'Smoke Detector Batteries',
    date: 'Apr 18, 2026',
    time: '10:00 AM',
    type: 'reminder',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
];

export const reminders = [
  { id: '1', issueId: '1', title: 'Check furnace after cleaning sensor', groupName: 'Main House', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
  { id: '2', issueId: '2', title: 'Test sump pump battery backup', groupName: 'Main House', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
];
