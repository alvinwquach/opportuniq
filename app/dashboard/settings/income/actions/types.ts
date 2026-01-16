/**
 * INCOME ACTION TYPES
 *
 * Shared types for income server actions with E2E encryption.
 *
 * ENCRYPTION MODEL:
 * - Client encrypts sensitive fields (source, amount, description) before sending
 * - Server stores encrypted ciphertext + IV, never sees plaintext
 * - Client decrypts after fetching using user's encryptionKey
 */

import type { IncomeFrequency } from "../schemas";

// Re-export for convenience
export type { IncomeFrequency } from "../schemas";

// ============================================
// INPUT TYPES (Client → Server)
// ============================================

/**
 * Encrypted income data sent from client to server.
 * Each sensitive field has a ciphertext and IV pair.
 */
export interface EncryptedIncomeInput {
  encryptedSource: string;
  sourceIv: string;
  encryptedAmount: string;
  amountIv: string;
  encryptedDescription?: string;
  descriptionIv?: string;
  frequency: IncomeFrequency;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  keyVersion?: number;
}

// ============================================
// RESPONSE TYPES (Server → Client)
// ============================================

/**
 * Income stream record returned from the server.
 * Contains both encrypted fields and legacy plaintext for backwards compatibility.
 */
export interface IncomeStreamResponse {
  id: string;
  userId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedSource: string | null;
  sourceIv: string | null;
  encryptedAmount: string | null;
  amountIv: string | null;
  encryptedDescription: string | null;
  descriptionIv: string | null;
  // Legacy plaintext (for unencrypted rows)
  source: string | null;
  amount: string | null;
  description: string | null;
  // Plaintext fields
  frequency: string;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// HELPER CONSTANTS
// ============================================

/**
 * Frequency multipliers for monthly normalization.
 * Used to calculate monthly income totals.
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

/**
 * Standard annual work hours for hourly rate calculation.
 */
export const ANNUAL_HOURS = 2080;
