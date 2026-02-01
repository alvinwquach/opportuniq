/**
 * Guides GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  GuidesPageDataResponse,
  GuideResponse,
} from "../types";

// =============================================================================
// GUIDES PAGE DATA HOOKS
// =============================================================================

/**
 * Get comprehensive guides page data
 * This is the main hook for the guides page view
 */
export function useGuidesPageData() {
  return useQuery({
    queryKey: queryKeys.guides.pageData(),
    queryFn: () =>
      gqlRequest<{ guidesPageData: GuidesPageDataResponse }>(queries.GUIDES_PAGE_DATA_QUERY),
    select: (data) => data.guidesPageData,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Get user's guides with optional filters
 */
export function useMyGuides(options?: {
  bookmarkedOnly?: boolean;
  source?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.guides.my(options),
    queryFn: () =>
      gqlRequest<{ myGuides: GuideResponse[] }>(queries.MY_GUIDES_QUERY, options),
    select: (data) => data.myGuides,
  });
}

// =============================================================================
// GUIDE MUTATION HOOKS
// =============================================================================

/**
 * Toggle bookmark on a guide
 */
export function useBookmarkGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { guideId: string; bookmarked: boolean }) =>
      gqlRequest<{ bookmarkGuide: GuideResponse }>(mutations.GUIDE_BOOKMARK_MUTATION, {
        input: variables,
      }),
    onSuccess: () => {
      // Invalidate guides queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

/**
 * Rate a guide as helpful or not
 */
export function useRateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { guideId: string; helpful: boolean }) =>
      gqlRequest<{ rateGuide: GuideResponse }>(mutations.GUIDE_RATE_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

/**
 * Track guide click (analytics)
 */
export function useTrackGuideClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guideId: string) =>
      gqlRequest<{ trackGuideClick: GuideResponse }>(mutations.GUIDE_TRACK_CLICK_MUTATION, {
        guideId,
      }),
    onSuccess: () => {
      // Optionally invalidate guides data
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.pageData() });
    },
  });
}

/**
 * Update guide progress
 */
export function useUpdateGuideProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { guideId: string; progress: number; completedSteps?: number }) =>
      gqlRequest<{ updateGuideProgress: boolean }>(mutations.GUIDE_UPDATE_PROGRESS_MUTATION, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}
