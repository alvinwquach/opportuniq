/**
 * Encrypted Financials Module
 *
 * Client-side encryption for financial data (income, expenses, budgets).
 * All encryption/decryption happens in the browser using AES-256-GCM.
 *
 * Usage:
 *   import { useIncomeEncryption } from "@/hooks/encrypted-financials";
 *   const { encryptIncomeData, decryptIncomeStreams } = useIncomeEncryption();
 */

// Types
export * from "./types";

// Hooks
export { useEncryptionKey } from "./useEncryptionKey";
export { useIncomeEncryption } from "./useIncomeEncryption";
export { useExpenseEncryption } from "./useExpenseEncryption";
export { useBudgetEncryption } from "./useBudgetEncryption";

// Calculation utilities
export {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateCurrentMonthTotal,
  calculateSpendingByCategory,
} from "./calculations";
