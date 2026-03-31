// Pull in three core TanStack Query tools:
// - useQuery: for fetching and caching data (read operations)
// - useMutation: for sending changes to the server (write/delete operations)
// - useQueryClient: gives us a handle to the shared query cache so we can
//   manually invalidate (expire) entries after a mutation succeeds
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import the centralized cache-key factory so every hook uses the exact
// same key structure — prevents accidental cache misses or duplicates
import { queryKeys } from "./keys";

// Import the server action that pre-assembles all the data the Issues page
// needs in a single round-trip (avoids multiple waterfall requests on load)
import { getIssuesPageData } from "@/app/actions/dashboard/getIssuesPageData";

// Import every server action that talks to the database for issue data.
// These run on the server (Next.js Server Actions), so the browser never
// touches the database directly.
import {
  // Fetch a filtered list of issues belonging to a specific group
  getIssues,
  // Fetch the full detail record for a single issue by its ID
  getIssue,
  // Create a brand-new issue in the database
  createIssue,
  // Update an existing issue's fields (title, priority, status, etc.)
  updateIssue,
  // Permanently delete an issue and all its related data
  deleteIssueAction,
  // Mark an issue as resolved and optionally record how it was resolved
  resolveIssue,
  // Reopen a previously resolved issue so work can continue on it
  reopenIssue,
  // Add a new comment to an issue's discussion thread
  addComment,
  // Remove a comment from an issue's discussion thread
  deleteComment,
  // Update the text content of an existing comment
  editComment,
} from "@/app/actions/issues/issueActions";

// ─────────────────────────────────────────────────────────────────────────────
// READ HOOKS  (useQuery — fetch & cache data)
// ─────────────────────────────────────────────────────────────────────────────

// Fetches a filtered list of issues belonging to a specific group.
// Different filter combinations each get their own cache slot so switching
// between views (e.g. "open" vs "resolved") doesn't discard loaded data.
// The component receives { data, isLoading, error }.
export function useIssues(
  groupId: string,
  filters?: {
    // Only return issues with this status, e.g. "open" or "resolved" (optional)
    status?: string;
    // Only return issues with this priority, e.g. "high" or "low" (optional)
    priority?: string;
    // Only return issues in this category, e.g. "bug" or "feature" (optional)
    category?: string;
    // Maximum number of records to return — used for pagination (optional)
    limit?: number;
    // Number of records to skip — used for pagination (optional)
    offset?: number;
  }
) {
  return useQuery({
    // Cache key encodes both the groupId and the active filters so each
    // unique combination of group + filters gets its own cache slot.
    queryKey: queryKeys.issues.list(groupId, filters),

    // Call the server action with the group ID and any active filters.
    queryFn: () => getIssues(groupId, filters),

    // Safety guard: only run the query when we have a real groupId.
    // `!!groupId` converts the string to a boolean (empty string → false).
    // Without this, the query would fire with an empty string and likely
    // return wrong data or an error.
    enabled: !!groupId,
  });
}

// Fetches the full detail record for a single issue.
// "Detail" means the complete record including description, comments,
// history, and any linked data — more information than a list item.
export function useIssue(id: string) {
  return useQuery({
    // Cache key scoped to this specific issue so different issues each
    // have their own cache slot and don't overwrite each other.
    queryKey: queryKeys.issues.detail(id),

    // Fetch the full issue record from the server.
    queryFn: () => getIssue(id),

    // Block the query from running until we have a real ID.
    enabled: !!id,
  });
}

// Fetches an issue's full record AND its associated decision options.
// "withOptions" is a separate cache slot from the plain detail so that
// components needing both pieces of data can request them together without
// affecting the plain-detail cache used by other components.
export function useIssueWithOptions(id: string) {
  return useQuery({
    // Separate cache key from useIssue — includes "options" in the key
    // so this variant is stored independently.
    queryKey: queryKeys.issues.withOptions(id),

    // Re-uses the same server action as useIssue — the server returns the
    // full record including options in a single response.
    queryFn: () => getIssue(id),

    // Block the query from running until we have a real ID.
    enabled: !!id,
  });
}

// Fetches the pre-assembled data bundle needed to render the Issues page.
// Using a single bundled fetch prevents multiple parallel requests from
// racing on page load and keeps the loading experience smooth.
export function useIssuesPageData() {
  return useQuery({
    // Cache key for the full issues page bundle — separate from the
    // individual issue keys so they don't interfere with each other.
    queryKey: queryKeys.issues.pageData(),

    // The server action that computes and returns the entire page payload.
    queryFn: () => getIssuesPageData(),

    // Keep the cached result "fresh" for 2 minutes (1000 ms × 60 × 2).
    // Navigating away and back within this window won't trigger a network
    // request — the cached data is returned immediately.
    staleTime: 1000 * 60 * 2,

    // When the user switches back to this browser tab (window regains focus),
    // automatically run a background refetch so the data stays current
    // even if the user has been working in another tab.
    refetchOnWindowFocus: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE CRUD MUTATION HOOKS  (useMutation — send changes to the server)
// ─────────────────────────────────────────────────────────────────────────────

// Creates a new issue inside a group.
// Returns { mutate, isPending, error } for the calling component to use.
export function useCreateIssue() {
  // Get access to the shared query cache so we can expire stale entries
  // after the mutation completes.
  const queryClient = useQueryClient();

  return useMutation({
    // The function that actually sends the new issue data to the server.
    mutationFn: (input: {
      // Which group this issue belongs to (required)
      groupId: string;
      // Short headline describing the issue (required)
      title: string;
      // Detailed explanation of the issue (optional)
      description?: string;
      // Top-level category label, e.g. "Infrastructure" (optional)
      category?: string;
      // More specific sub-category within the category (optional)
      subcategory?: string;
      // Urgency level, e.g. "high", "medium", or "low" (optional)
      priority?: string;
      // The name of the asset or resource this issue relates to (optional)
      assetName?: string;
      // Structured data with extra details about the related asset (optional)
      assetDetails?: unknown;
    }) => createIssue(input),

    // `data` is the newly created issue record returned by the server.
    onSuccess: (data) => {
      // Only invalidate group-scoped caches if the returned issue has a groupId.
      // This guard protects against cases where the server returns partial data.
      if (data?.groupId) {
        // Expire all issue list caches so the new issue appears in every list.
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });

        // Also expire the specific group's detail cache because the group's
        // issue count or summary data may have changed.
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(data.groupId) });
      }

      // Always expire the dashboard stats cache because creating an issue
      // changes the total open-issue count shown on the dashboard.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// Updates an existing issue — for example, to change its priority,
// status, or description.
export function useUpdateIssue() {
  // Grab the query cache handle so we can invalidate specific entries.
  const queryClient = useQueryClient();

  return useMutation({
    // Receives the issue ID and an input object with whichever fields changed.
    // All input fields are optional — only send what needs to update.
    mutationFn: ({
      id,
      input,
    }: {
      // Unique ID of the issue to update (required)
      id: string;
      input: {
        // Updated headline title (optional)
        title?: string;
        // Updated description body (optional)
        description?: string;
        // Updated top-level category (optional)
        category?: string;
        // Updated sub-category (optional)
        subcategory?: string;
        // Updated priority level (optional)
        priority?: string;
        // Updated status, e.g. "in_progress" or "blocked" (optional)
        status?: string;
        // Updated asset name (optional)
        assetName?: string;
        // Updated structured asset data (optional)
        assetDetails?: unknown;
      };
    }) => updateIssue(id, input),

    // The second argument `{ id }` is the original variables — we use `id`
    // to pinpoint the exact cache entries that need to be expired.
    onSuccess: (_, { id }) => {
      // Expire the cache for this specific issue so the detail view
      // refetches the updated record.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(id) });

      // Also expire all issue lists so any list views show the updated data
      // (e.g. a status change should move the card to a different column).
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
    },
  });
}

// Permanently deletes an issue and all its associated data.
export function useDeleteIssue() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just the issue's unique ID — no other data needed for a delete.
    mutationFn: (id: string) => deleteIssueAction(id),

    // After deletion is confirmed by the server:
    onSuccess: () => {
      // Expire ALL issue cache entries (lists + details) so the deleted
      // issue disappears everywhere it might be displayed.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });

      // Also expire the dashboard stats because the open-issue count has
      // decreased and the dashboard numbers need to update.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT MUTATION HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Adds a new comment to an issue's discussion thread.
export function useAddComment() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Sends the issueId (to associate the comment) and the comment text.
    mutationFn: (input: {
      // The issue this comment belongs to (required)
      issueId: string;
      // The text content of the comment (required)
      content: string;
    }) => addComment(input),

    // `issueId` comes from the original variables so we know which issue
    // detail cache to expire after the comment is saved.
    onSuccess: (_, { issueId }) => {
      // Expire the detail cache for this issue so the comment thread
      // refetches and displays the newly added comment immediately.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
    },
  });
}

// Removes a specific comment from an issue's discussion thread.
export function useDeleteComment() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Receives both the comment ID (to identify what to delete) and the
    // issueId (needed only for cache invalidation — not sent to the server).
    mutationFn: ({ id, issueId }: { id: string; issueId: string }) => deleteComment(id),

    // After deletion, expire the detail cache for the parent issue so
    // the removed comment no longer appears in the thread.
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
    },
  });
}

// Updates the text content of an existing comment.
export function useEditComment() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Receives the comment's ID, the new text content, and the parent issueId
    // (carried along for cache invalidation but not forwarded to the server).
    mutationFn: ({ id, content, issueId }: { id: string; content: string; issueId: string }) =>
      editComment(id, content),

    // Expire the parent issue's detail cache so the edited comment text
    // is immediately visible in the thread.
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE STATUS MUTATION HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Marks an issue as resolved, optionally recording how it was resolved.
// This transitions the issue from an active/open state to a closed state.
export function useResolveIssue() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes the issue ID and an optional resolution descriptor object.
    mutationFn: ({
      id,
      input,
    }: {
      // Unique ID of the issue being resolved (required)
      id: string;
      input: {
        // How the issue was resolved, e.g. "fixed", "won't fix" (optional)
        resolutionType?: string;
        // Free-text notes explaining how or why the issue was resolved (optional)
        resolutionNotes?: string;
      };
    }) => resolveIssue(id, input),

    // After the server confirms the issue is resolved:
    onSuccess: (_, { id }) => {
      // Expire the detail cache so the issue's status badge updates immediately.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(id) });

      // Expire all issue lists so the issue moves to the "resolved" column
      // or disappears from the "open" filter view.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });

      // Expire dashboard stats because the resolved-issue count has increased
      // and the open-issue count has decreased.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// Reopens a previously resolved issue so the team can continue working on it.
// This transitions the issue back from a closed state to an active/open state.
export function useReopenIssue() {
  // Get the query cache handle.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just the issue's unique ID — no additional input needed to reopen.
    mutationFn: (id: string) => reopenIssue(id),

    // The second argument `id` here is the original scalar variable (not an
    // object), so we reference it directly rather than destructuring.
    onSuccess: (_, id) => {
      // Expire the detail cache for this issue so the status badge reflects
      // that the issue is open again.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(id) });

      // Expire all issue lists so the issue reappears in the "open" view
      // and disappears from the "resolved" view.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });

      // Expire dashboard stats because the open-issue count has increased
      // and the resolved count has decreased.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}
