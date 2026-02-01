/**
 * Dashboard GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  DashboardStatsResponse,
  DashboardDataResponse,
  ResolutionStatsResponse,
  DecisionOutcomeResponse,
  PreferenceHistoryResponse,
  RecordOutcomeInput,
} from "../types";

// =============================================================================
// DASHBOARD STATS HOOKS
// =============================================================================

/**
 * Get dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () =>
      gqlRequest<{ dashboardStats: DashboardStatsResponse }>(queries.DASHBOARD_STATS_QUERY),
    select: (data) => data.dashboardStats,
  });
}

/**
 * Get comprehensive dashboard data
 * This is the main hook for the dashboard view
 */
export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.dashboard.data(),
    queryFn: () =>
      gqlRequest<{ dashboardData: DashboardDataResponse }>(queries.DASHBOARD_DATA_QUERY),
    select: (data) => data.dashboardData,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Get group resolution stats
 */
export function useGroupResolutionStats(groupId: string, timeRange?: string) {
  return useQuery({
    queryKey: queryKeys.groups.resolutionStats(groupId, timeRange),
    queryFn: () =>
      gqlRequest<{ groupResolutionStats: ResolutionStatsResponse }>(
        queries.GROUP_RESOLUTION_STATS_QUERY,
        { groupId, timeRange }
      ),
    select: (data) => data.groupResolutionStats,
    enabled: !!groupId,
  });
}

// =============================================================================
// OUTCOME HOOKS
// =============================================================================

/**
 * Get decision outcome
 */
export function useDecisionOutcome(decisionId: string) {
  return useQuery({
    queryKey: queryKeys.decisions.outcome(decisionId),
    queryFn: () =>
      gqlRequest<{ decisionOutcome: DecisionOutcomeResponse | null }>(
        queries.DECISION_OUTCOME_QUERY,
        { decisionId }
      ),
    select: (data) => data.decisionOutcome,
    enabled: !!decisionId,
  });
}

/**
 * Record outcome for a decision
 */
export function useRecordOutcome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RecordOutcomeInput) =>
      gqlRequest<{ recordOutcome: DecisionOutcomeResponse }>(
        mutations.OUTCOME_RECORD_MUTATION,
        variables
      ),
    onSuccess: (_, { decisionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.outcome(decisionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// =============================================================================
// PREFERENCE HISTORY HOOKS
// =============================================================================

/**
 * Get preference history for a group
 */
export function usePreferenceHistory(groupId: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.preferences.history(groupId),
    queryFn: () =>
      gqlRequest<{ preferenceHistory: PreferenceHistoryResponse[] }>(
        queries.PREFERENCE_HISTORY_QUERY,
        { groupId, limit }
      ),
    select: (data) => data.preferenceHistory,
    enabled: !!groupId,
  });
}
