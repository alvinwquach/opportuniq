/**
 * EXPENSES SCHEMA
 *
 * Private expense tracking for each user.
 * Used for detailed budget analysis and repair expense tracking.
 *
 * RELATIONS:
 * - Users (1) → (Many) UserExpenses
 * - Issues (1) → (Many) UserExpenses (optional link for repair costs)
 *
 * PRIVACY:
 * All expense data is PRIVATE to individual users (RLS enforced).
 * Never shared with group members.
 *
 * ENCRYPTION:
 * - Encrypted: category, amount, description (sensitive financial data)
 * - Plaintext: date, isRecurring, recurringFrequency, issueId (needed for queries)
 * - Uses user's encryptionKey (AES-256-GCM)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { incomeFrequencyEnum } from "./income-streams";

// ============================================
// USER EXPENSES TABLE
// ============================================

export const userExpenses = pgTable("user_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Encryption metadata
  isEncrypted: boolean("is_encrypted").default(true).notNull(),
  keyVersion: integer("key_version").default(1).notNull(),
  algorithm: text("algorithm").default("AES-GCM-256").notNull(),

  // Encrypted category (ciphertext + IV)
  encryptedCategory: text("encrypted_category"),
  categoryIv: text("category_iv"),

  // Encrypted amount (ciphertext + IV)
  encryptedAmount: text("encrypted_amount"),
  amountIv: text("amount_iv"),

  // Encrypted description (ciphertext + IV)
  encryptedDescription: text("encrypted_description"),
  descriptionIv: text("description_iv"),

  // Legacy plaintext fields (for migration)
  category: text("category"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  description: text("description"),

  // Plaintext fields (needed for queries)
  date: timestamp("date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: incomeFrequencyEnum("recurring_frequency"),
  nextDueDate: timestamp("next_due_date"),

  // Optional link to repair issue (tracks actual vs estimated costs)
  issueId: uuid("issue_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// TYPES
// ============================================

export type UserExpense = typeof userExpenses.$inferSelect;
export type NewUserExpense = typeof userExpenses.$inferInsert;
