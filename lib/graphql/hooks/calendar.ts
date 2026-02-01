/**
 * Calendar GraphQL Hooks
 *
 * Hooks for calendar page data and mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import { queryKeys } from "../keys";
import type { CalendarPageDataResponse } from "../types";

/**
 * Fetch comprehensive calendar page data
 *
 * @param year - Optional year (defaults to current year)
 * @param month - Optional month (0-11, defaults to current month)
 * @returns Calendar page data including events, stats, and charts
 *
 * @example
 * const { data, isLoading } = useCalendarPageData(2025, 0); // January 2025
 */
export function useCalendarPageData(year?: number, month?: number) {
  return useQuery({
    queryKey: queryKeys.calendar.pageData(year, month),
    queryFn: () =>
      gqlRequest<{ calendarPageData: CalendarPageDataResponse }>(
        queries.CALENDAR_PAGE_DATA_QUERY,
        { year, month }
      ),
    select: (data) => data.calendarPageData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Create a new calendar event
 */
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      date: string;
      time?: string;
      type: string;
      isRecurring?: boolean;
      recurringPattern?: string;
      location?: string;
      notes?: string;
      estimatedCost?: number;
      reminder?: string;
      linkedIssueId?: string;
    }) =>
      gqlRequest<{ createCalendarEvent: { id: string } }>(
        /* GraphQL */ `
          mutation CreateCalendarEvent($input: CreateCalendarEventInput!) {
            createCalendarEvent(input: $input) {
              id
              title
              date
              time
              type
            }
          }
        `,
        { input }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Update a calendar event
 */
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        title?: string;
        date?: string;
        time?: string;
        type?: string;
        isRecurring?: boolean;
        recurringPattern?: string;
        location?: string;
        notes?: string;
        estimatedCost?: number;
        reminder?: string;
        linkedIssueId?: string;
      };
    }) =>
      gqlRequest<{ updateCalendarEvent: { id: string } }>(
        /* GraphQL */ `
          mutation UpdateCalendarEvent(
            $id: ID!
            $input: UpdateCalendarEventInput!
          ) {
            updateCalendarEvent(id: $id, input: $input) {
              id
              title
              date
              time
              type
            }
          }
        `,
        { id, input }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Delete a calendar event
 */
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ deleteCalendarEvent: boolean }>(
        /* GraphQL */ `
          mutation DeleteCalendarEvent($id: ID!) {
            deleteCalendarEvent(id: $id)
          }
        `,
        { id }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}
