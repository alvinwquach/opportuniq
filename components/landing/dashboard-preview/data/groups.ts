import { Household, Activity } from '../types';

// Roles from schema: coordinator, collaborator, participant, contributor, observer
export const households: Household[] = [
  {
    id: '1',
    name: 'Main House',
    members: [
      { id: '1', name: 'Mike R.', role: 'coordinator', avatar: 'MR' },
      { id: '2', name: 'Sarah R.', role: 'collaborator', avatar: 'SR' },
    ],
    issueCount: 5,
    savings: 2847,
  },
  {
    id: '2',
    name: 'Rental Property',
    members: [
      { id: '1', name: 'Mike R.', role: 'coordinator', avatar: 'MR' },
      { id: '3', name: 'Tom K.', role: 'contributor', avatar: 'TK' },
    ],
    issueCount: 3,
    savings: 580,
  },
];

export const groups = [
  { id: '1', name: 'Main House', members: 2, issues: 5, savings: 2847, role: 'Admin' },
  { id: '2', name: 'Rental Property', members: 2, issues: 3, savings: 580, role: 'Admin' },
];

export const groupActivity: Activity[] = [
  { id: '1', message: 'Mike completed "Replace furnace filter"', time: '2h ago', avatar: 'MR' },
  { id: '2', message: 'Sarah added a new issue: "Storm door closer"', time: '1d ago', avatar: 'SR' },
];

export const budgetContributions = [
  { id: '1', memberName: 'Mike R.', amount: 500, note: 'Monthly budget', contributedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), groupId: '1' },
  { id: '2', memberName: 'Sarah R.', amount: 300, note: 'Home repair fund', contributedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), groupId: '1' },
];
