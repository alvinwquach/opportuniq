/**
 * Guide GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type { GuideResponse } from "../types";

/**
 * Get user's guides
 */
export function useMyGuides(filters?: {
  bookmarkedOnly?: boolean;
  source?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.guides.my(filters),
    queryFn: () => gqlRequest<{ myGuides: GuideResponse[] }>(queries.MY_GUIDES_QUERY, filters),
    select: (data) => data.myGuides,
  });
}

/**
 * Bookmark a guide
 */
export function useBookmarkGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { guideId: string; bookmarked: boolean }) =>
      gqlRequest<{ bookmarkGuide: GuideResponse }>(mutations.GUIDE_BOOKMARK_MUTATION, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

/**
 * Track guide click
 */
export function useTrackGuideClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guideId: string) =>
      gqlRequest<{ trackGuideClick: GuideResponse }>(mutations.GUIDE_TRACK_CLICK_MUTATION, {
        guideId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}

/**
 * Rate guide helpfulness
 */
export function useRateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guideId, helpful }: { guideId: string; helpful: boolean }) =>
      gqlRequest<{ rateGuide: GuideResponse }>(mutations.GUIDE_RATE_MUTATION, {
        guideId,
        helpful,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all });
    },
  });
}
