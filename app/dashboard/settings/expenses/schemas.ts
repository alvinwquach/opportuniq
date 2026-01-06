import { z } from "zod";

// Expense frequency options matching the database enum (same as income)
export const expenseFrequencies = [
  "weekly",
  "bi_weekly",
  "semi_monthly",
  "monthly",
  "quarterly",
  "annual",
  "one_time",
] as const;

export type ExpenseFrequency = (typeof expenseFrequencies)[number];

// Common expense categories
export const expenseCategories = [
  "Housing",
  "Utilities",
  "Groceries",
  "Transportation",
  "Insurance",
  "Healthcare",
  "Debt Payments",
  "Entertainment",
  "Dining Out",
  "Shopping",
  "Subscriptions",
  "Personal Care",
  "Education",
  "Savings",
  "Repairs",
  "Other",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

// Form input values (what the user types)
export const expenseFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  frequency: z.enum(expenseFrequencies),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"), // Keep as string for form input
});

// Form values type (what the form stores)
export type ExpenseFormValues = {
  category: string;
  amount: number;
  frequency: ExpenseFrequency;
  description?: string;
  date: string; // String in form, converted to Date when submitting
};
