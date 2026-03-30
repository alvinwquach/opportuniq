/**
 * Hook for fetching and managing DIY guides for a conversation.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { DIYGuide } from "@/app/db/schema/diy-guides";

interface UseDIYGuidesResult {
  guides: DIYGuide[];
  isLoading: boolean;
  error: Error | null;
  markClicked: (guideId: string) => Promise<void>;
  toggleBookmark: (guideId: string) => Promise<void>;
  markHelpful: (guideId: string, helpful: boolean) => Promise<void>;
  mutate: () => void;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch guides");
  return res.json();
};

export function useDIYGuides(conversationId: string | null): UseDIYGuidesResult {
  const queryClient = useQueryClient();
  const queryKey = ["guides", conversationId];

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetcher(`/api/conversations/${conversationId}/guides`),
    enabled: !!conversationId,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const mutate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateGuide = useCallback(
    async (guideId: string, action: "clicked" | "bookmarked" | "helpful" | "not_helpful") => {
      if (!conversationId) return;

      try {
        await fetch(`/api/conversations/${conversationId}/guides`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guideId, action }),
        });

        queryClient.invalidateQueries({ queryKey });
      } catch (err) {
        console.error("[useDIYGuides] Failed to update guide:", err);
      }
    },
    [conversationId, queryClient] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const markClicked = useCallback(
    (guideId: string) => updateGuide(guideId, "clicked"),
    [updateGuide]
  );

  const toggleBookmark = useCallback(
    (guideId: string) => updateGuide(guideId, "bookmarked"),
    [updateGuide]
  );

  const markHelpful = useCallback(
    (guideId: string, helpful: boolean) =>
      updateGuide(guideId, helpful ? "helpful" : "not_helpful"),
    [updateGuide]
  );

  return {
    guides: data?.guides || [],
    isLoading,
    error: error as Error | null,
    markClicked,
    toggleBookmark,
    markHelpful,
    mutate,
  };
}
