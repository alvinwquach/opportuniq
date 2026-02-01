/**
 * Issue GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  IssueListItem,
  IssueResponse,
  IssueWithOptionsResponse,
  CommentResponse,
  CreateIssueInput,
  UpdateIssueInput,
  ResolveIssueInput,
  IssuesPageDataResponse,
} from "../types";

/**
 * Get issues for a group
 */
export function useIssues(
  groupId: string,
  filters?: {
    status?: string;
    priority?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }
) {
  return useQuery({
    queryKey: queryKeys.issues.list(groupId, filters),
    queryFn: () =>
      gqlRequest<{ issues: IssueListItem[] }>(queries.ISSUES_LIST_QUERY, { groupId, ...filters }),
    select: (data) => data.issues,
    enabled: !!groupId,
  });
}

/**
 * Get issue by ID
 */
export function useIssue(id: string) {
  return useQuery({
    queryKey: queryKeys.issues.detail(id),
    queryFn: () => gqlRequest<{ issue: IssueResponse }>(queries.ISSUE_BY_ID_QUERY, { id }),
    select: (data) => data.issue,
    enabled: !!id,
  });
}

/**
 * Get issue with options
 */
export function useIssueWithOptions(id: string) {
  return useQuery({
    queryKey: queryKeys.issues.withOptions(id),
    queryFn: () =>
      gqlRequest<{ issue: IssueWithOptionsResponse }>(queries.ISSUE_WITH_OPTIONS_QUERY, { id }),
    select: (data) => data.issue,
    enabled: !!id,
  });
}

/**
 * Create an issue
 */
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIssueInput) =>
      gqlRequest<{ createIssue: IssueResponse }>(mutations.ISSUE_CREATE_MUTATION, { input }),
    onSuccess: (data) => {
      const groupId = data.createIssue.group?.id;
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

/**
 * Update an issue
 */
export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIssueInput }) =>
      gqlRequest<{ updateIssue: IssueResponse }>(mutations.ISSUE_UPDATE_MUTATION, { id, input }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
    },
  });
}

/**
 * Delete an issue
 */
export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ deleteIssue: boolean }>(mutations.ISSUE_DELETE_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

/**
 * Add a comment to an issue
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { issueId: string; content: string }) =>
      gqlRequest<{ addComment: CommentResponse }>(mutations.COMMENT_ADD_MUTATION, { input }),
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
    },
  });
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, issueId }: { id: string; issueId: string }) =>
      gqlRequest<{ deleteComment: boolean }>(mutations.COMMENT_DELETE_MUTATION, { id }),
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
    },
  });
}

/**
 * Edit a comment (author only)
 */
export function useEditComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content, issueId }: { id: string; content: string; issueId: string }) =>
      gqlRequest<{ editComment: CommentResponse }>(mutations.COMMENT_EDIT_MUTATION, {
        id,
        content,
      }),
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
    },
  });
}

/**
 * Mark an issue as resolved
 */
export function useResolveIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ResolveIssueInput }) =>
      gqlRequest<{ resolveIssue: IssueResponse }>(mutations.ISSUE_RESOLVE_MUTATION, {
        id,
        input,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

/**
 * Reopen a completed/deferred issue
 */
export function useReopenIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ reopenIssue: IssueResponse }>(mutations.ISSUE_REOPEN_MUTATION, { id }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

/**
 * Get comprehensive data for the issues page view
 * This is the main hook for the issues page
 */
export function useIssuesPageData() {
  return useQuery({
    queryKey: queryKeys.issues.pageData(),
    queryFn: () =>
      gqlRequest<{ issuesPageData: IssuesPageDataResponse }>(queries.ISSUES_PAGE_DATA_QUERY),
    select: (data) => data.issuesPageData,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true,
  });
}
