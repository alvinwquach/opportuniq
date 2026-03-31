// Pull in three core TanStack Query tools:
// - useQuery: for fetching and caching data (read operations)
// - useMutation: for sending changes to the server (write/delete operations)
// - useQueryClient: gives us a handle to the shared query cache so we can
//   manually invalidate (expire) entries after a mutation succeeds
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import the centralized cache-key factory so every hook in the app uses the
// exact same key structure — prevents accidental cache misses or duplicates
import { queryKeys } from "./keys";

// Import the server action that assembles ALL finance page data in a single
// round-trip. Instead of making four separate queries when the page loads,
// this returns everything at once (income + expenses + budgets + summary).
import { getFinancesPageData } from "@/app/actions/dashboard/getFinancesPageData";

// Import every individual server action for financial operations.
// These run on the server (Next.js Server Actions), so the browser never
// touches the database directly.
import {
  // Fetch all income streams for the current user (salary, freelance, etc.)
  getMyIncomeStreams,
  // Fetch the current user's expense records with optional filters
  getMyExpenses,
  // Fetch all budget targets the current user has set per category
  getMyBudgets,
  // Fetch the aggregated financial summary (totals, net balance)
  getMyFinancialSummary,
  // Create a new income stream entry
  addIncomeStream,
  // Update an existing income stream's details
  updateIncomeStream,
  // Remove an income stream permanently
  deleteIncomeStream,
  // Record a new expense
  addExpense,
  // Update an existing expense entry
  updateExpense,
  // Remove an expense entry permanently
  deleteExpense,
  // Create or overwrite a monthly budget limit for a category
  setBudget,
  // Remove a budget entry permanently
  deleteBudget,
} from "@/app/actions/finance/financeActions";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE-LEVEL DATA HOOK
// ─────────────────────────────────────────────────────────────────────────────

// Fetches the complete data bundle needed to render the Finances page.
// Using a single pre-assembled fetch avoids multiple waterfalling requests
// that would slow down the initial page load.
// The component receives { data, isLoading, error }.
export function useFinancesPageData() {
  return useQuery({
    // Cache key for the full finances page bundle. Separate from the
    // individual income/expense/budget keys so this bundle and the
    // granular queries can coexist without overwriting each other.
    queryKey: queryKeys.finance.pageData(),

    // The server action that computes and returns the entire page payload.
    queryFn: () => getFinancesPageData(),

    // Keep the cached result "fresh" for 2 minutes (1000 ms × 60 × 2).
    // During this window, navigating away and back will NOT trigger a
    // background network request — the cached data is returned immediately.
    // After 2 minutes the data is considered "stale" and will be refetched
    // the next time the query is needed.
    staleTime: 1000 * 60 * 2,

    // When the user switches back to this browser tab (window regains focus),
    // automatically trigger a background refetch so the data stays current
    // even after the user has been away for a while.
    refetchOnWindowFocus: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL READ HOOKS  (useQuery — fetch & cache specific slices of data)
// ─────────────────────────────────────────────────────────────────────────────

// Fetches only the income streams for the current user.
// `activeOnly` — when true, only returns streams that are currently active.
// Used by components that need just the income list, not the full page bundle.
export function useIncomeStreams(activeOnly?: boolean) {
  return useQuery({
    // Cache key scoped to income data — shares the same slot as any other
    // hook that requests income so data isn't duplicated in the cache.
    queryKey: queryKeys.finance.income(),

    // Pass the optional filter flag to the server action.
    queryFn: () => getMyIncomeStreams(activeOnly),
  });
}

// Fetches the current user's expense records with optional filters.
// Each unique combination of filters gets its own cache slot so the user
// can switch views without losing previously loaded data.
export function useExpenses(options?: {
  // Only return expenses on or after this ISO date string (optional)
  startDate?: string;
  // Only return expenses on or before this ISO date string (optional)
  endDate?: string;
  // Only return expenses tagged with this category, e.g. "Food" (optional)
  category?: string;
  // When true, return only recurring expenses; false = one-off only (optional)
  isRecurring?: boolean;
  // Max number of records to return — for pagination (optional)
  limit?: number;
}) {
  return useQuery({
    // The options object is embedded in the key so different filter
    // combinations are stored separately in the cache.
    queryKey: queryKeys.finance.expenses(options),

    // Send the filters through to the server action.
    queryFn: () => getMyExpenses(options),
  });
}

// Fetches all budget targets the current user has configured.
// A "budget" is a monthly spending cap for a specific expense category.
export function useBudgets() {
  return useQuery({
    // Cache key for the budgets list.
    queryKey: queryKeys.finance.budgets(),

    // Ask the server for all budgets belonging to the current user.
    queryFn: () => getMyBudgets(),
  });
}

// Fetches the aggregated financial summary (total income, total expenses,
// net balance). Used by summary cards and overview widgets.
export function useFinancialSummary() {
  return useQuery({
    // Cache key for the summary — separate from raw lists so they don't
    // interfere when one is invalidated independently of the other.
    queryKey: queryKeys.finance.summary(),

    // Ask the server to compute and return the aggregated figures.
    queryFn: () => getMyFinancialSummary(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INCOME STREAM MUTATION HOOKS  (useMutation — send changes to the server)
// ─────────────────────────────────────────────────────────────────────────────

// Creates a new income stream for the current user.
// Returns { mutate, isPending, error } for the calling component.
export function useAddIncomeStream() {
  // Get access to the shared query cache so we can expire stale entries
  // after the mutation completes.
  const queryClient = useQueryClient();

  return useMutation({
    // The function that actually sends the new income stream to the server.
    mutationFn: (variables: {
      // Where the income comes from, e.g. "Salary" or "Freelance" (required)
      source: string;
      // The amount earned per frequency period, as a string (required)
      amount: string;
      // How often the income recurs, e.g. "monthly" or "weekly" (required)
      frequency: string;
      // A free-text note about the income source (optional)
      description?: string;
      // ISO date string for when this income stream begins (optional)
      startDate?: string;
      // ISO date string for when this income stream ends (optional)
      endDate?: string;
    }) => addIncomeStream(variables),

    // After the server confirms the new stream was saved, expire every
    // finance-related cache entry so all finance views refetch.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Updates an existing income stream — for example, to adjust the amount
// after a pay rise or to mark a stream inactive when it ends.
export function useUpdateIncomeStream() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // All fields except `id` are optional — only send what needs to change.
    mutationFn: (variables: {
      // Unique ID of the income stream to update (required)
      id: string;
      // New source label if changing (optional)
      source?: string;
      // New amount string if changing (optional)
      amount?: string;
      // New frequency string if changing (optional)
      frequency?: string;
      // Updated description (optional)
      description?: string;
      // Set to false to deactivate without deleting (optional)
      isActive?: boolean;
      // Updated start date (optional)
      startDate?: string;
      // Updated end date (optional)
      endDate?: string;
    }) => updateIncomeStream(variables),

    // Expire all finance caches so every finance component shows fresh data.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// Permanently deletes an income stream by its ID.
export function useDeleteIncomeStream() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just the stream's unique ID — no other data needed for a delete.
    mutationFn: (id: string) => deleteIncomeStream(id),

    // Expire all finance caches so the deleted stream no longer appears
    // anywhere in the UI.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE MUTATION HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Records a new expense for the current user.
export function useAddExpense() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Sends the new expense data to the server.
    mutationFn: (variables: {
      // Which category this expense belongs to, e.g. "Transport" (required)
      category: string;
      // The amount spent, as a string (required)
      amount: string;
      // A note about what the money was spent on (optional)
      description?: string;
      // The ISO date string for when the expense occurred (required)
      date: string;
      // Whether this expense repeats on a schedule (optional)
      isRecurring?: boolean;
      // If recurring, how often it repeats, e.g. "monthly" (optional)
      recurringFrequency?: string;
      // If this expense relates to a tracked issue, link it here (optional)
      issueId?: string;
    }) => addExpense(variables),

    // Expire all finance caches so totals, lists, and summaries all update.
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
    // All fields except `id` are optional — only send what changed.
    mutationFn: (variables: {
      // Unique ID of the expense record to update (required)
      id: string;
      // New category if changing (optional)
      category?: string;
      // New amount string if changing (optional)
      amount?: string;
      // Updated description (optional)
      description?: string;
      // Updated ISO date string if the date is being corrected (optional)
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

    // Expire all finance caches so the deleted expense no longer appears
    // in any list or total.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET MUTATION HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Creates or overwrites a monthly budget limit for a given expense category.
// If a budget for that category already exists it is replaced, not duplicated.
export function useSetBudget() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Sends the category name and the desired monthly spending cap to the server.
    mutationFn: (variables: {
      // The expense category to set a limit for, e.g. "Groceries" (required)
      category: string;
      // The maximum amount allowed per month, as a string (required)
      monthlyLimit: string;
    }) => setBudget(variables),

    // Expire all finance caches so the budgets list and any progress
    // indicators refresh with the new limit.
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
    // in the budgets list or affects any summary calculations.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
}
