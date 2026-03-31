// Pull in useQuery, useMutation, and useQueryClient from TanStack Query.
// - useQuery       : fetches and caches data from the server so components can display it.
// - useMutation    : sends create / update / delete operations to the server.
// - useQueryClient : gives us a handle to the shared cache manager so we can
//                    mark calendar entries as stale after any change is made.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Pull in the queryKeys helper that generates consistent, stable cache key arrays.
// Centralising keys prevents typos that would leave old cache entries lying around
// after a create/update/delete because the key used during invalidation didn't match
// the key used during the original fetch.
import { queryKeys } from "./keys";

// Pull in the server action that loads all data needed for the calendar page.
// This runs on the server so it can safely hit the database. It accepts a year and
// month so it only fetches scheduled events for the requested time window.
import { getCalendarPageData } from "@/app/actions/dashboard/getCalendarPageData";

// Pull in the three schedule server actions for creating, updating, and deleting
// calendar events (called "schedules" in the database).
// - createSchedule : creates a new scheduled event and saves it to the DB
// - updateSchedule : modifies an existing scheduled event (time, duration, participants)
// - deleteSchedule : removes a scheduled event from the DB entirely
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/app/actions/schedules/scheduleActions";

// Define and export a custom hook called useCalendarPageData.
// Any component that renders the calendar page calls this to get all the
// scheduled events for a given month. Returns { data, isLoading, error }.
export function useCalendarPageData(year?: number, month?: number) {
  return useQuery({
    // Cache key includes both year and month so each month gets its own cache slot.
    // Navigating from January to February won't overwrite January's cached data,
    // so if the user navigates back it loads instantly from cache.
    queryKey: queryKeys.calendar.pageData(year, month),

    // queryFn calls the server action, passing year and month so the DB query
    // only returns events that fall within the requested month.
    queryFn: () => getCalendarPageData(year, month),

    // staleTime: 1000 * 60 * 2 = 120,000 ms = 2 minutes.
    // Cached calendar data is considered fresh for 2 minutes. If the user leaves
    // the page and returns within that window, no extra server request is made.
    staleTime: 1000 * 60 * 2,

    // refetchOnWindowFocus: true means if the user switches away to another tab
    // and comes back, TanStack Query will re-fetch the calendar data in the background.
    // This keeps the calendar up-to-date if events were changed from another device
    // or browser tab while the user was away.
    refetchOnWindowFocus: true,
  });
}

// Define and export a custom hook called useCreateCalendarEvent.
// Components (e.g. a "Schedule Appointment" form) call this when the user
// wants to add a new event to the calendar.
// Returns { mutate, isPending, error } so the form can show a saving state.
export function useCreateCalendarEvent() {
  // Get the cache manager so we can discard stale calendar cache entries
  // after the new event is successfully saved.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(input) is called.
    // input carries all the data needed to create the event:
    // - issueId           : (optional) the issue this appointment is related to;
    //                        if not provided, defaults to an empty string for the server action
    // - scheduledTime     : when the event is scheduled (ISO date-time string, e.g. "2024-03-15T10:00:00Z")
    // - estimatedDuration : (optional) how long the event is expected to take, in minutes
    // - participants      : (optional) array of user IDs or email addresses who should attend
    mutationFn: (input: {
      issueId?: string;
      scheduledTime: string;
      estimatedDuration?: number;
      participants?: string[];
    }) =>
      // We call createSchedule with an explicit object shape.
      // issueId ?? "" ensures the server action always receives a string, never undefined,
      // because the server action signature requires issueId to be a string (not optional).
      createSchedule({
        issueId: input.issueId ?? "",
        scheduledTime: input.scheduledTime,
        estimatedDuration: input.estimatedDuration,
        participants: input.participants,
      }),

    // onSuccess fires after the server confirms the event was created.
    // We invalidate the entire calendar cache namespace (queryKeys.calendar.all
    // covers every month's cache slot) so the calendar view re-fetches and
    // displays the newly created event.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

// Define and export a custom hook called useUpdateCalendarEvent.
// Components call this when the user edits an existing calendar event
// (e.g. reschedules the time or changes the list of participants).
// Returns { mutate, isPending, error }.
export function useUpdateCalendarEvent() {
  // Get the cache manager for post-mutation invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn receives a wrapper object with two fields:
    // - id    : the unique ID of the existing schedule record to update
    // - input : an object containing only the fields the caller wants to change
    //           (all optional so you can update just one field at a time):
    //           - scheduledTime     : the new date/time for the event
    //           - estimatedDuration : updated duration in minutes
    //           - participants      : updated list of participant IDs or emails
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        scheduledTime?: string;
        estimatedDuration?: number;
        participants?: string[];
      };
    }) => updateSchedule(id, input),

    // onSuccess fires after the server confirms the update.
    // Invalidate all calendar cache entries so every calendar view (across all months
    // that may be cached) re-fetches and shows the event's updated details.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

// Define and export a custom hook called useDeleteCalendarEvent.
// Components call this when the user removes a calendar event (e.g. clicking
// a "Delete" or "Cancel Appointment" button).
// Returns { mutate, isPending, error } so the delete button can show a loading state.
export function useDeleteCalendarEvent() {
  // Get the cache manager so we can clean up calendar cache after the deletion.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn receives just the schedule's ID string — no extra data is needed
    // because the server action only needs to know which record to delete.
    mutationFn: (id: string) => deleteSchedule(id),

    // onSuccess fires after the server confirms the event was deleted.
    // Invalidate all calendar cache entries so the calendar immediately stops
    // showing the deleted event without requiring a manual page refresh.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}
