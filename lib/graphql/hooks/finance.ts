/**
 * Finance GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  IncomeStreamResponse,
  ExpenseResponse,
  BudgetResponse,
  FinancialSummaryResponse,
  AddIncomeStreamInput,
  UpdateIncomeStreamInput,
  AddExpenseInput,
  UpdateExpenseInput,
  SetBudgetInput,
} from "../types";

// =============================================================================
// INCOME STREAM HOOKS
// =============================================================================

/**
 * Get income streams
 */
export function useMyIncomeStreams(activeOnly?: boolean) {
  return useQuery({
    queryKey: queryKeys.finance.income(),
    queryFn: () =>
      gqlRequest<{ myIncomeStreams: IncomeStreamResponse[] }>(queries.MY_INCOME_STREAMS_QUERY, {
        activeOnly,
      }),
    select: (data) => data.myIncomeStreams,
  });
}

/**
 * Add income stream
 */
export function useAddIncomeStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: AddIncomeStreamInput) =>
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
 * Update income stream
 */
export function useUpdateIncomeStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateIncomeStreamInput) =>
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
 * Delete income stream
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
// EXPENSE HOOKS
// =============================================================================

/**
 * Get expenses
 */
export function useMyExpenses(filters?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  isRecurring?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.finance.expenses(filters),
    queryFn: () =>
      gqlRequest<{ myExpenses: ExpenseResponse[] }>(queries.MY_EXPENSES_QUERY, filters),
    select: (data) => data.myExpenses,
  });
}

/**
 * Add expense
 */
export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: AddExpenseInput) =>
      gqlRequest<{ addExpense: ExpenseResponse }>(mutations.EXPENSE_ADD_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Update expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateExpenseInput) =>
      gqlRequest<{ updateExpense: ExpenseResponse }>(mutations.EXPENSE_UPDATE_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Delete expense
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
// BUDGET HOOKS
// =============================================================================

/**
 * Get budgets
 */
export function useMyBudgets() {
  return useQuery({
    queryKey: queryKeys.finance.budgets(),
    queryFn: () => gqlRequest<{ myBudgets: BudgetResponse[] }>(queries.MY_BUDGETS_QUERY),
    select: (data) => data.myBudgets,
  });
}

/**
 * Set budget
 */
export function useSetBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: SetBudgetInput) =>
      gqlRequest<{ setBudget: BudgetResponse }>(mutations.BUDGET_SET_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Update budget spend
 */
export function useUpdateBudgetSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, currentSpend }: { id: string; currentSpend: string }) =>
      gqlRequest<{ updateBudgetSpend: BudgetResponse }>(mutations.BUDGET_UPDATE_SPEND_MUTATION, {
        id,
        currentSpend,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

/**
 * Delete budget
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

// =============================================================================
// SUMMARY HOOKS
// =============================================================================

/**
 * Get financial summary
 */
export function useMyFinancialSummary() {
  return useQuery({
    queryKey: queryKeys.finance.summary(),
    queryFn: () =>
      gqlRequest<{ myFinancialSummary: FinancialSummaryResponse }>(
        queries.MY_FINANCIAL_SUMMARY_QUERY
      ),
    select: (data) => data.myFinancialSummary,
  });
}
