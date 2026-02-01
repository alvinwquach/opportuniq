/**
 * Group GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  GroupListItem,
  GroupResponse,
  GroupWithMembersResponse,
  GroupMemberResponse,
  GroupInvitationResponse,
  GroupConstraintsResponse,
  CreateGroupInput,
  UpdateGroupInput,
  GroupsPageDataResponse,
} from "../types";

/**
 * Get all user's groups
 */
export function useMyGroups() {
  return useQuery({
    queryKey: queryKeys.groups.myGroups(),
    queryFn: () => gqlRequest<{ myGroups: GroupListItem[] }>(queries.MY_GROUPS_QUERY),
    select: (data) => data.myGroups,
  });
}

/**
 * Get group by ID
 */
export function useGroup(id: string) {
  return useQuery({
    queryKey: queryKeys.groups.detail(id),
    queryFn: () => gqlRequest<{ group: GroupResponse }>(queries.GROUP_BY_ID_QUERY, { id }),
    select: (data) => data.group,
    enabled: !!id,
  });
}

/**
 * Get group with members
 */
export function useGroupWithMembers(id: string) {
  return useQuery({
    queryKey: queryKeys.groups.withMembers(id),
    queryFn: () =>
      gqlRequest<{ group: GroupWithMembersResponse }>(queries.GROUP_WITH_MEMBERS_QUERY, { id }),
    select: (data) => data.group,
    enabled: !!id,
  });
}

/**
 * Get group invitations
 */
export function useGroupInvitations(groupId: string) {
  return useQuery({
    queryKey: queryKeys.groups.invitations(groupId),
    queryFn: () =>
      gqlRequest<{ groupInvitations: GroupInvitationResponse[] }>(
        queries.GROUP_INVITATIONS_QUERY,
        { groupId }
      ),
    select: (data) => data.groupInvitations,
    enabled: !!groupId,
  });
}

/**
 * Get user's pending invitations
 */
export function useMyPendingInvitations() {
  return useQuery({
    queryKey: queryKeys.invitations.pending(),
    queryFn: () =>
      gqlRequest<{ myPendingInvitations: GroupInvitationResponse[] }>(
        queries.MY_PENDING_INVITATIONS_QUERY
      ),
    select: (data) => data.myPendingInvitations,
  });
}

/**
 * Create a new group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) =>
      gqlRequest<{ createGroup: GroupResponse }>(mutations.GROUP_CREATE_MUTATION, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

/**
 * Update group settings
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGroupInput }) =>
      gqlRequest<{ updateGroup: GroupResponse }>(mutations.GROUP_UPDATE_MUTATION, { id, input }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(id) });
    },
  });
}

/**
 * Leave a group
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) =>
      gqlRequest<{ leaveGroup: boolean }>(mutations.GROUP_LEAVE_MUTATION, { groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

/**
 * Accept an invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      gqlRequest<{ acceptInvitation: GroupMemberResponse }>(
        mutations.INVITATION_ACCEPT_MUTATION,
        { invitationId }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

/**
 * Decline an invitation
 */
export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      gqlRequest<{ declineInvitation: boolean }>(
        mutations.INVITATION_DECLINE_MUTATION,
        { invitationId }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    },
  });
}

/**
 * Update member role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      memberId,
      role,
    }: {
      groupId: string;
      memberId: string;
      role: string;
    }) =>
      gqlRequest<{ updateMemberRole: GroupMemberResponse }>(
        mutations.GROUP_UPDATE_MEMBER_ROLE_MUTATION,
        { groupId, memberId, role }
      ),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.withMembers(groupId) });
    },
  });
}

/**
 * Update group budget constraints
 */
export function useUpdateGroupConstraints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string;
      input: {
        monthlyBudget?: string;
        emergencyBuffer?: string;
        riskTolerance?: string;
        diyPreference?: string;
        neverDIY?: string[];
      };
    }) =>
      gqlRequest<{ updateGroupConstraints: GroupConstraintsResponse }>(
        mutations.GROUP_UPDATE_CONSTRAINTS_MUTATION,
        { groupId, input }
      ),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
  });
}

/**
 * Invite a member to the group
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      email,
      role,
    }: {
      groupId: string;
      email: string;
      role: string;
    }) =>
      gqlRequest<{ inviteMember: GroupMemberResponse }>(
        mutations.GROUP_INVITE_MEMBER_MUTATION,
        { groupId, email, role }
      ),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.withMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invitations(groupId) });
    },
  });
}

/**
 * Remove a member from the group
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      gqlRequest<{ removeMember: boolean }>(mutations.GROUP_REMOVE_MEMBER_MUTATION, {
        groupId,
        memberId,
      }),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.withMembers(groupId) });
    },
  });
}

/**
 * Get comprehensive data for the groups page view
 */
export function useGroupsPageData() {
  return useQuery({
    queryKey: queryKeys.groups.pageData(),
    queryFn: () =>
      gqlRequest<{ groupsPageData: GroupsPageDataResponse }>(queries.GROUPS_PAGE_DATA_QUERY),
    select: (data) => data.groupsPageData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
}
