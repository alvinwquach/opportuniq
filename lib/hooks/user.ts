// Pull in three functions from TanStack Query:
// - useQuery   : fetch and cache read-only data from the server
// - useMutation: send a change (create / update / delete) to the server
// - useQueryClient: get a reference to the shared cache manager so we can
//                   manually tell it to throw away (invalidate) stale entries
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Pull in the queryKeys helper that generates consistent cache key arrays.
// Using a central keys file means we never accidentally use two different strings
// to refer to the same data, which would cause cache misses and double-fetches.
import { queryKeys } from "./keys";

// Pull in four server actions from the user module.
// Server actions run on the server and talk directly to the database —
// the browser never sees the raw DB credentials or queries.
// - getMe             : fetch the currently logged-in user's basic profile
// - getMeWithGroups   : fetch the same user but also include which groups they belong to
// - updateProfile     : save changes to the user's name, location, avatar, etc.
// - updatePreferences : save changes to the user's theme, language, notification settings
import { getMe, getMeWithGroups, updateProfile, updatePreferences } from "@/app/actions/user/getMe";

// Define and export a custom hook called useMe.
// Any component that needs to know who the current user is calls this hook.
// It returns an object with { data, isLoading, error } so components can
// render a loading spinner, error message, or the actual user data.
export function useMe() {
  // useQuery manages the fetch lifecycle: it calls queryFn, stores the result
  // under queryKey, and re-uses the cached value for subsequent renders.
  return useQuery({
    // Cache key for the current user's basic profile.
    // Using queryKeys.user.me() produces a stable array like ["user", "me"].
    // Any other hook or component that uses the same key shares the same cache slot.
    queryKey: queryKeys.user.me(),

    // queryFn is called when TanStack Query needs fresh data.
    // It calls the getMe server action which fetches the current user from the DB.
    queryFn: () => getMe(),
  });
}

// Define and export a custom hook called useMeWithGroups.
// Similar to useMe, but the response also includes the groups the user is a member of.
// Separate from useMe so components that don't need group data don't trigger the
// heavier query that joins group membership tables.
export function useMeWithGroups() {
  return useQuery({
    // Separate cache key from the plain "me" query so the two results are
    // stored independently and don't overwrite each other.
    queryKey: queryKeys.user.meWithGroups(),

    // Calls the getMeWithGroups server action, which fetches the user plus
    // their group memberships in one database query.
    queryFn: () => getMeWithGroups(),
  });
}

// Define and export a custom hook called useUpdateProfile.
// Components call this when the user submits a profile-edit form.
// It returns { mutate, isPending, error } so the UI can show a saving spinner
// and handle failures gracefully.
export function useUpdateProfile() {
  // Get a reference to TanStack Query's global cache manager.
  // We need this so we can tell the cache to discard the old user data
  // after a successful save, forcing a fresh fetch with the new values.
  const queryClient = useQueryClient();

  // useMutation sets up a function we can call later (mutate / mutateAsync)
  // to actually send the update to the server.
  return useMutation({
    // mutationFn is the function that runs when mutate() is called.
    // It receives the variables object passed by the caller.
    // Each field is optional — the caller only sends the fields they want to change.
    // - name          : the user's display name
    // - postalCode    : zip/postal code for the user's location
    // - city          : city name
    // - stateProvince : state or province
    // - latitude      : GPS latitude (used for proximity-based features)
    // - longitude     : GPS longitude
    // - avatarUrl     : URL to the user's profile picture
    mutationFn: (variables: {
      name?: string;
      postalCode?: string;
      city?: string;
      stateProvince?: string;
      latitude?: number;
      longitude?: number;
      avatarUrl?: string;
    }) => updateProfile(variables),

    // onSuccess runs automatically after the server action completes successfully.
    // We invalidate ALL user-related cache entries (the broad queryKeys.user.all key
    // covers both "me" and "meWithGroups" slots).
    // Invalidating means TanStack Query marks those entries as stale and will
    // re-fetch them the next time a component tries to read them,
    // ensuring the UI immediately reflects the newly saved profile data.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

// Define and export a custom hook called useUpdatePreferences.
// Components call this when the user saves their app preferences
// (theme, language, notification toggle).
// Returns { mutate, isPending, error } just like any other mutation hook.
export function useUpdatePreferences() {
  // Get access to the global cache manager so we can invalidate user data after saving.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when the caller invokes mutate(variables).
    // Each preference field is optional so the caller can update just one at a time.
    // - theme         : UI color theme (e.g. "light" or "dark")
    // - language      : preferred display language code (e.g. "en", "fr")
    // - notifications : true = opt in to notifications, false = opt out
    mutationFn: (variables: {
      theme?: string;
      language?: string;
      notifications?: boolean;
    }) => updatePreferences(variables),

    // onSuccess runs after the preference update is confirmed by the server.
    // Invalidating all user cache entries forces a re-fetch of the user profile
    // so the app immediately reflects the new preferences (e.g. the theme switches).
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
