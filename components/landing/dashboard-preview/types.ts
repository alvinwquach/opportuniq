export type ViewType = 'dashboard' | 'diagnose' | 'issues' | 'groups' | 'calendar' | 'finances' | 'guides' | 'settings';

export interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'overview' | 'tools' | 'planning';
}

export interface StatCard {
  label: string;
  value: number | string;
  trend: string;
  up: boolean;
  sparkline: number[];
  prefix?: string;
}

export interface Issue {
  id: string;
  title: string;
  status: 'open' | 'investigating' | 'in_progress' | 'completed';
  category: string;
  priority: 'low' | 'medium' | 'high';
  assignee: HouseholdMember;
  group?: string;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Household {
  id: string;
  name: string;
  members: HouseholdMember[];
  issueCount: number;
  savings: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'contractor' | 'diy' | 'reminder';
  color: string;
}

export interface Guide {
  id: string;
  title: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  timeEstimate: string;
  category: string;
}

export interface PipelineStage {
  stage: string;
  count: number;
  color: string;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  color: string;
}

export interface Activity {
  id: string;
  message: string;
  time: string;
  avatar: string;
}
