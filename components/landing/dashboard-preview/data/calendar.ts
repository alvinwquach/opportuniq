import { CalendarEvent } from '../types';

export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'HVAC tech - furnace inspection',
    date: 'Mon, Feb 3',
    time: '10:00 AM',
    type: 'contractor',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: '2',
    title: 'Replace furnace filter',
    date: 'Wed, Feb 5',
    time: '2:00 PM',
    type: 'diy',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: '3',
    title: 'Check sump pump battery',
    date: 'Fri, Feb 7',
    time: '9:00 AM',
    type: 'reminder',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
];

export const reminders = [
  { id: '1', issueId: '1', title: 'Check furnace after cleaning sensor', groupName: 'Main House', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
  { id: '2', issueId: '2', title: 'Test sump pump battery backup', groupName: 'Main House', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
];
