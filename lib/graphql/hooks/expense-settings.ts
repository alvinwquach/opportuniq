/**
 * Expense Settings GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  ExpenseSettingsResponse,
  ExpenseCategoryResponse,
  UpdateExpenseSettingsInput,
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
} from "../types";

/**
 * Get expense settings for a group
 */
export function useGroupExpenseSettings(groupId: string) {
  return useQuery({
    queryKey: queryKeys.expenseSettings.group(groupId),
    queryFn: () =>
      gqlRequest<{ groupExpenseSettings: ExpenseSettingsResponse | null }>(
        queries.GROUP_EXPENSE_SETTINGS_QUERY,
        { groupId }
      ),
    select: (data) => data.groupExpenseSettings,
    enabled: !!groupId,
  });
}

/**
 * Get expense categories for a group
 */
export function useGroupExpenseCategories(groupId: string) {
  return useQuery({
    queryKey: queryKeys.expenseSettings.categories(groupId),
    queryFn: () =>
      gqlRequest<{ groupExpenseCategories: ExpenseCategoryResponse[] }>(
        queries.GROUP_EXPENSE_CATEGORIES_QUERY,
        { groupId }
      ),
    select: (data) => data.groupExpenseCategories,
    enabled: !!groupId,
  });
}

/**
 * Update expense settings for a group
 */
export function useUpdateExpenseSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: UpdateExpenseSettingsInput }) =>
      gqlRequest<{ updateExpenseSettings: ExpenseSettingsResponse }>(
        mutations.EXPENSE_SETTINGS_UPDATE_MUTATION,
        { groupId, input }
      ),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.group(groupId) });
    },
  });
}

/**
 * Create an expense category
 */
export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: CreateExpenseCategoryInput }) =>
      gqlRequest<{ createExpenseCategory: ExpenseCategoryResponse }>(
        mutations.EXPENSE_CATEGORY_CREATE_MUTATION,
        { groupId, input }
      ),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.categories(groupId) });
    },
  });
}

/**
 * Update an expense category
 */
export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
      groupId,
    }: {
      id: string;
      input: UpdateExpenseCategoryInput;
      groupId: string;
    }) =>
      gqlRequest<{ updateExpenseCategory: ExpenseCategoryResponse }>(
        mutations.EXPENSE_CATEGORY_UPDATE_MUTATION,
        { id, input }
      ),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.categories(groupId) });
    },
  });
}

/**
 * Delete an expense category
 */
export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, groupId }: { id: string; groupId: string }) =>
      gqlRequest<{ deleteExpenseCategory: boolean }>(
        mutations.EXPENSE_CATEGORY_DELETE_MUTATION,
        { id }
      ),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.categories(groupId) });
    },
  });
}
