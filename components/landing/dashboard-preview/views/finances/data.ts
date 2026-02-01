import { IncomeStream, Expense } from './types';

// Mock historical data for charts
export const cashFlowData = [
  { month: "Aug", income: 8200, expenses: 520 },
  { month: "Sep", income: 8400, expenses: 380 },
  { month: "Oct", income: 8600, expenses: 290 },
  { month: "Nov", income: 8600, expenses: 450 },
  { month: "Dec", income: 8800, expenses: 620 },
  { month: "Jan", income: 8600, expenses: 316 },
];

export const incomeHistoryData = [
  { month: "Aug", total: 8200, primary: 6200, secondary: 2000 },
  { month: "Sep", total: 8400, primary: 6300, secondary: 2100 },
  { month: "Oct", total: 8600, primary: 6400, secondary: 2200 },
  { month: "Nov", total: 8600, primary: 6500, secondary: 2100 },
  { month: "Dec", total: 8800, primary: 6500, secondary: 2300 },
  { month: "Jan", total: 8600, primary: 6500, secondary: 2100 },
];

export const expenseHistoryData = [
  { month: "Aug", total: 520, recurring: 270, oneTime: 250 },
  { month: "Sep", total: 380, recurring: 270, oneTime: 110 },
  { month: "Oct", total: 290, recurring: 270, oneTime: 20 },
  { month: "Nov", total: 450, recurring: 270, oneTime: 180 },
  { month: "Dec", total: 620, recurring: 270, oneTime: 350 },
  { month: "Jan", total: 316, recurring: 270, oneTime: 46 },
];

export const budgetVsActualData = [
  { category: "Repairs", budget: 200, actual: 33 },
  { category: "Maintenance", budget: 150, actual: 153 },
  { category: "Insurance", budget: 150, actual: 150 },
  { category: "Utilities", budget: 200, actual: 0 },
  { category: "Other", budget: 100, actual: 0 },
];

export const savingsRateData = [
  { month: "Aug", rate: 93.7 },
  { month: "Sep", rate: 95.5 },
  { month: "Oct", rate: 96.6 },
  { month: "Nov", rate: 94.8 },
  { month: "Dec", rate: 93.0 },
  { month: "Jan", rate: 96.3 },
];

export const initialIncomeStreams: IncomeStream[] = [
  { id: "1", source: "Primary Salary", amount: 6500, frequency: "monthly", isActive: true, description: "Full-time job" },
  { id: "2", source: "Rental Income", amount: 1300, frequency: "monthly", isActive: true, description: "Apartment 2B" },
  { id: "3", source: "Freelance", amount: 800, frequency: "monthly", isActive: true, description: "Side projects" },
];

export const initialExpenses: Expense[] = [
  { id: "1", category: "Repairs", amount: 24.99, description: "Faucet cartridge", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), isRecurring: false, issueTitle: "Leaky faucet", urgency: "important" },
  { id: "2", category: "Repairs", amount: 8.49, description: "O-ring kit", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), isRecurring: false, issueTitle: "Leaky faucet", urgency: "important" },
  { id: "3", category: "Maintenance", amount: 12.99, description: "AC filter replacement", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), isRecurring: false, urgency: "normal" },
  { id: "4", category: "Insurance", amount: 150, description: "Home insurance", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), isRecurring: true, frequency: "monthly", nextDueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), urgency: "critical" },
  { id: "5", category: "Maintenance", amount: 120, description: "HVAC service", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), isRecurring: true, frequency: "quarterly", nextDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), urgency: "normal" },
];
