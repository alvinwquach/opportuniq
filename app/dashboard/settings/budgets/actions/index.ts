/**
 * BUDGET ACTIONS
 *
 * Server actions for managing user budgets with E2E encryption.
 *
 * ENCRYPTION MODEL:
 * - Client encrypts sensitive fields (category, monthlyLimit, currentSpend) before sending
 * - Server stores encrypted ciphertext + IV, never sees plaintext
 * - Client decrypts after fetching using user's encryptionKey
 *
 * WHAT'S ENCRYPTED: category, monthlyLimit, currentSpend
 * WHAT'S PLAINTEXT: updatedAt (needed for tracking)
 */

// Types
export type { EncryptedBudgetInput, BudgetResponse } from "./types";

// Actions
export { getBudgetData } from "./getBudgetData";
export { addBudget, addBudgetPlaintext } from "./addBudget";
export { updateBudget } from "./updateBudget";
export { updateBudgetSpend, resetBudgetSpend } from "./updateBudgetSpend";
export { deleteBudget } from "./deleteBudget";
export { encryptBudget } from "./encryptBudget";
