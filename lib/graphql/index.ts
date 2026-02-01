/**
 * GraphQL Client Library
 *
 * Main entry point for client-side GraphQL operations.
 * Use these exports in your React components.
 *
 * @example
 * import { useMe, useMyGroups, useCreateIssue } from '@/lib/graphql';
 *
 * function MyComponent() {
 *   const { data: user } = useMe();
 *   const { data: groups } = useMyGroups();
 *   const { mutate: createIssue } = useCreateIssue();
 * }
 */

// Client utilities
export { graphqlClient, createGraphQLClient, gqlRequest } from "./client";
export type { GraphQLResponse } from "./client";

// Query key factory (for manual cache invalidation)
export { queryKeys } from "./keys";

// Types
export * from "./types";

// Hooks - User
export { useMe, useMeWithGroups, useUpdateProfile, useUpdatePreferences } from "./hooks";

// Hooks - Groups
export {
  useMyGroups,
  useGroup,
  useGroupWithMembers,
  useGroupInvitations,
  useMyPendingInvitations,
  useCreateGroup,
  useUpdateGroup,
  useLeaveGroup,
  useAcceptInvitation,
  useDeclineInvitation,
  useUpdateMemberRole,
} from "./hooks";

// Hooks - Issues
export {
  useIssues,
  useIssue,
  useIssueWithOptions,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  useAddComment,
  useDeleteComment,
} from "./hooks";

// Hooks - Decisions
export { useDecisionOption, useVoteOnDecision, useApproveDecision } from "./hooks";

// Hooks - Guides
export { useMyGuides, useBookmarkGuide, useTrackGuideClick, useRateGuide } from "./hooks";

// Hooks - Finance
export {
  useMyIncomeStreams,
  useAddIncomeStream,
  useUpdateIncomeStream,
  useDeleteIncomeStream,
  useMyExpenses,
  useAddExpense,
  useUpdateExpense,
  useDeleteExpense,
  useMyBudgets,
  useSetBudget,
  useUpdateBudgetSpend,
  useDeleteBudget,
  useMyFinancialSummary,
} from "./hooks";

// Hooks - Dashboard & Outcomes
export {
  useDashboardStats,
  useGroupResolutionStats,
  useDecisionOutcome,
  useRecordOutcome,
  usePreferenceHistory,
} from "./hooks";

// Raw queries (for advanced use cases)
export * as queries from "./queries";
export * as mutations from "./mutations";
