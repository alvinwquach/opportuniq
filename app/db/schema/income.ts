/**
 * INCOME SCHEMA - Private financial tracking per user
 *
 * RELATIONS:
 * - Users (1) → (Many) UserIncomeStreams - One user has many income sources
 * - Users (1) → (Many) UserExpenses - One user has many expense records
 * - Users (1) → (Many) UserBudgets - One user has many budget categories
 *
 * PRIVACY:
 * All financial data is PRIVATE to individual users (RLS enforced).
 * Never shared with other group members - only used for personal affordability analysis.
 * Group-level budgets are in GroupConstraints (separate from personal budgets).
 */

import { pgTable, uuid, text, timestamp, pgEnum, decimal, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

// ============================================
// ENUMS
// ============================================

/**
 * INCOME_FREQUENCY_ENUM
 *
 * Standardized payment schedules for normalizing to monthly equivalent.
 * Conversion multipliers:
 * - weekly: × 4.33 (52 weeks / 12 months)
 * - bi_weekly: × 2.17 (26 periods / 12 months)
 * - semi_monthly: × 2 (24 periods / 12 months)
 * - monthly: × 1
 * - quarterly: ÷ 3
 * - annual: ÷ 12
 * - one_time: don't count in recurring budget
 */
export const incomeFrequencyEnum = pgEnum("income_frequency", [
  "weekly",
  "bi_weekly",
  "semi_monthly",
  "monthly",
  "quarterly",
  "annual",
  "one_time",
]);

// ============================================
// TABLES
// ============================================

/**
 * USER_INCOME_STREAMS TABLE
 *
 * Private income sources for each user (salary, gigs, side hustles, etc.).
 * Used to calculate total monthly income for affordability analysis.
 * Relation: One user → Many income streams
 */
export const userIncomeStreams = pgTable("user_income_streams", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to users - cascade delete removes income streams when user deleted
  // Relation: Many userIncomeStreams → One user
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Income source name - flexible text: "Salary", "DoorDash", "Freelance Photography"
  source: text("source").notNull(),

  // Income amount per frequency period
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  // How often income is received - used to normalize to monthly
  frequency: incomeFrequencyEnum("frequency").notNull(),

  // Optional description - e.g., "Software Engineer at Acme Corp", "Weekend delivery shifts"
  description: text("description"),

  // Whether this income stream is currently active
  // Set to false when job ends or side hustle stops
  isActive: boolean("is_active").default(true).notNull(),

  // When income started
  startDate: timestamp("start_date"),

  // When income ended (for temporary/seasonal income)
  endDate: timestamp("end_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * USER_EXPENSES TABLE
 *
 * Private expense tracking for each user (not shared with group).
 * Optional feature - used for detailed budget analysis and repair expense tracking.
 * Relation: One user → Many expenses
 */
export const userExpenses = pgTable("user_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to users - cascade delete removes expenses when user deleted
  // Relation: Many userExpenses → One user
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Expense category - flexible text: "Repairs", "Groceries", "Car Payment", etc.
  // Should align with userBudgets categories
  category: text("category").notNull(),

  // Expense amount
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  // When expense occurred (not when logged)
  date: timestamp("date").notNull(),

  // Optional description - e.g., "Groceries at Safeway", "Electric bill"
  description: text("description"),

  // Whether expense repeats regularly (rent, utilities, subscriptions)
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: incomeFrequencyEnum("recurring_frequency"),
  nextDueDate: timestamp("next_due_date"),

  // Optional link to repair issue this expense relates to
  // Used to track actual vs. estimated repair costs
  issueId: uuid("issue_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * USER_BUDGETS TABLE
 *
 * Budget limits per category for each user.
 * Tracks spending against limits to warn when approaching/exceeding budget.
 * Relation: One user → Many budget categories
 */
export const userBudgets = pgTable("user_budgets", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to users - cascade delete removes budgets when user deleted
  // Relation: Many userBudgets → One user
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Budget category - should match expense categories
  // Examples: "Repairs", "Groceries", "Entertainment", "Total Monthly"
  category: text("category").notNull(),

  // Maximum spending allowed per month for this category
  monthlyLimit: decimal("monthly_limit", { precision: 10, scale: 2 }).notNull(),

  // Current spending in this month - resets to 0 on 1st of month
  // Updated when expenses are logged
  currentSpend: decimal("current_spend", { precision: 10, scale: 2 }).default("0").notNull(),

  // Last time budget was updated (for tracking spending trends)
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for type-safe queries
export type UserIncomeStream = typeof userIncomeStreams.$inferSelect;
export type NewUserIncomeStream = typeof userIncomeStreams.$inferInsert;

export type UserExpense = typeof userExpenses.$inferSelect;
export type NewUserExpense = typeof userExpenses.$inferInsert;

export type UserBudget = typeof userBudgets.$inferSelect;
export type NewUserBudget = typeof userBudgets.$inferInsert;
