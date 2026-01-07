import { z } from "zod";

// Risk tolerance options matching the database enum
export const riskToleranceLevels = [
  "none",
  "very_low",
  "low",
  "moderate",
  "high",
  "very_high",
] as const;

export type RiskTolerance = (typeof riskToleranceLevels)[number];

// Display labels for risk tolerance
export const riskToleranceLabels: Record<RiskTolerance, string> = {
  none: "None",
  very_low: "Very Low",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very High",
};

// Descriptions for risk tolerance levels
export const riskToleranceDescriptions: Record<RiskTolerance, string> = {
  none: "Always hire professionals",
  very_low: "Prefer professionals for most tasks",
  low: "Comfortable with only basic repairs",
  moderate: "Balanced approach to DIY and hiring",
  high: "Comfortable with most DIY tasks",
  very_high: "Prefer DIY for almost everything",
};

// Form validation schema
export const budgetSettingsSchema = z.object({
  monthlyBudget: z.coerce
    .number()
    .positive("Budget must be greater than 0")
    .optional()
    .nullable(),
  emergencyBuffer: z.coerce
    .number()
    .positive("Buffer must be greater than 0")
    .optional()
    .nullable(),
  riskTolerance: z.enum(riskToleranceLevels).optional().nullable(),
});

// Form values type
export type BudgetSettingsFormValues = {
  monthlyBudget: number | null;
  emergencyBuffer: number | null;
  riskTolerance: RiskTolerance | null;
};
