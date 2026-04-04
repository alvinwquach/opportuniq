/**
 * Types for the Finances page
 */

export type IncomeFrequency =
  | "weekly"
  | "bi_weekly"
  | "semi_monthly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "one_time";

export interface IncomeStream {
  id: string;
  source: string;
  amount: number;
  frequency: IncomeFrequency;
  isActive: boolean;
  description?: string | null;
  monthlyEquivalent: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: Date;
  isRecurring: boolean;
  frequency?: IncomeFrequency | null;
  issueTitle?: string | null;
  urgency?: "critical" | "important" | "normal" | "deferrable" | null;
}

export interface UpcomingExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  dueDate: Date;
  urgency?: string | null;
  isRecurring: boolean;
}

export interface SpendingCategory {
  category: string;
  amount: number;
  color: string;
}

export interface CashFlowDataPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface IncomeHistoryDataPoint {
  month: string;
  total: number;
  primary: number;
  secondary: number;
}

export interface ExpenseHistoryDataPoint {
  month: string;
  total: number;
  recurring: number;
  oneTime: number;
}

export interface BudgetVsActualDataPoint {
  category: string;
  budget: number;
  actual: number;
}

export type TabType = "overview" | "income" | "expenses";

export const frequencyLabels: Record<IncomeFrequency, string> = {
  weekly: "Weekly",
  bi_weekly: "Bi-weekly",
  semi_monthly: "Semi-monthly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  one_time: "One-time",
};

export const frequencyMultipliers: Record<IncomeFrequency, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

export const expenseCategories = [
  "Housing",
  "Utilities",
  "Repairs",
  "Maintenance",
  "Insurance",
  "Groceries",
  "Transportation",
  "Healthcare",
  "Entertainment",
  "Other",
];

export const categoryColors: Record<string, string> = {
  Housing: "#2563EB",
  Utilities: "#249361",
  Repairs: "#f59e0b",
  Maintenance: "#84cc16",
  Insurance: "#10b981",
  Groceries: "#ec4899",
  Transportation: "#059669",
  Healthcare: "#ef4444",
  Entertainment: "#f97316",
  Other: "#94a3b8",
};
