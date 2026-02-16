import type { ContributionHistoryItem, PendingInvitation, GroupRole } from "./types";

export const contributionData = [
  { name: "Alex", value: 45, color: "#3ECF8E" },
  { name: "Jamie", value: 35, color: "#249361" },
  { name: "Mom", value: 20, color: "#f59e0b" },
];

export const resolutionByGroup = [
  { name: "My Apartment", diy: 4, hired: 1 },
  { name: "Parents' House", diy: 2, hired: 1 },
];

export const monthlySavingsData = [
  { month: "Aug", savings: 125, spent: 85 },
  { month: "Sep", savings: 210, spent: 120 },
  { month: "Oct", savings: 180, spent: 95 },
  { month: "Nov", savings: 320, spent: 150 },
  { month: "Dec", savings: 275, spent: 180 },
  { month: "Jan", savings: 185, spent: 110 },
];

export const contributionHistory: ContributionHistoryItem[] = [
  { id: "1", member: "Alex", amount: 500, date: "Jan 15", note: "Monthly contribution" },
  { id: "2", member: "Jamie", amount: 300, date: "Jan 10", note: "Emergency fund top-up" },
  { id: "3", member: "Alex", amount: 200, date: "Dec 28", note: "Year-end bonus" },
  { id: "4", member: "Jamie", amount: 150, date: "Dec 15", note: "Monthly contribution" },
  { id: "5", member: "Mom", amount: 200, date: "Dec 1", note: "Holiday gift" },
];

export const pendingInvitations: PendingInvitation[] = [
  {
    id: "1",
    email: "friend@example.com",
    role: "contributor" as GroupRole,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
];
