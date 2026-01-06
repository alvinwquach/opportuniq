"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { groups, groupMembers, groupConstraints, groupInvitations, users } from "@/app/db/schema";
import { eq, and, or, count } from "drizzle-orm";
import {
  createGroupFormSchema,
  updateGroupFormSchema,
  type CreateGroupFormValues,
  type UpdateGroupFormValues,
} from "@/lib/schemas/group";
import { revalidatePath } from "next/cache";
import {
  sendGroupUpdatedEmail,
  sendGroupDeletedEmail,
  sendGroupInvitationEmail,
  sendMemberApprovalEmail,
  sendGroupRoleChangedEmail,
  sendGroupMemberRemovedEmail,
  sendInvitationSentConfirmationEmail,
} from "@/lib/resend";

export async function getUserGroups() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const userGroups = await db
      .select({
        group: {
          id: groups.id,
          name: groups.name,
          postalCode: groups.postalCode,
          defaultSearchRadius: groups.defaultSearchRadius,
          createdAt: groups.createdAt,
        },
        membership: {
          role: groupMembers.role,
          status: groupMembers.status,
          joinedAt: groupMembers.joinedAt,
        },
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    return { success: true, groups: userGroups };
  } catch (error) {
    console.error("[Groups] getUserGroups error:", error);
    return { success: false, error: "Failed to fetch groups" };
  }
}

export async function createGroup(data: CreateGroupFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const parseResult = createGroupFormSchema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, postalCode, defaultSearchRadius } = parseResult.data as {
    name: string;
    postalCode?: string;
    defaultSearchRadius: number;
  };

  try {
    const result = await db.transaction(async (tx) => {
      const [newGroup] = await tx
        .insert(groups)
        .values({
          name,
          postalCode: postalCode ?? null,
          defaultSearchRadius,
        })
        .returning();

      const [membership] = await tx
        .insert(groupMembers)
        .values({
          groupId: newGroup.id,
          userId: user.id,
          role: "coordinator",
          status: "active",
          joinedAt: new Date(),
        })
        .returning();

      await tx.insert(groupConstraints).values({
        groupId: newGroup.id,
        riskTolerance: "moderate",
        diyPreference: "neutral",
      });

      return { group: newGroup, membership };
    });

    revalidatePath("/dashboard");
    revalidatePath("/groups");

    return {
      success: true,
      group: result.group,
      membership: result.membership,
    };
  } catch (error) {
    console.error("[Groups] createGroup error:", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function updateGroup(groupId: string, data: UpdateGroupFormValues) {
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
    return { success: false, error: "Only coordinators can update group settings" };
  }

  const parseResult = updateGroupFormSchema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, postalCode, defaultSearchRadius } = parseResult.data;

  try {
    // Fetch current group to detect changes
    const [currentGroup] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId));

    const [updatedGroup] = await db
      .update(groups)
      .set({
        name,
        postalCode: postalCode ?? null,
        defaultSearchRadius,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, groupId))
      .returning();

    // Build list of changes for email
    const changes: string[] = [];
    if (currentGroup.name !== name) {
      changes.push(`Group name changed to "${name}"`);
    }
    if (currentGroup.postalCode !== (postalCode ?? null)) {
      changes.push(postalCode ? `Postal code updated to ${postalCode}` : "Postal code removed");
    }
    if (currentGroup.defaultSearchRadius !== defaultSearchRadius) {
      changes.push(`Search radius changed to ${defaultSearchRadius} miles`);
    }

    // Send email notifications to all group members (except the updater)
    if (changes.length > 0) {
      const members = await db
        .select({
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.status, "active")
          )
        );

      // Get updater's name
      const [updater] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, user.id));

      const updaterName = updater?.name || "A coordinator";
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;

      // Send emails in background (don't await)
      for (const member of members) {
        if (member.user.id !== user.id) {
          sendGroupUpdatedEmail({
            email: member.user.email,
            memberName: member.user.name || "there",
            groupName: updatedGroup.name,
            updatedBy: updaterName,
            changes,
            groupUrl,
          }).catch((err) => console.error("[Groups] Failed to send update email:", err));
        }
      }
    }

    revalidatePath(`/dashboard/groups/${groupId}`);
    revalidatePath("/dashboard/groups");

    return {
      success: true,
      group: updatedGroup,
      changes,
    };
  } catch (error) {
    console.error("[Groups] updateGroup error:", error);
    return { success: false, error: "Failed to update group" };
  }
}

export async function getGroupDetails(groupId: string) {
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
        status: groupMembers.status,
        joinedAt: groupMembers.joinedAt,
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

    // Fetch group details
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId));

    if (!group) {
      return { success: false, error: "Group not found" };
    }

    // Fetch all members with user details, sorted by role (coordinator first)
    const members = await db
      .select({
        id: groupMembers.id,
        role: groupMembers.role,
        status: groupMembers.status,
        joinedAt: groupMembers.joinedAt,
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
          eq(groupMembers.status, "active")
        )
      );

    // Sort members: coordinator first, then by join date
    const sortedMembers = [...members].sort((a, b) => {
      if (a.role === "coordinator") return -1;
      if (b.role === "coordinator") return 1;
      return 0;
    });

    // Fetch group constraints/budget
    const [constraints] = await db
      .select()
      .from(groupConstraints)
      .where(eq(groupConstraints.groupId, groupId));

    // Compute derived values
    const isCoordinator = membership.role === "coordinator";
    const isCollaborator = membership.role === "collaborator" || isCoordinator;
    const sharedBalance = constraints?.sharedBalance
      ? parseFloat(constraints.sharedBalance)
      : 0;

    // Fetch pending invitations (only for coordinators and collaborators)
    let pendingInvitations: {
      id: string;
      email: string;
      role: string;
      expiresAt: Date;
      createdAt: Date;
    }[] = [];

    if (isCollaborator) {
      const invitations = await db
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
      pendingInvitations = invitations
        .filter((inv) => inv.expiresAt > new Date() && !inv.acceptedAt)
        .map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        }));
    }

    return {
      success: true,
      group,
      membership,
      members: sortedMembers,
      constraints,
      currentUserId: user.id,
      isCoordinator,
      isCollaborator,
      sharedBalance,
      pendingInvitations,
    };
  } catch (error) {
    console.error("[Groups] getGroupDetails error:", error);
    return { success: false, error: "Failed to fetch group details" };
  }
}

export async function deleteGroup(groupId: string) {
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
    return { success: false, error: "Only coordinators can delete groups" };
  }

  try {
    // Fetch group info and members before deletion
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const members = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.status, "active")
        )
      );

    // Get deleter's name
    const [deleter] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, user.id));

    const deleterName = deleter?.name || "A coordinator";
    const groupName = group?.name || "Unknown Group";
    const memberCount = members.length;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`;

    // Delete the group - cascade will handle related records
    await db.delete(groups).where(eq(groups.id, groupId));

    // Send email notifications to all group members (except the deleter)
    for (const member of members) {
      if (member.user.id !== user.id) {
        sendGroupDeletedEmail({
          email: member.user.email,
          memberName: member.user.name || "there",
          groupName,
          deletedBy: deleterName,
          dashboardUrl,
        }).catch((err) => console.error("[Groups] Failed to send delete email:", err));
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/groups");

    return { success: true, memberCount };
  } catch (error) {
    console.error("[Groups] deleteGroup error:", error);
    return { success: false, error: "Failed to delete group" };
  }
}

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

export async function inviteMember(
  groupId: string,
  email: string,
  role: GroupRole = "participant",
  message?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is coordinator or collaborator of this group
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

  if (!membership || (membership.role !== "coordinator" && membership.role !== "collaborator")) {
    return { success: false, error: "Only coordinators and collaborators can invite members" };
  }

  // Validate email format
  const emailLower = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLower)) {
    return { success: false, error: "Invalid email address" };
  }

  try {
    // Check if user with this email is already a member
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailLower));

    if (existingUser) {
      const [existingMember] = await db
        .select({ id: groupMembers.id, status: groupMembers.status })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, existingUser.id)
          )
        );

      if (existingMember) {
        if (existingMember.status === "active") {
          return { success: false, error: "This person is already a member of this group" };
        } else if (existingMember.status === "pending") {
          return { success: false, error: "This person already has a pending invitation" };
        }
      }
    }

    // Check if there's already a pending invitation for this email
    const [existingInvite] = await db
      .select({ id: groupInvitations.id, expiresAt: groupInvitations.expiresAt })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.groupId, groupId),
          eq(groupInvitations.inviteeEmail, emailLower)
        )
      );

    if (existingInvite && existingInvite.expiresAt > new Date()) {
      return { success: false, error: "An invitation was already sent to this email" };
    }

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Insert invitation
    const [invitation] = await db
      .insert(groupInvitations)
      .values({
        groupId,
        inviteeEmail: emailLower,
        token,
        role,
        message: message || null,
        invitedBy: user.id,
        expiresAt,
      })
      .returning();

    // Get group and inviter info for email
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const [inviter] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, user.id));

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/invite/${token}`;

    // Send invitation email
    await sendGroupInvitationEmail({
      email: emailLower,
      inviterName: inviter?.name || "A group member",
      groupName: group?.name || "a group",
      inviteUrl,
      role,
      message,
    });

    // Send confirmation email to inviter (for development/testing - comment out in production)
    const [inviterUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, user.id));

    if (inviterUser) {
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;
      sendInvitationSentConfirmationEmail({
        email: inviterUser.email,
        inviterName: inviter?.name || "You",
        inviteeEmail: emailLower,
        groupName: group?.name || "the group",
        role,
        groupUrl,
        message,
      }).catch((err) => console.error("[Groups] Failed to send invitation confirmation email:", err));
    }

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, invitation };
  } catch (error) {
    console.error("[Groups] inviteMember error:", error);
    return { success: false, error: "Failed to send invitation" };
  }
}

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

export async function cancelInvitation(groupId: string, invitationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is coordinator or collaborator of this group
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

  if (!membership || (membership.role !== "coordinator" && membership.role !== "collaborator")) {
    return { success: false, error: "Only coordinators and collaborators can cancel invitations" };
  }

  try {
    await db
      .delete(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, invitationId),
          eq(groupInvitations.groupId, groupId)
        )
      );

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true };
  } catch (error) {
    console.error("[Groups] cancelInvitation error:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
}
