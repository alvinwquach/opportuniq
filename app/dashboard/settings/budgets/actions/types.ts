/**
 * BUDGET ACTION TYPES
 *
 * Shared types for budget server actions with E2E encryption.
 *
 * ENCRYPTION MODEL:
 * - Client encrypts sensitive fields (category, monthlyLimit, currentSpend) before sending
 * - Server stores encrypted ciphertext + IV, never sees plaintext
 * - Client decrypts after fetching using user's encryptionKey
 */

// ============================================
// INPUT TYPES (Client → Server)
// ============================================

/**
 * Encrypted budget data sent from client to server.
 * Each sensitive field has a ciphertext and IV pair.
 */
export interface EncryptedBudgetInput {
  encryptedCategory: string;
  categoryIv: string;
  encryptedMonthlyLimit: string;
  monthlyLimitIv: string;
  encryptedCurrentSpend?: string;
  currentSpendIv?: string;
  keyVersion?: number;
}

// ============================================
// RESPONSE TYPES (Server → Client)
// ============================================

/**
 * Budget record returned from the server.
 * Contains both encrypted fields and legacy plaintext for backwards compatibility.
 */
export interface BudgetResponse {
  id: string;
  userId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedCategory: string | null;
  categoryIv: string | null;
  encryptedMonthlyLimit: string | null;
  monthlyLimitIv: string | null;
  encryptedCurrentSpend: string | null;
  currentSpendIv: string | null;
  // Legacy plaintext (for unencrypted rows)
  category: string | null;
  monthlyLimit: string | null;
  currentSpend: string | null;
  // Plaintext fields
  updatedAt: Date;
}
