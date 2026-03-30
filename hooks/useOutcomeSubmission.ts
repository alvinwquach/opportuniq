"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trackOutcomeRecorded } from "@/lib/analytics";

export interface SubmitOutcomeInput {
  decisionId: string;
  issueId: string;
  groupId: string;
  actualCost?: number | null;
  actualTime?: string | null;
  success: boolean;
  completedAt?: string | null;
  notes?: string | null;
}

export interface SubmittedOutcome {
  id: string;
  decisionId: string;
  actualCost: string | null;
  actualTime: string | null;
  success: boolean;
  costDelta: string | null;
  completedAt: string;
  lessonsLearned: string | null;
  createdAt: string;
}

export function useOutcomeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitOutcomeInput) => {
      const response = await fetch("/api/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionId: input.decisionId,
          actualCost: input.actualCost ?? undefined,
          actualTime: input.actualTime ?? undefined,
          success: input.success,
          completedAt: input.completedAt ?? undefined,
          notes: input.notes ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to record outcome");
      }

      return response.json() as Promise<{ outcome: SubmittedOutcome; issueId: string }>;
    },
    onSuccess: (data, input) => {
      trackOutcomeRecorded({
        issueId: input.issueId,
        groupId: input.groupId,
        success: input.success,
        actualCost: input.actualCost ?? undefined,
        costDelta: data.outcome.costDelta
          ? parseFloat(data.outcome.costDelta)
          : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["outcomes"] });
      queryClient.invalidateQueries({ queryKey: ["issue", input.issueId] });
    },
  });
}
