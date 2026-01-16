/**
 * INCOME STREAMS SCHEMA
 *
 * Private income sources for each user (salary, gigs, side hustles, etc.).
 * Used to calculate total monthly income for affordability analysis.
 *
 * RELATIONS:
 * - Users (1) → (Many) UserIncomeStreams
 *
 * PRIVACY:
 * All income data is PRIVATE to individual users (RLS enforced).
 * Never shared with group members - only used for personal affordability analysis.
 *
 * ENCRYPTION:
 * - Encrypted: source, amount, description (sensitive financial data)
 * - Plaintext: frequency, isActive, dates (needed for queries/calculations)
 * - Uses user's encryptionKey (AES-256-GCM)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ============================================
// ENUMS
// ============================================

/**
 * Standardized payment schedules for normalizing to monthly equivalent.
 * Conversion: weekly ×4.33, bi_weekly ×2.17, semi_monthly ×2,
 * monthly ×1, quarterly ÷3, annual ÷12, one_time = non-recurring
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
// USER INCOME STREAMS TABLE
// ============================================

export const userIncomeStreams = pgTable("user_income_streams", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Encryption metadata
  isEncrypted: boolean("is_encrypted").default(true).notNull(),
  keyVersion: integer("key_version").default(1).notNull(),
  algorithm: text("algorithm").default("AES-GCM-256").notNull(),

  // Encrypted source name (ciphertext + IV)
  encryptedSource: text("encrypted_source"),
  sourceIv: text("source_iv"),

  // Encrypted amount (ciphertext + IV)
  encryptedAmount: text("encrypted_amount"),
  amountIv: text("amount_iv"),

  // Encrypted description (ciphertext + IV)
  encryptedDescription: text("encrypted_description"),
  descriptionIv: text("description_iv"),

  // Legacy plaintext fields (for migration)
  source: text("source"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  description: text("description"),

  // Plaintext fields (needed for queries/calculations)
  frequency: incomeFrequencyEnum("frequency").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// TYPES
// ============================================

export type UserIncomeStream = typeof userIncomeStreams.$inferSelect;
export type NewUserIncomeStream = typeof userIncomeStreams.$inferInsert;
export type IncomeFrequency =
  | "weekly"
  | "bi_weekly"
  | "semi_monthly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "one_time";
