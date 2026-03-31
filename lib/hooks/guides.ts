// Pull in useQuery, useMutation, and useQueryClient from TanStack Query.
// - useQuery       : fetches and caches read-only data for display in components.
// - useMutation    : sends changes (bookmarks, ratings, progress updates) to the server.
// - useQueryClient : gives us access to the shared cache manager so we can
//                    mark cached guide data as stale after any write operation.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Pull in the queryKeys helper that generates stable, predictable cache key arrays.
// Centralising keys ensures every hook in the codebase uses the exact same identifier
// for the same piece of data, so invalidations always hit the right cache slots.
import { queryKeys } from "./keys";

// Pull in the server action that fetches everything needed for the Guides page.
// This runs on the server so it can securely query the database. It bundles the
// page's data into a single response so the UI doesn't need multiple round-trips.
import { getGuidesPageData } from "@/app/actions/dashboard/getGuidesPageData";

// Pull in five guide-specific server actions.
// All run server-side for secure DB access.
// - getMyGuides          : retrieves the list of DIY guides associated with the current user
// - bookmarkGuide        : saves or removes a bookmark for a guide on the user's account
// - rateGuide            : records the user's thumbs-up or thumbs-down rating for a guide
// - trackGuideClick      : logs that the user opened/clicked a guide (for analytics and history)
// - updateGuideProgress  : saves how far through a guide the user has gotten
import {
  getMyGuides,
  bookmarkGuide,
  rateGuide,
  trackGuideClick,
  updateGuideProgress,
} from "@/app/actions/diy-guides/guideActions";

// Define and export a custom hook called useGuidesPageData.
// This is the primary hook for the Guides page — it loads everything the page
// needs to render in one server call. Returns { data, isLoading, error }.
export function useGuidesPageData() {
  return useQuery({
    // Cache key for the full Guides page data bundle.
    // queryKeys.guides.pageData() returns a stable array like ["guides", "pageData"].
    queryKey: queryKeys.guides.pageData(),

    // queryFn calls the getGuidesPageData server action to fetch the full page payload.
    queryFn: () => getGuidesPageData(),

    // staleTime: 1000 * 60 * 2 = 120,000 ms = 2 minutes.
    // The cached page data is considered "fresh" for 2 minutes. If the user navigates
    // away and returns within that window, the page renders instantly from cache
    // without making another server request.
    staleTime: 1000 * 60 * 2,

    // refetchOnWindowFocus: true tells TanStack Query to silently re-fetch this data
    // whenever the user switches back to this browser tab. This keeps the guides list
    // current if guides were updated from another tab or device while the user was away.
    refetchOnWindowFocus: true,
  });
}

// Define and export a custom hook called useMyGuides.
// Components that need just the list of guides (not the full page bundle)
// can use this lighter hook. An options object allows filtering/limiting the results.
export function useMyGuides(options?: {
  // bookmarkedOnly: when true, only return guides the user has bookmarked.
  bookmarkedOnly?: boolean;
  // source: filter by guide origin (e.g. "reddit", "youtube", "web").
  source?: string;
  // limit: cap the number of guides returned (e.g. show only the 10 most recent).
  limit?: number;
}) {
  return useQuery({
    // Cache key includes the options object so every unique combination of filters
    // gets its own cache slot. Switching from "all guides" to "bookmarked only"
    // won't overwrite the un-filtered list in cache.
    queryKey: queryKeys.guides.my(options),

    // queryFn forwards the options to the server action so filtering happens
    // in the database, not in the browser.
    queryFn: () => getMyGuides(options),
  });
}

// Define and export a custom hook called useBookmarkGuide.
// Components call this when the user taps the bookmark icon on a guide card.
// Returns { mutate, isPending, error } so the icon can animate and handle errors.
export function useBookmarkGuide() {
  // Get the cache manager so we can mark guides data as stale after bookmarking.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(variables) is called.
    // variables carries:
    // - guideId    : the unique ID of the guide being bookmarked
    // - bookmarked : true = add bookmark, false = remove it
    mutationFn: (variables: { guideId: string; bookmarked: boolean }) =>
      bookmarkGuide(variables),

    // onSuccess fires after the server confirms the bookmark change was saved.
    // We invalidate ALL guides cache entries (queryKeys.guides.all covers every
    // variant — filtered, unfiltered, page data, etc.) so every guide list
    // on screen immediately reflects the correct bookmark state.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

// Define and export a custom hook called useRateGuide.
// Components call this when the user clicks a "helpful" or "not helpful" button.
// Returns { mutate, isPending, error } so the rating UI can show a saving state.
export function useRateGuide() {
  // Get the cache manager for invalidating guides cache after a rating is submitted.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(variables) is called.
    // variables carries:
    // - guideId : the unique ID of the guide being rated
    // - helpful : true = thumbs up (found it helpful), false = thumbs down
    // The server action takes these as two separate positional arguments, so
    // we unpack them from the variables object when calling it.
    mutationFn: (variables: { guideId: string; helpful: boolean }) =>
      rateGuide(variables.guideId, variables.helpful),

    // onSuccess fires after the rating is confirmed saved by the server.
    // Invalidating all guides entries ensures aggregate rating displays
    // (e.g. "90% found this helpful") update immediately across the page.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

// Define and export a custom hook called useTrackGuideClick.
// Called when the user opens a guide so we can record the interaction
// for analytics and to power features like "recently viewed guides".
// Returns { mutate, isPending, error } — typically isPending is not shown
// in the UI since click tracking is a background/silent operation.
export function useTrackGuideClick() {
  // Get the cache manager for post-mutation cache updates.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn receives just the guideId string — that's all the server needs
    // to log which guide was clicked by the current user.
    mutationFn: (guideId: string) => trackGuideClick(guideId),

    // onSuccess fires after the click is recorded on the server.
    // We only invalidate the pageData cache (not the full .all namespace) because
    // click tracking primarily affects page-level aggregates like "recently viewed"
    // or click counts shown in the Guides page header, not individual guide lists.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.pageData() });
    },
  });
}

// Define and export a custom hook called useUpdateGuideProgress.
// Components call this to save the user's progress through a multi-step DIY guide
// (e.g. "I've completed 3 of 7 steps, 43% done").
// Returns { mutate, isPending, error } so progress bars can reflect saving state.
export function useUpdateGuideProgress() {
  // Get the cache manager so we can refresh guide data after saving progress.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(variables) is called.
    // variables carries:
    // - guideId        : the unique ID of the guide whose progress is being saved
    // - progress       : a number from 0–100 representing the percentage completed
    // - completedSteps : (optional) the count of discrete steps the user has finished;
    //                    used when the guide has numbered steps rather than a free %
    mutationFn: (variables: { guideId: string; progress: number; completedSteps?: number }) =>
      updateGuideProgress(variables),

    // onSuccess fires after the server confirms the progress was saved.
    // Invalidating all guides cache entries ensures any progress indicators
    // or completion badges across the UI immediately show the updated state.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}
