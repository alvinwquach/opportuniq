"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { groups, groupMembers, groupInvitations, users } from "@/app/db/schema";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  sendMemberApprovalEmail,
  sendGroupRoleChangedEmail,
  sendGroupMemberRemovedEmail,
} from "@/lib/resend";
import { logMemberAction } from "./auditLog";

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

export async function updateMemberRole(
  groupId: string,
  memberId: string,
  newRole: GroupRole
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is coordinator of this group
  const [membership] = await db
    .select({
      role: groupMembers.role,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership || membership.role !== "coordinator") {
    return { success: false, error: "Only coordinators can change member roles" };
  }

  try {
    // Get the target member
    const [targetMember] = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .where(eq(groupMembers.id, memberId));

    if (!targetMember) {
      return { success: false, error: "Member not found" };
    }

    // Can't change your own role
    if (targetMember.userId === user.id) {
      return { success: false, error: "You cannot change your own role" };
    }

    // Can't demote another coordinator
    if (targetMember.role === "coordinator" && newRole !== "coordinator") {
      return { success: false, error: "Cannot demote another coordinator" };
    }

    const oldRole = targetMember.role;

    // Update the role
    await db
      .update(groupMembers)
      .set({ role: newRole })
      .where(eq(groupMembers.id, memberId));

    // Get member and group info for email
    const [memberUser] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, targetMember.userId));

    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const [changer] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, user.id));

    if (memberUser) {
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;
      sendGroupRoleChangedEmail({
        email: memberUser.email,
        memberName: memberUser.name || "there",
        groupName: group?.name || "the group",
        changedBy: changer?.name || "A coordinator",
        oldRole,
        newRole,
        groupUrl,
      }).catch((err) => console.error("[Groups] Failed to send role changed email:", err));

      // Log audit event
      await logMemberAction({
        groupId,
        memberId,
        action: "role_changed",
        targetUserId: targetMember.userId,
        targetEmail: memberUser.email,
        performedBy: user.id,
        oldValue: oldRole,
        newValue: newRole,
      });
    }

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, oldRole, newRole };
  } catch (error) {
    console.error("[Groups] updateMemberRole error:", error);
    return { success: false, error: "Failed to update member role" };
  }
}

export async function removeMember(groupId: string, memberId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is coordinator of this group
  const [membership] = await db
    .select({
      role: groupMembers.role,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership || membership.role !== "coordinator") {
    return { success: false, error: "Only coordinators can remove members" };
  }

  try {
    // Get the target member
    const [targetMember] = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .where(eq(groupMembers.id, memberId));

    if (!targetMember) {
      return { success: false, error: "Member not found" };
    }

    // Can't remove yourself
    if (targetMember.userId === user.id) {
      return { success: false, error: "You cannot remove yourself from the group" };
    }

    // Can't remove another coordinator
    if (targetMember.role === "coordinator") {
      return { success: false, error: "Cannot remove another coordinator" };
    }

    // Get member and group info for email before removing
    const [memberUser] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, targetMember.userId));

    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const [remover] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, user.id));

    // Set status to inactive instead of deleting
    await db
      .update(groupMembers)
      .set({ status: "inactive" })
      .where(eq(groupMembers.id, memberId));

    // Send email notification
    if (memberUser) {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`;
      sendGroupMemberRemovedEmail({
        email: memberUser.email,
        memberName: memberUser.name || "there",
        groupName: group?.name || "the group",
        removedBy: remover?.name || "A coordinator",
        dashboardUrl,
      }).catch((err) => console.error("[Groups] Failed to send member removed email:", err));

      // Log audit event
      await logMemberAction({
        groupId,
        memberId,
        action: "removed",
        targetUserId: targetMember.userId,
        targetEmail: memberUser.email,
        performedBy: user.id,
        oldValue: targetMember.role,
      });
    }

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true };
  } catch (error) {
    console.error("[Groups] removeMember error:", error);
    return { success: false, error: "Failed to remove member" };
  }
}

export async function approveMember(groupId: string, memberId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is coordinator of this group
  const [membership] = await db
    .select({
      role: groupMembers.role,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership || membership.role !== "coordinator") {
    return { success: false, error: "Only coordinators can approve members" };
  }

  try {
    // Get the target member
    const [targetMember] = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        status: groupMembers.status,
      })
      .from(groupMembers)
      .where(eq(groupMembers.id, memberId));

    if (!targetMember) {
      return { success: false, error: "Member not found" };
    }

    if (targetMember.status !== "pending") {
      return { success: false, error: "Member is not pending approval" };
    }

    // Approve the member
    await db
      .update(groupMembers)
      .set({ status: "active", joinedAt: new Date() })
      .where(eq(groupMembers.id, memberId));

    // Get member and group info for email
    const [memberUser] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, targetMember.userId));

    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    if (memberUser) {
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;
      sendMemberApprovalEmail({
        email: memberUser.email,
        memberName: memberUser.name || "there",
        groupName: group?.name || "the group",
        groupUrl,
      }).catch((err) => console.error("[Groups] Failed to send approval email:", err));
    }

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true };
  } catch (error) {
    console.error("[Groups] approveMember error:", error);
    return { success: false, error: "Failed to approve member" };
  }
}

export async function rejectMember(groupId: string, memberId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is coordinator of this group
  const [membership] = await db
    .select({
      role: groupMembers.role,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership || membership.role !== "coordinator") {
    return { success: false, error: "Only coordinators can reject members" };
  }

  try {
    // Get the target member
    const [targetMember] = await db
      .select({
        id: groupMembers.id,
        status: groupMembers.status,
      })
      .from(groupMembers)
      .where(eq(groupMembers.id, memberId));

    if (!targetMember) {
      return { success: false, error: "Member not found" };
    }

    if (targetMember.status !== "pending") {
      return { success: false, error: "Member is not pending approval" };
    }

    // Delete the pending member record
    await db
      .delete(groupMembers)
      .where(eq(groupMembers.id, memberId));

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true };
  } catch (error) {
    console.error("[Groups] rejectMember error:", error);
    return { success: false, error: "Failed to reject member" };
  }
}

export async function getGroupMembers(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify user has access to this group
    const [membership] = await db
      .select({
        role: groupMembers.role,
      })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    // Fetch all members (active and pending)
    const members = await db
      .select({
        id: groupMembers.id,
        role: groupMembers.role,
        status: groupMembers.status,
        joinedAt: groupMembers.joinedAt,
        invitedAt: groupMembers.invitedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          or(eq(groupMembers.status, "active"), eq(groupMembers.status, "pending"))
        )
      );

    // Sort: coordinators first, then by status, then by join date
    const sortedMembers = [...members].sort((a, b) => {
      if (a.role === "coordinator" && b.role !== "coordinator") return -1;
      if (b.role === "coordinator" && a.role !== "coordinator") return 1;
      if (a.status === "active" && b.status === "pending") return -1;
      if (b.status === "active" && a.status === "pending") return 1;
      return 0;
    });

    // Get pending invitations
    const pendingInvitations = await db
      .select({
        id: groupInvitations.id,
        email: groupInvitations.inviteeEmail,
        role: groupInvitations.role,
        expiresAt: groupInvitations.expiresAt,
        acceptedAt: groupInvitations.acceptedAt,
        createdAt: groupInvitations.createdAt,
      })
      .from(groupInvitations)
      .where(eq(groupInvitations.groupId, groupId));

    // Filter out expired and accepted invitations
    const activeInvitations = pendingInvitations.filter(
      (inv) => inv.expiresAt > new Date() && !inv.acceptedAt
    );

    return {
      success: true,
      members: sortedMembers,
      pendingInvitations: activeInvitations,
      isCoordinator: membership.role === "coordinator",
      isCollaborator: membership.role === "collaborator" || membership.role === "coordinator",
      currentUserId: user.id,
    };
  } catch (error) {
    console.error("[Groups] getGroupMembers error:", error);
    return { success: false, error: "Failed to fetch members" };
  }
}
