/**
 * BUDGETS SCHEMA
 *
 * Budget limits per category for each user.
 * Tracks spending against limits to warn when approaching/exceeding budget.
 *
 * RELATIONS:
 * - Users (1) → (Many) UserBudgets
 *
 * PRIVACY:
 * All budget data is PRIVATE to individual users (RLS enforced).
 * Group-level budgets are in GroupConstraints (separate from personal budgets).
 *
 * ENCRYPTION:
 * - Encrypted: category, monthlyLimit, currentSpend (sensitive financial data)
 * - Plaintext: updatedAt (needed for tracking)
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

// ============================================
// USER BUDGETS TABLE
// ============================================

export const userBudgets = pgTable("user_budgets", {
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

  // Encrypted monthly limit (ciphertext + IV)
  encryptedMonthlyLimit: text("encrypted_monthly_limit"),
  monthlyLimitIv: text("monthly_limit_iv"),

  // Encrypted current spend (ciphertext + IV)
  encryptedCurrentSpend: text("encrypted_current_spend"),
  currentSpendIv: text("current_spend_iv"),

  // Legacy plaintext fields (for migration)
  category: text("category"),
  monthlyLimit: decimal("monthly_limit", { precision: 10, scale: 2 }),
  currentSpend: decimal("current_spend", { precision: 10, scale: 2 }).default("0"),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// TYPES
// ============================================

export type UserBudget = typeof userBudgets.$inferSelect;
export type NewUserBudget = typeof userBudgets.$inferInsert;
