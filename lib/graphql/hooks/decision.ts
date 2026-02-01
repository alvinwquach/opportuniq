/**
 * Decision GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type { DecisionOptionResponse, DecisionResponse } from "../types";

/**
 * Get decision option by ID
 */
export function useDecisionOption(id: string) {
  return useQuery({
    queryKey: queryKeys.decisions.option(id),
    queryFn: () =>
      gqlRequest<{ decisionOption: DecisionOptionResponse }>(queries.DECISION_OPTION_QUERY, { id }),
    select: (data) => data.decisionOption,
    enabled: !!id,
  });
}

/**
 * Vote on a decision
 */
export function useVoteOnDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { decisionId: string; vote: string; comment?: string }) =>
      gqlRequest<{ voteOnDecision: { id: string } }>(mutations.DECISION_VOTE_MUTATION, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
    },
  });
}

/**
 * Approve a decision (finalize selection)
 */
export function useApproveDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      optionId,
      assumptions,
    }: {
      optionId: string;
      assumptions?: unknown;
    }) =>
      gqlRequest<{ selectDecisionOption: DecisionResponse }>(
        mutations.DECISION_SELECT_OPTION_MUTATION,
        { optionId, assumptions }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

/**
 * Change an existing vote on a decision
 */
export function useChangeVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      voteId,
      vote,
      comment,
    }: {
      voteId: string;
      vote: string;
      comment?: string;
    }) =>
      gqlRequest<{ changeVote: { id: string; vote: string } }>(
        mutations.DECISION_CHANGE_VOTE_MUTATION,
        { voteId, vote, comment }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
    },
  });
}
