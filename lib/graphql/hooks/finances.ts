/**
 * Finances GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  FinancesPageDataResponse,
  IncomeStreamResponse,
  ExpenseResponse,
  BudgetResponse,
  FinancialSummaryResponse,
} from "../types";

// =============================================================================
// FINANCES PAGE DATA HOOKS
// =============================================================================

/**
 * Get comprehensive finances page data
 * This is the main hook for the finances page view
 */
export function useFinancesPageData() {
  return useQuery({
    queryKey: queryKeys.finance.pageData(),
    queryFn: () =>
      gqlRequest<{ financesPageData: FinancesPageDataResponse }>(queries.FINANCES_PAGE_DATA_QUERY),
    select: (data) => data.financesPageData,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Get user's income streams
 */
export function useIncomeStreams(activeOnly?: boolean) {
  return useQuery({
    queryKey: queryKeys.finance.income(),
    queryFn: () =>
      gqlRequest<{ myIncomeStreams: IncomeStreamResponse[] }>(
        queries.MY_INCOME_STREAMS_QUERY,
        { activeOnly }
      ),
    select: (data) => data.myIncomeStreams,
  });
}

/**
 * Get user's expenses
 */
export function useExpenses(options?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  isRecurring?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.finance.expenses(options),
    queryFn: () =>
      gqlRequest<{ myExpenses: ExpenseResponse[] }>(queries.MY_EXPENSES_QUERY, options),
    select: (data) => data.myExpenses,
  });
}

/**
 * Get user's budgets
 */
export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.finance.budgets(),
    queryFn: () =>
      gqlRequest<{ myBudgets: BudgetResponse[] }>(queries.MY_BUDGETS_QUERY),
    select: (data) => data.myBudgets,
  });
}

/**
 * Get user's financial summary
 */
export function useFinancialSummary() {
  return useQuery({
    queryKey: queryKeys.finance.summary(),
    queryFn: () =>
      gqlRequest<{ myFinancialSummary: FinancialSummaryResponse }>(
        queries.MY_FINANCIAL_SUMMARY_QUERY
      ),
    select: (data) => data.myFinancialSummary,
  });
}

// =============================================================================
// INCOME MUTATION HOOKS
// =============================================================================

/**
 * Add an income stream
 */
export function useAddIncomeStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      source: string;
      amount: string;
      frequency: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }) =>
      gqlRequest<{ addIncomeStream: IncomeStreamResponse }>(
        mutations.INCOME_ADD_MUTATION,
        variables
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Update an income stream
 */
export function useUpdateIncomeStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      id: string;
      source?: string;
      amount?: string;
      frequency?: string;
      description?: string;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
    }) =>
      gqlRequest<{ updateIncomeStream: IncomeStreamResponse }>(
        mutations.INCOME_UPDATE_MUTATION,
        variables
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Delete an income stream
 */
export function useDeleteIncomeStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ deleteIncomeStream: boolean }>(mutations.INCOME_DELETE_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// =============================================================================
// EXPENSE MUTATION HOOKS
// =============================================================================

/**
 * Add an expense
 */
export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      category: string;
      amount: string;
      description?: string;
      date: string;
      isRecurring?: boolean;
      recurringFrequency?: string;
      issueId?: string;
    }) =>
      gqlRequest<{ addExpense: ExpenseResponse }>(mutations.EXPENSE_ADD_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Update an expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      id: string;
      category?: string;
      amount?: string;
      description?: string;
      date?: string;
      isRecurring?: boolean;
      recurringFrequency?: string;
    }) =>
      gqlRequest<{ updateExpense: ExpenseResponse }>(mutations.EXPENSE_UPDATE_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Delete an expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ deleteExpense: boolean }>(mutations.EXPENSE_DELETE_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// =============================================================================
// BUDGET MUTATION HOOKS
// =============================================================================

/**
 * Set or update a budget
 */
export function useSetBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { category: string; monthlyLimit: string }) =>
      gqlRequest<{ setBudget: BudgetResponse }>(mutations.BUDGET_SET_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ deleteBudget: boolean }>(mutations.BUDGET_DELETE_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}
