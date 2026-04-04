import { StatCard, PipelineStage, BudgetCategory } from '../types';

export const stats: StatCard[] = [
  {
    label: 'Active Issues',
    value: 3,
    trend: '-2',
    up: false,
    sparkline: [8, 7, 9, 6, 5, 4, 3],
  },
  {
    label: 'Pending Decisions',
    value: 2,
    trend: '-1',
    up: false,
    sparkline: [5, 4, 6, 4, 3, 3, 2],
  },
  {
    label: 'Total Saved',
    value: 2847,
    trend: '+$420',
    up: true,
    prefix: '$',
    sparkline: [1200, 1450, 1680, 1920, 2180, 2427, 2847],
  },
  {
    label: 'Groups',
    value: 2,
    trend: '+1',
    up: true,
    sparkline: [1, 1, 1, 1, 1, 2, 2],
  },
];

export const pipeline: PipelineStage[] = [
  { stage: 'Open', count: 3, color: '#2563EB' },
  { stage: 'Investigating', count: 2, color: '#f59e0b' },
  { stage: 'In Progress', count: 1, color: '#8b5cf6' },
  { stage: 'Completed', count: 8, color: '#10b981' },
];

export const budgetCategories: BudgetCategory[] = [
  { category: 'HVAC', amount: 650, color: '#2563EB' },
  { category: 'Plumbing', amount: 380, color: '#2563EB' },
  { category: 'Electrical', amount: 220, color: '#f59e0b' },
  { category: 'Exterior', amount: 190, color: '#8b5cf6' },
  { category: 'Other', amount: 160, color: '#6b7280' },
];

export const savingsOverTime = [
  { month: 'Sep', savings: 1200, diy: 800, avoided: 400 },
  { month: 'Oct', savings: 1450, diy: 950, avoided: 500 },
  { month: 'Nov', savings: 1680, diy: 1080, avoided: 600 },
  { month: 'Dec', savings: 1920, diy: 1200, avoided: 720 },
  { month: 'Jan', savings: 2180, diy: 1380, avoided: 800 },
  { month: 'Feb', savings: 2847, diy: 1847, avoided: 1000 },
];

export const outcomeSummary = {
  diySuccessRate: 92,
  totalResolved: 8,
  avgCostDelta: -156,
  avgResolutionTimeDays: 2.8,
};
