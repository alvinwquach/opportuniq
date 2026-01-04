import { z } from "zod";

// Income frequency options matching the database enum
export const incomeFrequencies = [
  "weekly",
  "bi_weekly",
  "semi_monthly",
  "monthly",
  "quarterly",
  "annual",
  "one_time",
] as const;

export type IncomeFrequency = (typeof incomeFrequencies)[number];

// Form input values (what the user types)
export const incomeFormSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  frequency: z.enum(incomeFrequencies),
  description: z.string().optional(),
  startDate: z.string().optional(), // Keep as string for form input
});

// Form values type (what the form stores)
export type IncomeFormValues = {
  source: string;
  amount: number;
  frequency: IncomeFrequency;
  description?: string;
  startDate?: string; // String in form, converted to Date when submitting
};

