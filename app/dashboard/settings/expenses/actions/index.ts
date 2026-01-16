/**
 * EXPENSE ACTIONS
 *
 * Server actions for managing user expenses with E2E encryption.
 *
 * ENCRYPTION MODEL:
 * - Client encrypts sensitive fields (category, amount, description) before sending
 * - Server stores encrypted ciphertext + IV, never sees plaintext
 * - Client decrypts after fetching using user's encryptionKey
 *
 * WHAT'S ENCRYPTED: category, amount, description
 * WHAT'S PLAINTEXT: date, isRecurring, recurringFrequency, issueId (needed for queries)
 */

// Types
export type {
  EncryptedExpenseInput,
  ExpenseResponse,
  ExpenseFrequency,
} from "./types";
export { FREQUENCY_TO_MONTHLY } from "./types";

// Helpers
export { calculateNextDueDate } from "./helpers";

// Actions
export { getExpenseData, getExpensesForMonth } from "./getExpenseData";
export { addExpense, addExpensePlaintext } from "./addExpense";
export { updateExpense } from "./updateExpense";
export { deleteExpense } from "./deleteExpense";
export { encryptExpense } from "./encryptExpense";
