"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  trackQuoteSubmitted,
  trackQuoteAccepted,
  trackQuoteRejected,
} from "@/lib/analytics";

export interface SubmittedQuote {
  id: string;
  userId: string | null;
  conversationId: string | null;
  issueId: string | null;
  serviceType: string;
  zipCode: string;
  quoteCents: number;
  quoteType: string;
  contractorName: string | null;
  description: string | null;
  wasAccepted: string | null;
  finalCostCents: number | null;
  createdAt: string;
}

export interface SubmitQuoteInput {
  issueId?: string | null;
  conversationId?: string | null;
  serviceType: string;
  zipCode: string;
  quoteCents: number;
  quoteType: "diy" | "professional";
  contractorName?: string | null;
  description?: string | null;
  wasAccepted?: "yes" | "no" | "pending" | null;
}

export function useConversationQuotes(conversationId: string | null) {
  return useQuery<{ quotes: SubmittedQuote[] }>({
    queryKey: ["quotes", conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/quotes?conversationId=${conversationId}`);
      if (!response.ok) throw new Error("Failed to fetch quotes");
      return response.json();
    },
    enabled: !!conversationId,
    staleTime: 60 * 1000,
  });
}

export function useQuoteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitQuoteInput) => {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit quote");
      }

      return response.json();
    },
    onSuccess: (_data, input) => {
      trackQuoteSubmitted({
        issueId: input.issueId,
        quoteCents: input.quoteCents,
        quoteType: input.quoteType,
        contractorName: input.contractorName,
        wasAccepted: input.wasAccepted,
      });

      if (input.wasAccepted === "yes") {
        trackQuoteAccepted({
          issueId: input.issueId,
          contractorName: input.contractorName,
        });
      } else if (input.wasAccepted === "no") {
        trackQuoteRejected({
          issueId: input.issueId,
          contractorName: input.contractorName,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      if (input.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["quotes", input.conversationId],
        });
      }
    },
  });
}
