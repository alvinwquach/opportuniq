// Pull in three core TanStack Query tools:
// - useQuery: for fetching and caching data (read operations)
// - useMutation: for sending changes to the server (write/delete operations)
// - useQueryClient: gives us a handle to the shared query cache so we can
//   manually invalidate (expire) entries after a mutation succeeds
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import the centralized cache-key factory so every hook in the app uses the
// exact same key structure — prevents accidental cache misses or duplicates
import { queryKeys } from "./keys";

// Import every server action that talks to the database for expense-setting data.
// These run on the server (Next.js Server Actions), so the browser never
// touches the database directly.
import {
  // Fetch the expense configuration for a group (e.g. currency, approval rules)
  getGroupExpenseSettings,
  // Fetch the list of expense categories defined for a group
  getGroupExpenseCategories,
  // Overwrite/update the expense settings for a group
  updateExpenseSettings,
  // Add a brand-new expense category to a group
  createExpenseCategory,
  // Change the name, color, icon, or budget limit of an existing category
  updateExpenseCategory,
  // Remove an expense category from a group permanently
  deleteExpenseCategory,
} from "@/app/actions/expense-settings/expenseSettingsActions";

// ─────────────────────────────────────────────────────────────────────────────
// READ HOOKS  (useQuery — fetch & cache data)
// ─────────────────────────────────────────────────────────────────────────────

// Fetches the top-level expense settings for a specific group.
// "Expense settings" control how the group handles shared spending —
// things like which currency to use or whether receipts are required.
// The component that calls this hook receives { data, isLoading, error }.
export function useGroupExpenseSettings(groupId: string) {
  return useQuery({
    // Cache key uniquely identifies this group's expense settings in the cache.
    // Using the groupId means different groups get different cache slots.
    queryKey: queryKeys.expenseSettings.group(groupId),

    // The actual async function that runs to fetch data from the server.
    queryFn: () => getGroupExpenseSettings(groupId),

    // Safety guard: only run the query when groupId is a non-empty string.
    // `!!groupId` converts to boolean (empty string → false).
    // Without this, the query would fire immediately with an empty string
    // and likely return wrong data or cause an error.
    enabled: !!groupId,
  });
}

// Fetches the list of expense categories defined for a specific group.
// Categories are the labels users apply to expenses (e.g. "Food", "Travel").
export function useGroupExpenseCategories(groupId: string) {
  return useQuery({
    // Separate cache key for categories vs. settings, so the two datasets
    // don't collide even though they share the same groupId.
    queryKey: queryKeys.expenseSettings.categories(groupId),

    // Calls the server to get all categories for this group.
    queryFn: () => getGroupExpenseCategories(groupId),

    // Block the query from running until a real groupId is present —
    // same reasoning as above.
    enabled: !!groupId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE HOOKS  (useMutation — send changes to the server)
// ─────────────────────────────────────────────────────────────────────────────

// Updates the top-level expense configuration for a group.
// For example, a group admin might change the approval threshold or currency.
// Returns { mutate, isPending, error } for the calling component to use.
export function useUpdateExpenseSettings() {
  // Get access to the shared query cache so we can expire stale data
  // after the mutation completes.
  const queryClient = useQueryClient();

  return useMutation({
    // The function that actually sends the update to the server.
    // Destructures the single argument object into `groupId` and `input`.
    mutationFn: ({
      groupId,
      input,
    }: {
      // Which group's settings are being changed
      groupId: string;
      input: {
        // Whether the group tracks shared expenses between members (optional)
        trackSharedExpenses?: boolean;
        // Whether users must attach a receipt image to each expense (optional)
        requireReceipts?: boolean;
        // Minimum expense amount (as a string) that requires manager approval (optional)
        approvalThreshold?: string;
        // How costs are split by default, e.g. "equal" or "proportional" (optional)
        defaultSplitMethod?: string;
        // The currency code the group uses, e.g. "USD" or "EUR" (optional)
        currency?: string;
      };
    }) => updateExpenseSettings(groupId, input),

    // Runs automatically after the server confirms the update succeeded.
    // The second argument `{ groupId }` is the original variables object —
    // we destructure it to get the groupId for targeted cache invalidation.
    onSuccess: (_, { groupId }) => {
      // Expire the cached settings for this group so the UI refetches
      // and shows the updated values right away.
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.group(groupId) });
    },
  });
}

// Creates a new expense category inside a group.
// For example: adding a "Utilities" category that members can assign expenses to.
export function useCreateExpenseCategory() {
  // Grab the query cache handle so we can invalidate specific entries.
  const queryClient = useQueryClient();

  return useMutation({
    // The function that sends the new category data to the server.
    mutationFn: ({
      groupId,
      input,
    }: {
      // Which group the new category belongs to
      groupId: string;
      input: {
        // The display label for the category, e.g. "Groceries" (required)
        name: string;
        // Hex or named colour used to visually distinguish the category in the UI (optional)
        color?: string;
        // An icon identifier (e.g. an emoji or icon name) to display next to the category (optional)
        icon?: string;
        // Maximum amount allowed for this category per month, as a string (optional)
        budgetLimit?: string;
      };
    }) => createExpenseCategory(groupId, input),

    // After a successful creation, expire the categories cache for this group
    // so the list view refetches and immediately shows the new category.
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.categories(groupId) });
    },
  });
}

// Updates an existing expense category — for example, renaming it or
// changing the budget limit.
export function useUpdateExpenseCategory() {
  // Get a reference to the shared query cache.
  const queryClient = useQueryClient();

  return useMutation({
    // The mutation receives three things:
    //   `id`      — the unique identifier of the category to change
    //   `input`   — the fields to update (all are optional, only send what changed)
    //   `groupId` — needed after the mutation to know which cache to invalidate
    mutationFn: ({
      id,
      input,
      groupId,
    }: {
      // Unique ID of the category being edited
      id: string;
      input: {
        // New display label for the category (optional)
        name?: string;
        // Updated colour value (optional)
        color?: string;
        // Updated icon identifier (optional)
        icon?: string;
        // Updated monthly budget cap as a string (optional)
        budgetLimit?: string;
      };
      // The group this category belongs to — used only for cache invalidation,
      // not passed to the server action itself
      groupId: string;
    }) => updateExpenseCategory(id, input),

    // After the update is confirmed, expire the categories cache so the UI
    // re-renders with the freshest category data for this group.
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.categories(groupId) });
    },
  });
}

// Permanently removes an expense category from a group.
// Components should call the returned `mutate({ id, groupId })` to trigger this.
export function useDeleteExpenseCategory() {
  // Grab the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // The mutation receives both the category ID to delete and the groupId
    // (which is only needed for cache invalidation after deletion).
    // Note: the server action only needs `id`; `groupId` is carried along
    // purely so onSuccess knows which cache entry to invalidate.
    mutationFn: ({ id, groupId }: { id: string; groupId: string }) =>
      deleteExpenseCategory(id),

    // After deletion is confirmed by the server, expire the categories cache
    // for this group so the deleted category disappears from the UI immediately.
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSettings.categories(groupId) });
    },
  });
}
