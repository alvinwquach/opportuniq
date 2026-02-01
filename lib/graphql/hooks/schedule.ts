/**
 * Schedule GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  ScheduleResponse,
  ScheduleWithDetailsResponse,
  CreateScheduleInput,
  UpdateScheduleInput,
  IssueListItem,
} from "../types";

/**
 * Get a schedule by ID
 */
export function useSchedule(id: string) {
  return useQuery({
    queryKey: queryKeys.schedules.detail(id),
    queryFn: () =>
      gqlRequest<{ schedule: ScheduleResponse }>(queries.SCHEDULE_BY_ID_QUERY, { id }),
    select: (data) => data.schedule,
    enabled: !!id,
  });
}

/**
 * Get user's schedules with optional date filters
 */
export function useMySchedules(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.schedules.my(filters),
    queryFn: () =>
      gqlRequest<{ mySchedules: ScheduleWithDetailsResponse[] }>(
        queries.MY_SCHEDULES_QUERY,
        filters ?? {}
      ),
    select: (data) => data.mySchedules,
  });
}

/**
 * Get schedules for a group with optional date filters
 */
export function useGroupSchedules(
  groupId: string,
  filters?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: queryKeys.schedules.group(groupId, filters),
    queryFn: () =>
      gqlRequest<{ groupSchedules: ScheduleWithDetailsResponse[] }>(
        queries.GROUP_SCHEDULES_QUERY,
        { groupId, ...filters }
      ),
    select: (data) => data.groupSchedules,
    enabled: !!groupId,
  });
}

/**
 * Get issues available for scheduling in a group
 */
export function useIssuesForScheduling(groupId: string) {
  return useQuery({
    queryKey: queryKeys.schedules.forScheduling(groupId),
    queryFn: () =>
      gqlRequest<{ issuesForScheduling: IssueListItem[] }>(
        queries.ISSUES_FOR_SCHEDULING_QUERY,
        { groupId }
      ),
    select: (data) => data.issuesForScheduling,
    enabled: !!groupId,
  });
}

/**
 * Create a schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateScheduleInput) =>
      gqlRequest<{ createSchedule: ScheduleResponse }>(
        mutations.SCHEDULE_CREATE_MUTATION,
        { input }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

/**
 * Update a schedule
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateScheduleInput }) =>
      gqlRequest<{ updateSchedule: ScheduleResponse }>(
        mutations.SCHEDULE_UPDATE_MUTATION,
        { id, input }
      ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
  });
}

/**
 * Delete a schedule
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ deleteSchedule: boolean }>(mutations.SCHEDULE_DELETE_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}
