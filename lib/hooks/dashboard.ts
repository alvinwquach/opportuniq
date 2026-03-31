// Pull in useQuery, useMutation, and useQueryClient from TanStack Query.
// - useQuery       : fetches and caches read-only data from the server.
// - useMutation    : sends a change (create / update / delete) to the server.
// - useQueryClient : gives us access to the shared cache manager so we can
//                    mark specific cache entries as stale after a mutation.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Pull in the queryKeys helper that provides stable cache key arrays.
// Having keys defined in one place means every hook and component uses the
// exact same identifier for the same data, preventing duplicate cache slots.
import { queryKeys } from "./keys";

// Pull in the server action that fetches all data needed for the main dashboard page.
// Running this on the server means the database is never directly exposed to the browser.
import { getDashboardData } from "@/app/actions/dashboard/getDashboardData";

// Pull in four server actions related to decisions and user preferences.
// - getGroupResolutionStats : fetches statistics about how often a group resolves issues
// - getDecisionOutcome      : fetches the recorded outcome for a specific past decision
// - recordOutcome           : saves whether a decision turned out to be successful
// - getPreferenceHistory    : fetches the history of preferences logged for a group
import { getGroupResolutionStats, getDecisionOutcome, recordOutcome, getPreferenceHistory } from "@/app/actions/decisions/decisionActions";

// Define and export a custom hook called useDashboardData.
// This is the primary hook for the main dashboard page — it loads everything
// the dashboard needs to render in a single server round-trip.
export function useDashboardData() {
  return useQuery({
    // Cache key for the main dashboard data bundle.
    // queryKeys.dashboard.data() returns a stable array like ["dashboard", "data"].
    queryKey: queryKeys.dashboard.data(),

    // queryFn calls the getDashboardData server action, which queries the database
    // and returns summary info (open issues, recent activity, stats, etc.).
    queryFn: () => getDashboardData(),

    // staleTime: 1000 * 60 * 2 = 120,000 ms = 2 minutes.
    // For 2 minutes after a successful fetch, TanStack Query will serve the cached
    // result without hitting the server again. After 2 minutes it's considered stale
    // and a background refetch will happen the next time the data is accessed.
    staleTime: 1000 * 60 * 2,

    // refetchOnWindowFocus: true means TanStack Query will re-fetch the dashboard
    // data automatically whenever the user switches back to this browser tab/window.
    // This ensures the dashboard never shows very outdated info when the user returns
    // after working in another tab for a while.
    refetchOnWindowFocus: true,
  });
}

// Define and export a custom hook called useDashboardStats.
// Similar to useDashboardData but uses a different cache key ("stats" variant).
// This allows components that only care about summary statistics to subscribe
// independently without sharing the exact same cache slot as the full data hook,
// making targeted invalidations (e.g. after recordOutcome) more precise.
export function useDashboardStats() {
  return useQuery({
    // Uses the "stats" cache key variant so it can be invalidated independently
    // from the full dashboard data — e.g. after recording an outcome we want
    // only the stats to refresh, not the entire page payload.
    queryKey: queryKeys.dashboard.stats(),

    // Calls the same getDashboardData server action as useDashboardData.
    // The different cache key means the two hooks maintain separate cached copies.
    queryFn: () => getDashboardData(),
  });
}

// Define and export a custom hook called useGroupResolutionStats.
// Displays resolution statistics for a specific group over an optional time window.
// For example: "Your group resolved 8 out of 10 issues in the last 30 days."
export function useGroupResolutionStats(groupId: string, timeRange?: string) {
  return useQuery({
    // Cache key includes both groupId and timeRange so each combination of group
    // and time window gets its own cache slot and won't overwrite another.
    queryKey: queryKeys.groups.resolutionStats(groupId, timeRange),

    // Calls the server action with both arguments to get filtered stats.
    queryFn: () => getGroupResolutionStats(groupId, timeRange),

    // enabled is a boolean guard that controls whether the query runs at all.
    // !!groupId converts the groupId string to true (if it has a value) or false (if empty/undefined).
    // Without this guard, the query would fire with an empty groupId the moment a component
    // mounts, causing a bad server request. It only runs once a real groupId is available.
    enabled: !!groupId,
  });
}

// Define and export a custom hook called useDecisionOutcome.
// Fetches the recorded outcome for a previously made decision —
// e.g. was it successful? what did it actually cost?
export function useDecisionOutcome(decisionId: string) {
  return useQuery({
    // Cache key is scoped to the specific decisionId so each decision gets
    // its own outcome cached separately.
    queryKey: queryKeys.decisions.outcome(decisionId),

    // Calls the server action to load outcome details for this specific decision.
    queryFn: () => getDecisionOutcome(decisionId),

    // Guard: only run the query if decisionId is a non-empty string.
    // Prevents a bad request if the component renders before the ID is known.
    enabled: !!decisionId,
  });
}

// Define and export a custom hook called useRecordOutcome.
// Components call this when the user marks a decision as completed and wants to
// log how it went (e.g. did it succeed? what did it actually cost?).
// Returns { mutate, isPending, error } so the form can show save state.
export function useRecordOutcome() {
  // Get the cache manager so we can invalidate related cache entries after saving.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(variables) is called.
    // variables carries all the outcome details the user filled in:
    // - decisionId  : the unique ID of the decision being closed out
    // - success     : did the chosen solution work? (defaults to true if omitted)
    // - actualCost  : what the repair/solution actually ended up costing
    // - costDelta   : the difference between estimated cost and actual cost
    // - notes       : any free-text notes the user wants to record
    // - completedAt : when the decision was acted on / completed
    // We spread variables and fill in a default of true for success if not provided,
    // so the server action always receives a concrete boolean rather than undefined.
    mutationFn: (variables: {
      decisionId: string;
      success?: boolean;
      actualCost?: string;
      costDelta?: string;
      notes?: string;
      completedAt?: Date;
    }) => recordOutcome({ ...variables, success: variables.success ?? true }),

    // onSuccess fires after the outcome is confirmed saved by the server.
    // The second argument gives us back the original variables that were passed
    // to mutate(), so we can use decisionId to target the exact cache entries
    // that just became stale.
    onSuccess: (_, { decisionId }) => {
      // Invalidate the outcome cache for this specific decision so the UI
      // immediately re-fetches and shows the newly recorded outcome details.
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.outcome(decisionId) });

      // Invalidate the dashboard stats cache because completing a decision
      // changes aggregate counters like "resolved issues" on the dashboard.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// Define and export a custom hook called usePreferenceHistory.
// Loads the historical log of preferences that have been recorded for a group.
// Useful for analytics screens that show how a group's preferences have changed over time.
export function usePreferenceHistory(groupId: string, limit?: number) {
  return useQuery({
    // Cache key is scoped to the groupId so each group's preference history
    // lives in its own cache slot and is invalidated independently.
    queryKey: queryKeys.preferences.history(groupId),

    // Calls the server action with both groupId and the optional limit.
    // limit caps the number of history entries returned (e.g. last 20 entries).
    queryFn: () => getPreferenceHistory(groupId, limit),

    // Guard: only run the query when groupId is a non-empty string.
    // Prevents wasted requests while the groupId is still being loaded elsewhere.
    enabled: !!groupId,
  });
}
