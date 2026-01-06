"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGroupMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  approveMember,
  rejectMember,
  cancelInvitation,
  updateInvitationRole,
  resendInvitation,
  extendInvitation,
} from "@/app/dashboard/groups/actions";
import {
  trackMemberInvited,
  trackMemberRoleChanged,
  trackMemberRemoved,
  trackMemberApproved,
  trackMemberRejected,
  trackInvitationRoleChanged,
} from "@/lib/analytics";

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

interface InviteMemberInput {
  groupId: string;
  email: string;
  role: GroupRole;
  message?: string;
  expiresAt?: Date;
}

interface UpdateRoleInput {
  groupId: string;
  memberId: string;
  newRole: GroupRole;
}

interface MemberActionInput {
  groupId: string;
  memberId: string;
}

interface CancelInvitationInput {
  groupId: string;
  invitationId: string;
}

interface UpdateInvitationRoleInput {
  groupId: string;
  invitationId: string;
  newRole: GroupRole;
}

interface ResendInvitationInput {
  groupId: string;
  invitationId: string;
}

interface ExtendInvitationInput {
  groupId: string;
  invitationId: string;
  newExpiresAt: Date;
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      const result = await getGroupMembers(groupId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch members");
      }
      return result;
    },
    staleTime: 30 * 1000,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, email, role, message, expiresAt }: InviteMemberInput) => {
      const result = await inviteMember(groupId, email, role, message, expiresAt);
      if (!result.success) {
        throw new Error(result.error || "Failed to send invitation");
      }
      return { ...result, groupId };
    },
    onSuccess: (result, variables) => {
      trackMemberInvited({
        groupId: variables.groupId,
        inviteMethod: "email",
      });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, memberId, newRole }: UpdateRoleInput) => {
      const result = await updateMemberRole(groupId, memberId, newRole);
      if (!result.success) {
        throw new Error(result.error || "Failed to update role");
      }
      return { ...result, groupId, memberId };
    },
    onSuccess: (result, variables) => {
      if (result.oldRole && result.newRole) {
        trackMemberRoleChanged({
          groupId: variables.groupId,
          memberId: variables.memberId,
          oldRole: result.oldRole,
          newRole: result.newRole,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, memberId }: MemberActionInput) => {
      const result = await removeMember(groupId, memberId);
      if (!result.success) {
        throw new Error(result.error || "Failed to remove member");
      }
      return { ...result, groupId, memberId };
    },
    onSuccess: (result, variables) => {
      trackMemberRemoved({
        groupId: variables.groupId,
        memberId: variables.memberId,
      });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useApproveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, memberId }: MemberActionInput) => {
      const result = await approveMember(groupId, memberId);
      if (!result.success) {
        throw new Error(result.error || "Failed to approve member");
      }
      return { ...result, groupId, memberId };
    },
    onSuccess: (result, variables) => {
      trackMemberApproved({
        groupId: variables.groupId,
        memberId: variables.memberId,
      });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useRejectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, memberId }: MemberActionInput) => {
      const result = await rejectMember(groupId, memberId);
      if (!result.success) {
        throw new Error(result.error || "Failed to reject member");
      }
      return { ...result, groupId, memberId };
    },
    onSuccess: (result, variables) => {
      trackMemberRejected({
        groupId: variables.groupId,
        memberId: variables.memberId,
      });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, invitationId }: CancelInvitationInput) => {
      const result = await cancelInvitation(groupId, invitationId);
      if (!result.success) {
        throw new Error(result.error || "Failed to cancel invitation");
      }
      return { ...result, groupId };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useUpdateInvitationRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, invitationId, newRole }: UpdateInvitationRoleInput) => {
      const result = await updateInvitationRole(groupId, invitationId, newRole);
      if (!result.success) {
        throw new Error(result.error || "Failed to update invitation role");
      }
      return { ...result, groupId, invitationId };
    },
    onSuccess: (result, variables) => {
      if (result.oldRole && result.newRole) {
        trackInvitationRoleChanged({
          groupId: variables.groupId,
          invitationId: variables.invitationId,
          oldRole: result.oldRole,
          newRole: result.newRole,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, invitationId }: ResendInvitationInput) => {
      const result = await resendInvitation(groupId, invitationId);
      if (!result.success) {
        throw new Error(result.error || "Failed to resend invitation");
      }
      return { ...result, groupId };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

export function useExtendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, invitationId, newExpiresAt }: ExtendInvitationInput) => {
      const result = await extendInvitation(groupId, invitationId, newExpiresAt);
      if (!result.success) {
        throw new Error(result.error || "Failed to extend invitation");
      }
      return { ...result, groupId };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}
