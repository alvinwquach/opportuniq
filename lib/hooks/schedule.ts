// Pull in three core TanStack Query tools:
// - useQuery: for fetching and caching data (read operations)
// - useMutation: for sending changes to the server (write/delete operations)
// - useQueryClient: gives us a handle to the shared query cache so we can
//   manually invalidate (expire) entries after a mutation succeeds
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import the centralized cache-key factory so every hook uses the exact
// same key structure — this prevents accidental cache misses or duplicates
import { queryKeys } from "./keys";

// Import every server action that talks to the database for schedule data.
// These run on the server (Next.js Server Actions), so the browser never
// touches the database directly.
import {
  // Fetch a single schedule by its ID
  getSchedule,
  // Fetch all schedules belonging to the currently logged-in user
  getMySchedules,
  // Fetch all schedules belonging to a specific group
  getGroupSchedules,
  // Fetch the list of issues that are eligible to be scheduled (no time slot yet)
  getIssuesForScheduling,
  // Create a brand new schedule entry in the database
  createSchedule,
  // Update an existing schedule's details (time, duration, participants)
  updateSchedule,
  // Remove a schedule permanently from the database
  deleteSchedule,
} from "@/app/actions/schedules/scheduleActions";

// ─────────────────────────────────────────────────────────────────────────────
// READ HOOKS  (useQuery — fetch & cache data)
// ─────────────────────────────────────────────────────────────────────────────

// Fetches one specific schedule by its unique ID.
// The component that calls this hook receives { data, isLoading, error }.
export function useSchedule(id: string) {
  return useQuery({
    // Cache key: uniquely identifies this particular schedule in the cache.
    // If any other hook calls the same key, they share the same cached result.
    queryKey: queryKeys.schedules.detail(id),

    // The actual async function that runs to get the data.
    // Calls the server action which queries the database.
    queryFn: () => getSchedule(id),

    // Safety guard: only run the query if `id` is a non-empty string.
    // `!!id` converts the string to a boolean (empty string → false).
    // Without this, the query would fire with an empty ID and likely error.
    enabled: !!id,
  });
}

// Fetches all schedules for the currently logged-in user.
// Optional `filters` let callers narrow results by date range.
export function useMySchedules(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    // Cache key includes the filters object so different date ranges each get
    // their own cache slot and don't overwrite each other.
    queryKey: queryKeys.schedules.my(filters),

    // Pass the optional date-range filters through to the server action.
    queryFn: () => getMySchedules(filters),

    // No `enabled` guard here — this query always runs when the component mounts.
  });
}

// Fetches all schedules that belong to a particular group, with optional
// date-range filtering.
export function useGroupSchedules(
  groupId: string,
  filters?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    // Cache key encodes both the groupId and any active filters so each
    // combination is stored separately in the cache.
    queryKey: queryKeys.schedules.group(groupId, filters),

    // Call the server action with both the group identifier and date filters.
    queryFn: () => getGroupSchedules(groupId, filters),

    // Don't run until we actually have a groupId — prevents a DB call with
    // an empty string which would return wrong results or cause an error.
    enabled: !!groupId,
  });
}

// Fetches the list of issues inside a group that have not been scheduled yet,
// so a UI calendar or scheduling form can present them as options to assign.
export function useIssuesForScheduling(groupId: string) {
  return useQuery({
    // Cache key scoped to this group's "forScheduling" data — separate from
    // the regular issues list so they don't interfere with each other.
    queryKey: queryKeys.schedules.forScheduling(groupId),

    // Ask the server for unscheduled issues in this group.
    queryFn: () => getIssuesForScheduling(groupId),

    // Block the query from running until a real groupId is available.
    enabled: !!groupId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE HOOKS  (useMutation — send changes to the server)
// ─────────────────────────────────────────────────────────────────────────────

// Creates a new schedule entry linking an issue to a date/time slot.
// Returns { mutate, isPending, error } for the calling component to use.
export function useCreateSchedule() {
  // Get access to the shared query cache so we can expire stale entries
  // after the mutation completes.
  const queryClient = useQueryClient();

  return useMutation({
    // The function that actually performs the write.
    // Takes an object describing the new schedule and sends it to the server.
    mutationFn: (input: {
      // The issue this schedule is for
      issueId: string;
      // ISO date-time string for when the session is scheduled
      scheduledTime: string;
      // How long the session is expected to take, in minutes (optional)
      estimatedDuration?: number;
      // Array of user IDs who should attend (optional)
      participants?: string[];
    }) => createSchedule(input),

    // Runs automatically after the server confirms the create succeeded.
    onSuccess: () => {
      // Mark every cached schedule entry as stale so all schedule lists
      // refetch and show the newly created entry immediately.
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });

      // Also expire the dashboard stats cache because the total schedule
      // count shown on the dashboard has now changed.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// Updates an existing schedule — for example, to change the time or add
// a participant.
export function useUpdateSchedule() {
  // Grab the query cache handle so we can invalidate specific entries.
  const queryClient = useQueryClient();

  return useMutation({
    // The mutation receives both the schedule's `id` and an `input` object
    // containing whichever fields need to be changed (all fields are optional).
    mutationFn: ({
      id,
      input,
    }: {
      // The unique ID of the schedule to update
      id: string;
      input: {
        // New date-time string if the time is changing
        scheduledTime?: string;
        // New duration in minutes if that's changing
        estimatedDuration?: number;
        // Updated list of participant user IDs
        participants?: string[];
      };
    }) => updateSchedule(id, input),

    // The second argument `{ id }` is the original variables object passed
    // to mutate() — we destructure it here to get the schedule's ID so we
    // can pinpoint exactly which cache entry to expire.
    onSuccess: (_, { id }) => {
      // Expire the cache for this specific schedule so the detail view
      // refetches the freshest data.
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.detail(id) });

      // Also expire all schedule lists so any list views stay accurate.
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
  });
}

// Deletes a schedule permanently — for example, when a session is cancelled.
export function useDeleteSchedule() {
  // Get a reference to the shared query cache.
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just the schedule's ID — no other data needed for a delete.
    mutationFn: (id: string) => deleteSchedule(id),

    // After the server confirms the deletion:
    onSuccess: () => {
      // Expire all schedule caches so list views no longer show the
      // deleted entry.
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });

      // Also expire dashboard stats because the schedule count has decreased.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}
