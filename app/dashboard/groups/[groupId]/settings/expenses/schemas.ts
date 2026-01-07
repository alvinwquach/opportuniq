import { z } from "zod";

// Expense approval modes
export const expenseApprovalModes = ["none", "required", "threshold"] as const;
export type ExpenseApprovalMode = (typeof expenseApprovalModes)[number];

// Category approval rules
export const categoryApprovalRules = ["use_default", "always_require", "custom_threshold"] as const;
export type CategoryApprovalRule = (typeof categoryApprovalRules)[number];

// Display labels for approval modes
export const approvalModeLabels: Record<ExpenseApprovalMode, string> = {
  none: "No Approval",
  required: "Always Required",
  threshold: "Threshold-Based",
};

// Descriptions for approval modes
export const approvalModeDescriptions: Record<ExpenseApprovalMode, string> = {
  none: "All expenses are auto-approved immediately",
  required: "All expenses require manual approval",
  threshold: "Auto-approve expenses under a certain amount",
};

// Display labels for category approval rules
export const categoryApprovalRuleLabels: Record<CategoryApprovalRule, string> = {
  use_default: "Use Default",
  always_require: "Always Require",
  custom_threshold: "Custom Threshold",
};

// Expense settings form schema
export const expenseSettingsSchema = z.object({
  approvalMode: z.enum(expenseApprovalModes),
  defaultThreshold: z.coerce
    .number()
    .positive("Threshold must be greater than 0")
    .optional()
    .nullable(),
  trustOwnerAdmin: z.boolean(),
  moderatorThreshold: z.coerce
    .number()
    .positive("Threshold must be greater than 0")
    .optional()
    .nullable(),
  allowModeratorApprove: z.boolean(),
});

export type ExpenseSettingsFormValues = z.infer<typeof expenseSettingsSchema>;

// Category form schema
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name is too long"),
  icon: z.string().optional().nullable(),
  approvalRule: z.enum(categoryApprovalRules),
  customThreshold: z.coerce
    .number()
    .positive("Threshold must be greater than 0")
    .optional()
    .nullable(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// Default categories for new groups
export const defaultCategories = [
  { name: "Groceries", icon: "shopping-cart" },
  { name: "Utilities", icon: "bolt" },
  { name: "Rent/Mortgage", icon: "home" },
  { name: "Repairs", icon: "wrench" },
  { name: "Entertainment", icon: "film" },
  { name: "Transportation", icon: "car" },
  { name: "Other", icon: "ellipsis" },
] as const;
