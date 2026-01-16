"use client";

import { useIncomeEncryption } from "./encrypted-financials/useIncomeEncryption";
import { useExpenseEncryption } from "./encrypted-financials/useExpenseEncryption";
import { useBudgetEncryption } from "./encrypted-financials/useBudgetEncryption";
import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
} from "./encrypted-financials/calculations";

// Re-export all types from the centralized types file
export * from "./encrypted-financials/types";

/**
 * Combined hook that provides all financial encryption operations.
 * Use this when you need income, expense, and budget encryption in one component.
 */
export function useEncryptedFinancials() {
  const income = useIncomeEncryption();
  const expense = useExpenseEncryption();
  const budget = useBudgetEncryption();

  return {
    // Income
    encryptIncomeData: income.encryptIncomeData,
    decryptIncomeStreams: income.decryptIncomeStreams,
    // Expenses
    encryptExpenseData: expense.encryptExpenseData,
    decryptExpenses: expense.decryptExpenses,
    // Budgets
    encryptBudgetData: budget.encryptBudgetData,
    decryptBudgets: budget.decryptBudgets,
    // Calculations
    calculateMonthlyIncome,
    calculateMonthlyExpenses,
    // State (combined from all hooks)
    isEncrypting: income.isEncrypting || expense.isEncrypting || budget.isEncrypting,
    isDecrypting: income.isDecrypting || expense.isDecrypting || budget.isDecrypting,
    error: income.error || expense.error || budget.error,
  };
}
