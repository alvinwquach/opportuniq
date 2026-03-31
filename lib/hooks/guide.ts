// Pull in useQuery and useMutation from TanStack Query, plus useQueryClient.
// - useQuery       : fetches and caches read-only data; components use it to display data.
// - useMutation    : sends changes (create / update / delete) to the server.
// - useQueryClient : provides access to the shared cache manager so we can
//                    mark cache entries as stale (invalidate) after mutations.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Pull in the queryKeys helper that generates stable, consistent cache key arrays.
// Centralising keys here means all hooks and components refer to the exact same
// cache slot for guides data, preventing duplicate fetches or missed invalidations.
import { queryKeys } from "./keys";

// Pull in four server actions that handle DIY guide operations.
// All of these run on the server so they can safely read from and write to the database.
// - getMyGuides     : fetches the list of DIY guides associated with the current user
// - bookmarkGuide   : saves or removes a bookmark on a specific guide for the user
// - trackGuideClick : records that the user clicked/opened a guide (analytics / history)
// - rateGuide       : saves the user's thumbs-up or thumbs-down rating for a guide
import {
  getMyGuides,
  bookmarkGuide,
  trackGuideClick,
  rateGuide,
} from "@/app/actions/diy-guides/guideActions";

// Define and export a custom hook called useMyGuides.
// Any component that needs to display a list of guides for the current user calls this.
// An optional filters object lets the caller narrow down the results without needing
// to create separate hooks for each filter combination.
export function useMyGuides(filters?: {
  // bookmarkedOnly: when true, only return guides the user has bookmarked.
  bookmarkedOnly?: boolean;
  // source: filter guides by where they came from (e.g. "reddit", "youtube").
  source?: string;
  // limit: maximum number of guides to return in one response.
  limit?: number;
}) {
  return useQuery({
    // Cache key includes the filters object so each unique filter combination
    // gets its own cache slot. If the user switches between "bookmarked only"
    // and "all guides", both results are cached separately.
    queryKey: queryKeys.guides.my(filters),

    // queryFn is called when TanStack Query needs fresh data.
    // It forwards the filters to the server action so the DB query is filtered server-side.
    queryFn: () => getMyGuides(filters),
  });
}

// Define and export a custom hook called useBookmarkGuide.
// Components call this when the user taps the bookmark icon on a guide.
// Returns { mutate, isPending, error } so the icon can animate while saving.
export function useBookmarkGuide() {
  // Get the cache manager so we can tell it to refresh guides data after bookmarking.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(input) is called.
    // input carries:
    // - guideId    : the unique ID of the guide being bookmarked or un-bookmarked
    // - bookmarked : true = add bookmark, false = remove it
    mutationFn: (input: { guideId: string; bookmarked: boolean }) => bookmarkGuide(input),

    // onSuccess fires after the server confirms the bookmark was saved or removed.
    // We invalidate ALL guides-related cache entries (the broad .all key covers every
    // variant — my guides, bookmarked only, filtered, etc.) so every guide list on
    // screen re-fetches and shows the correct bookmark state immediately.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

// Define and export a custom hook called useTrackGuideClick.
// This is called when the user opens or clicks into a guide so we can record
// the interaction for analytics and "recently viewed" history features.
// Returns { mutate, isPending, error }.
export function useTrackGuideClick() {
  // Get the cache manager reference for post-mutation cache invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn receives just the guideId string — no extra fields needed
    // because all we're doing is logging "this user opened this guide".
    mutationFn: (guideId: string) => trackGuideClick(guideId),

    // onSuccess fires after the click has been recorded on the server.
    // Invalidating the guides cache refreshes any "recently viewed" or
    // click-count displays that components might be showing.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

// Define and export a custom hook called useRateGuide.
// Components call this when the user gives a thumbs-up or thumbs-down on a guide.
// Returns { mutate, isPending, error } so the rating buttons can reflect save state.
export function useRateGuide() {
  // Get the cache manager so we can invalidate guides data after the rating is saved.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn receives:
    // - guideId : the unique ID of the guide being rated
    // - helpful : true = thumbs up (guide was helpful), false = thumbs down
    // The server action takes them as two separate arguments, so we unpack here.
    mutationFn: ({ guideId, helpful }: { guideId: string; helpful: boolean }) =>
      rateGuide(guideId, helpful),

    // onSuccess fires after the rating is confirmed by the server.
    // Invalidating all guides cache entries forces a re-fetch so any aggregate
    // rating displays (e.g. "85% found this helpful") update immediately.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}
