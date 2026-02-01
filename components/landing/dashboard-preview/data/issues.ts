import { Issue, Activity } from '../types';

export const issues: Issue[] = [
  {
    id: '1',
    title: 'Furnace not igniting',
    status: 'investigating',
    category: 'HVAC',
    priority: 'high',
    assignee: { id: '1', name: 'Mike R.', role: 'Admin', avatar: '👨' },
    group: 'Main House',
    createdAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Basement sump pump noise',
    status: 'in_progress',
    category: 'Plumbing',
    priority: 'medium',
    assignee: { id: '2', name: 'Sarah R.', role: 'Member', avatar: '👩' },
    group: 'Main House',
    createdAt: '1 week ago',
  },
  {
    id: '3',
    title: 'Garage door opener failing',
    status: 'open',
    category: 'Garage',
    priority: 'low',
    assignee: { id: '1', name: 'Mike R.', role: 'Admin', avatar: '👨' },
    group: 'Main House',
    createdAt: '3 days ago',
  },
  {
    id: '4',
    title: 'Water heater anode rod',
    status: 'completed',
    category: 'Plumbing',
    priority: 'medium',
    assignee: { id: '1', name: 'Mike R.', role: 'Admin', avatar: '👨' },
    group: 'Main House',
    createdAt: '2 weeks ago',
  },
  {
    id: '5',
    title: 'Replace smoke detector batteries',
    status: 'completed',
    category: 'Safety',
    priority: 'high',
    assignee: { id: '2', name: 'Sarah R.', role: 'Member', avatar: '👩' },
    group: 'Main House',
    createdAt: '3 weeks ago',
  },
  {
    id: '6',
    title: 'Toilet flapper replacement',
    status: 'completed',
    category: 'Plumbing',
    priority: 'medium',
    assignee: { id: '1', name: 'Mike R.', role: 'Admin', avatar: '👨' },
    group: 'Main House',
    createdAt: '1 month ago',
  },
  {
    id: '7',
    title: 'Storm door closer broken',
    status: 'open',
    category: 'Exterior',
    priority: 'medium',
    assignee: { id: '2', name: 'Sarah R.', role: 'Member', avatar: '👩' },
    group: 'Main House',
    createdAt: '1 day ago',
  },
  {
    id: '8',
    title: 'Garbage disposal jammed',
    status: 'completed',
    category: 'Appliances',
    priority: 'medium',
    assignee: { id: '1', name: 'Mike R.', role: 'Admin', avatar: '👨' },
    group: 'Main House',
    createdAt: '2 months ago',
  },
];

export const openIssues = [
  { id: '1', title: 'Furnace not igniting', status: 'investigating', group: 'Main House', priority: 'high' },
  { id: '2', title: 'Basement sump pump noise', status: 'in_progress', group: 'Main House', priority: 'medium' },
  { id: '3', title: 'Garage door opener failing', status: 'open', group: 'Main House', priority: 'low' },
];

export const safetyAlerts = [
  { id: '1', title: 'Carbon monoxide detector low battery', severity: 'high', groupName: 'Main House', emergencyInstructions: 'Replace battery immediately - CO detectors save lives' },
];

export const recentActivity: Activity[] = [
  { id: '1', message: 'Mike completed "Replace furnace filter"', time: '2h ago', avatar: '👨' },
  { id: '2', message: 'Sarah added a new issue: "Storm door closer"', time: '1d ago', avatar: '👩' },
  { id: '3', message: 'Parts ordered for sump pump repair', time: '2d ago', avatar: '📦' },
  { id: '4', message: 'Furnace inspection scheduled for Monday', time: '3d ago', avatar: '📅' },
];

export const recentOutcomes = [
  { id: '1', issueTitle: 'Water heater anode rod', success: true, optionType: 'diy', actualCost: 28, costDelta: -172 },
  { id: '2', issueTitle: 'Toilet flapper replacement', success: true, optionType: 'diy', actualCost: 8, costDelta: -92 },
];

export const deferredDecisions = [
  { id: '1', title: 'Garage door opener upgrade', reason: 'Waiting for spring', date: '2 weeks ago' },
];

export const issueAnalytics = {
  statusDistribution: [
    { status: 'Open', count: 2, color: '#3ECF8E' },
    { status: 'Investigating', count: 1, color: '#f59e0b' },
    { status: 'In Progress', count: 1, color: '#8b5cf6' },
    { status: 'Completed', count: 8, color: '#10b981' },
  ],
  priorityBreakdown: [
    { priority: 'High', count: 1, color: '#ef4444' },
    { priority: 'Medium', count: 2, color: '#f59e0b' },
    { priority: 'Low', count: 1, color: '#64748b' },
  ],
  categoryBreakdown: [
    { category: 'HVAC', count: 2, color: '#3ECF8E' },
    { category: 'Plumbing', count: 1, color: '#3ECF8E' },
    { category: 'Garage', count: 1, color: '#f59e0b' },
  ],
  avgResolutionTime: '2.8 days',
};

export const resolutionTypeBreakdown = [
  { type: 'DIY', count: 6, color: '#3ECF8E' },
  { type: 'Hired', count: 1, color: '#3ECF8E' },
  { type: 'Replaced', count: 1, color: '#8b5cf6' },
  { type: 'Deferred', count: 0, color: '#f59e0b' },
];
