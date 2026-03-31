// Pull in useQuery, useMutation, and useQueryClient from TanStack Query.
// - useQuery       : fetches and caches data from the server for display.
// - useMutation    : sends changes (votes, approvals, etc.) to the server.
// - useQueryClient : gives us access to the shared cache manager so we can
//                    discard stale cache entries after a mutation succeeds.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Pull in the queryKeys helper that generates stable cache key arrays.
// Having keys in one place prevents different parts of the app from using
// slightly different strings for the same data, which would cause stale
// cache entries to never be cleaned up.
import { queryKeys } from "./keys";

// Pull in four server actions for decision-related operations.
// Server actions run on the server and can safely access the database.
// - getDecisionOption    : fetches the details of one specific decision option
// - selectDecisionOption : marks a decision option as the approved/chosen path forward
// - voteOnDecision       : records a user's vote (e.g. approve / reject) on a decision
// - changeVote           : updates a vote the user has already cast
import {
  getDecisionOption,
  selectDecisionOption,
  voteOnDecision,
  changeVote,
} from "@/app/actions/decisions/decisionActions";

// Define and export a custom hook called useDecisionOption.
// Components call this to load and display the details of a single decision option
// (e.g. "Hire a plumber for $200" vs "DIY for $50").
// Returns { data, isLoading, error } so the component can render each state.
export function useDecisionOption(id: string) {
  return useQuery({
    // Cache key is scoped to the specific option ID so each option gets
    // its own dedicated cache slot. Looking up option A won't overwrite option B.
    queryKey: queryKeys.decisions.option(id),

    // queryFn calls the server action to load the option details from the DB.
    queryFn: () => getDecisionOption(id),

    // Guard: only run the query if id is a non-empty string.
    // !!id converts the string to true (has value) or false (empty/undefined).
    // Without this, the query would fire immediately on mount with an empty id,
    // sending a bad request to the server before the caller has the real ID.
    enabled: !!id,
  });
}

// Define and export a custom hook called useVoteOnDecision.
// Components call this when a group member submits their vote on a proposed decision
// (e.g. pressing "Approve" or "Reject" with an optional comment).
// Returns { mutate, isPending, error } so the vote button can show a saving state.
export function useVoteOnDecision() {
  // Grab the cache manager so we can invalidate stale entries after the vote is saved.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(input) is called.
    // input carries:
    // - decisionId : the unique ID of the decision being voted on
    // - vote       : the vote value (e.g. "approve", "reject", "abstain")
    // - comment    : (optional) text the user wants to attach to their vote
    mutationFn: (input: { decisionId: string; vote: string; comment?: string }) =>
      voteOnDecision(input),

    // onSuccess fires after the server confirms the vote was recorded.
    // We invalidate both decisions and issues cache entries because:
    // - A new vote can change the decision's overall tally / status.
    // - Some issue views show the current vote count alongside the issue details.
    // The broad .all keys cover every cache slot under those namespaces,
    // so every related list and detail view will re-fetch fresh data.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
    },
  });
}

// Define and export a custom hook called useApproveDecision.
// This is the "lock in" mutation — a group admin or owner calls this to select
// a specific option as the final approved decision, closing the voting phase.
// Returns { mutate, isPending, error } for the approve button's UI state.
export function useApproveDecision() {
  // Get the cache manager so we can clean up multiple cache namespaces after approval.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate({ optionId, assumptions }) is called.
    // - optionId    : the ID of the decision option being approved/selected
    // - assumptions : (optional) any extra context or caveats the approver wants
    //                 to record alongside the selection; typed as unknown because
    //                 the shape can vary depending on the type of decision.
    mutationFn: ({
      optionId,
      assumptions,
    }: {
      optionId: string;
      assumptions?: unknown;
    }) => selectDecisionOption(optionId, assumptions),

    // onSuccess fires after the server confirms the option was selected.
    // We invalidate three cache namespaces because approving a decision
    // affects multiple parts of the UI simultaneously:
    onSuccess: () => {
      // Refresh all decision-related cache entries so any decision lists/details
      // immediately show the newly approved status.
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });

      // Refresh all issue-related cache entries because the parent issue's status
      // typically changes when a decision is approved (e.g. "In Progress" → "Approved").
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });

      // Refresh the dashboard stats because approving a decision updates counters
      // like "open decisions" or "resolved issues" shown on the dashboard.
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// Define and export a custom hook called useChangeVote.
// Components call this when a user wants to update a vote they already cast —
// for example, changing from "reject" to "approve" after reading new information.
// Returns { mutate, isPending, error } for the change-vote button's UI state.
export function useChangeVote() {
  // Get the cache manager for post-mutation invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate({ voteId, vote, comment }) is called.
    // - voteId  : the unique ID of the existing vote record being changed
    // - vote    : the new vote value to replace the old one (e.g. "approve")
    // - comment : (optional) updated or new comment to attach to the vote
    mutationFn: ({
      voteId,
      vote,
      comment,
    }: {
      voteId: string;
      vote: string;
      comment?: string;
    }) => changeVote(voteId, vote, comment),

    // onSuccess fires after the server confirms the vote was updated.
    // Changing a vote can shift the decision's overall tally so we invalidate
    // both decisions and issues to keep all related views consistent.
    onSuccess: () => {
      // Invalidate all decisions cache entries so vote counts and statuses refresh.
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });

      // Invalidate all issues cache entries because some issue views surface
      // vote summaries alongside the issue data.
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
    },
  });
}
