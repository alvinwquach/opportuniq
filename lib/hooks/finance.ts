// Pull in three core TanStack Query tools:
// - useQuery: for fetching and caching data (read operations)
// - useMutation: for sending changes to the server (write/delete operations)
// - useQueryClient: gives us a handle to the shared query cache so we can
//   manually invalidate (expire) entries after a mutation succeeds
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import the centralized cache-key factory so every hook uses the exact
// same key structure — this prevents accidental cache misses or duplicates
import { queryKeys } from "./keys";

// Import every server action that talks to the database for financial data.
// These run on the server (Next.js Server Actions), so the browser never
// touches the database directly.
import {
  // Fetch all income streams (salary, freelance, rental income, etc.)
  // for the currently logged-in user
  getMyIncomeStreams,
  // Fetch all expense records for the current user, with optional filters
  getMyExpenses,
  // Fetch all budget targets the current user has set per category
  getMyBudgets,
  // Fetch the aggregated financial summary (total income, total spend, net)
  getMyFinancialSummary,
  // Create a new income stream entry in the database
  addIncomeStream,
  // Update an existing income stream (e.g. change the amount or mark inactive)
  updateIncomeStream,
  // Remove an income stream permanently
  deleteIncomeStream,
  // Record a new expense
  addExpense,
  // Update an existing expense entry
  updateExpense,
  // Delete an expense entry
  deleteExpense,
  // Create or overwrite a monthly budget limit for a category
  setBudget,
  // Update the "current spend" counter on an existing budget entry
  updateBudgetSpend,
  // Remove a budget entry
  deleteBudget,
} from "@/app/actions/finance/financeActions";

// ─────────────────────────────────────────────────────────────────────────────
// INCOME STREAM HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Fetches all income streams for the current user.
// `activeOnly` — when true, only returns streams that are currently active
// (i.e. haven't ended yet).
// The component that calls this hook receives { data, isLoading, error }.
export function useMyIncomeStreams(activeOnly?: boolean) {
  return useQuery({
    // Cache key for the user's income data.
    // All income queries share this slot so that invalidating it triggers a
    // refetch everywhere income data is displayed.
    queryKey: queryKeys.finance.income(),

    // The async function that actually goes to the server and fetches data.
    // Passes the optional `activeOnly` flag so the server can filter.
    queryFn: () => getMyIncomeStreams(activeOnly),

    // No `enabled` guard — this query runs as soon as the component mounts.
  });
}

// Creates a new income stream for the current user.
// Returns { mutate, isPending, error } for the calling component.
export function useAddIncomeStream() {
  // Get access to the shared query cache so we can expire stale entries
  // after the mutation completes.
  const queryClient = useQueryClient();

  return useMutation({
    // The function that actually sends the new income stream to the server.
    mutationFn: (variables: {
      // Where the income comes from, e.g. "Freelance" or "Salary" (required)
      source: string;
      // The amount earned per frequency period, as a string (required)
      amount: string;
      // How often the income recurs, e.g. "monthly" or "weekly" (required)
      frequency: string;
      // A free-text note about the income source (optional)
      description?: string;
      // ISO date string for when this income stream begins (optional)
      startDate?: string;
      // ISO date string for when this income stream ends (optional, omit if ongoing)
      endDate?: string;
    }) => addIncomeStream(variables),

    // After the server confirms the new stream was saved:
    onSuccess: () => {
      // Expire every finance-related cache entry at once.
      // This broad invalidation ensures the income list, summary, and any
      // other finance views all refetch and show the newly added stream.
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Updates an existing income stream — for example, to change the amount
// when the user gets a pay rise, or to mark it inactive when it ends.
export function useUpdateIncomeStream() {
  // Grab the query cache handle so we can expire stale finance data.
  const queryClient = useQueryClient();

  return useMutation({
    // The server action expects a single object with the stream's ID and any
    // fields that should change. All fields except `id` are optional.
    mutationFn: (variables: {
      // Unique ID of the income stream to update (required)
      id: string;
      // New source label if changing (optional)
      source?: string;
      // New amount string if changing (optional)
      amount?: string;
      // New frequency if changing (optional)
      frequency?: string;
      // Updated description (optional)
      description?: string;
      // Set to false to deactivate the stream without deleting it (optional)
      isActive?: boolean;
      // Updated start date (optional)
      startDate?: string;
      // Updated end date (optional)
      endDate?: string;
    }) => updateIncomeStream(variables),

    // Expire all finance caches after a successful update so every finance
    // component refetches the freshest data.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Permanently deletes an income stream by its ID.
export function useDeleteIncomeStream() {
  // Get a reference to the query cache.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just the stream's unique ID — no other data needed for a delete.
    mutationFn: (id: string) => deleteIncomeStream(id),

    // After deletion, expire all finance data so the deleted stream
    // disappears from all lists and summaries.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Fetches the current user's expense records with optional filters.
// Each unique combination of filters gets its own cache slot so the user
// can switch between date ranges without losing previously loaded data.
export function useMyExpenses(filters?: {
  // Only return expenses on or after this ISO date string (optional)
  startDate?: string;
  // Only return expenses on or before this ISO date string (optional)
  endDate?: string;
  // Only return expenses in this category, e.g. "Food" (optional)
  category?: string;
  // When true, only return recurring expenses; false = one-off only (optional)
  isRecurring?: boolean;
  // Maximum number of records to return — used for pagination (optional)
  limit?: number;
  // Number of records to skip before starting to return — used for pagination (optional)
  offset?: number;
}) {
  return useQuery({
    // The filters object is embedded in the key so each unique combination
    // gets its own cache slot and doesn't overwrite other filter results.
    queryKey: queryKeys.finance.expenses(filters),

    // Pass the filters through to the server action.
    queryFn: () => getMyExpenses(filters),
  });
}

// Records a new expense for the current user.
export function useAddExpense() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Sends the new expense data to the server.
    mutationFn: (variables: {
      // Which category this expense belongs to, e.g. "Transport" (required)
      category: string;
      // The amount spent as a string (required)
      amount: string;
      // A note describing what the money was spent on (optional)
      description?: string;
      // The ISO date string when the expense occurred (required)
      date: string;
      // Whether this expense repeats on a schedule (optional, defaults to false)
      isRecurring?: boolean;
      // If recurring, how often it repeats, e.g. "monthly" (optional)
      recurringFrequency?: string;
      // If this expense is related to a tracked issue, link it here (optional)
      issueId?: string;
    }) => addExpense(variables),

    // Expire all finance caches after adding an expense so totals,
    // summaries, and lists all show the updated data.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Updates an existing expense entry.
export function useUpdateExpense() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // The server action receives the expense ID plus whichever fields
    // the user changed. All fields except `id` are optional.
    mutationFn: (variables: {
      // Unique ID of the expense record to update (required)
      id: string;
      // New category if changing (optional)
      category?: string;
      // New amount string if changing (optional)
      amount?: string;
      // Updated description (optional)
      description?: string;
      // Updated ISO date string if changing (optional)
      date?: string;
      // Updated recurring flag (optional)
      isRecurring?: boolean;
      // Updated frequency string (optional)
      recurringFrequency?: string;
    }) => updateExpense(variables),

    // Expire all finance caches so every finance view reflects the change.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Permanently deletes an expense entry by its ID.
export function useDeleteExpense() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just the expense's unique ID.
    mutationFn: (id: string) => deleteExpense(id),

    // Expire all finance caches after deletion so the removed expense
    // no longer appears in any list or total.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Fetches all budget targets the current user has configured.
// A "budget" is a monthly spending limit for a specific expense category.
export function useMyBudgets() {
  return useQuery({
    // Cache key for the user's budget list.
    queryKey: queryKeys.finance.budgets(),

    // Ask the server for all budgets belonging to the current user.
    queryFn: () => getMyBudgets(),
  });
}

// Creates or overwrites a monthly budget limit for a given expense category.
// If a budget for that category already exists, it is replaced.
export function useSetBudget() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Sends the category and the new monthly limit to the server.
    mutationFn: (variables: {
      // The expense category this budget applies to, e.g. "Groceries" (required)
      category: string;
      // The maximum amount the user wants to spend per month, as a string (required)
      monthlyLimit: string;
    }) => setBudget(variables),

    // Expire all finance caches after setting a budget so the budgets list
    // and any summary calculations refresh.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Updates the "current spend" figure on an existing budget entry.
// This is called to keep the budget's running total in sync with actual expenses.
export function useUpdateBudgetSpend() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes the budget record's ID and the updated spend amount as a string.
    mutationFn: ({ id, currentSpend }: { id: string; currentSpend: string }) =>
      updateBudgetSpend(id, currentSpend),

    // Expire all finance caches so the budget progress bars and summaries
    // display the freshly updated spend amount.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Permanently removes a budget entry by its ID.
export function useDeleteBudget() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just the budget record's unique ID.
    mutationFn: (id: string) => deleteBudget(id),

    // Expire all finance caches so the deleted budget no longer appears
    // in any list or summary.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL SUMMARY HOOK
// ─────────────────────────────────────────────────────────────────────────────

// Fetches the aggregated financial summary for the current user.
// The summary typically includes total income, total expenses, and net balance
// — the high-level numbers shown on a finance dashboard or overview card.
export function useMyFinancialSummary() {
  return useQuery({
    // Cache key for the summary — separate from the raw income/expense lists
    // so they can be fetched independently.
    queryKey: queryKeys.finance.summary(),

    // Ask the server to compute and return the aggregated summary.
    queryFn: () => getMyFinancialSummary(),
  });
}
