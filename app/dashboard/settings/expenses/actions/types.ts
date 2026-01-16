/**
 * EXPENSE ACTION TYPES
 *
 * Shared types for expense server actions with E2E encryption.
 *
 * ENCRYPTION MODEL:
 * - Client encrypts sensitive fields (category, amount, description) before sending
 * - Server stores encrypted ciphertext + IV, never sees plaintext
 * - Client decrypts after fetching using user's encryptionKey
 */

import type { ExpenseFrequency } from "../schemas";

// Re-export for convenience
export type { ExpenseFrequency } from "../schemas";

// ============================================
// INPUT TYPES (Client → Server)
// ============================================

/**
 * Encrypted expense data sent from client to server.
 * Each sensitive field has a ciphertext and IV pair.
 */
export interface EncryptedExpenseInput {
  encryptedCategory: string;
  categoryIv: string;
  encryptedAmount: string;
  amountIv: string;
  encryptedDescription?: string;
  descriptionIv?: string;
  date: Date;
  frequency: ExpenseFrequency;
  issueId?: string;
  keyVersion?: number;
}

// ============================================
// RESPONSE TYPES (Server → Client)
// ============================================

/**
 * Expense record returned from the server.
 * Contains both encrypted fields and plaintext for unencrypted rows.
 */
export interface ExpenseResponse {
  id: string;
  userId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedCategory: string | null;
  categoryIv: string | null;
  encryptedAmount: string | null;
  amountIv: string | null;
  encryptedDescription: string | null;
  descriptionIv: string | null;
  // Plaintext fields (for unencrypted rows)
  category: string | null;
  amount: string | null;
  description: string | null;
  // Always plaintext
  date: Date;
  isRecurring: boolean | null;
  recurringFrequency: ExpenseFrequency | null;
  nextDueDate: Date | null;
  issueId: string | null;
  createdAt: Date;
}

// ============================================
// HELPER CONSTANTS
// ============================================

/**
 * Frequency multipliers for monthly normalization.
 * Used to calculate monthly recurring totals.
 */
export const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};
