"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { groups, groupMembers, groupInvitations, users } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  sendGroupInvitationEmail,
  sendInvitationSentConfirmationEmail,
  sendInvitationRoleUpdatedEmail,
  sendInvitationRevokedEmail,
  sendInvitationRevokedConfirmationEmail,
  sendBulkInvitationConfirmationEmail,
} from "@/lib/resend";
import { logInvitationAction } from "./auditLog";

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

export async function inviteMember(
  groupId: string,
  email: string,
  role: GroupRole = "participant",
  message?: string,
  expiresAt?: Date
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

    // Use provided expiration date or default to 7 days
    let expiration: Date;
    if (expiresAt) {
      expiration = new Date(expiresAt);
      // Validate expiration date is in the future
      if (expiration <= new Date()) {
        return { success: false, error: "Expiration date must be in the future" };
      }
    } else {
      expiration = new Date();
      expiration.setDate(expiration.getDate() + 7); // 7 days default
    }

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
        expiresAt: expiration,
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

    // Log audit event
    await logInvitationAction({
      groupId,
      invitationId: invitation.id,
      action: "created",
      inviteeEmail: emailLower,
      performedBy: user.id,
      newValue: role,
      metadata: {
        expiresAt: expiration.toISOString(),
        hasMessage: !!message,
      },
    });

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, invitation };
  } catch (error) {
    console.error("[Groups] inviteMember error:", error);
    return { success: false, error: "Failed to send invitation" };
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
    // Get invitation details before deleting (for email notification)
    const [invitation] = await db
      .select({
        email: groupInvitations.inviteeEmail,
      })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, invitationId),
          eq(groupInvitations.groupId, groupId)
        )
      );

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    // Delete the invitation
    await db
      .delete(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, invitationId),
          eq(groupInvitations.groupId, groupId)
        )
      );

    // Get group and revoker info for emails
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const [revoker] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, user.id));

    const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;

    // Send email to invitee notifying them of revocation
    sendInvitationRevokedEmail({
      email: invitation.email,
      groupName: group?.name || "the group",
      revokedBy: revoker?.name || "A coordinator",
    }).catch((err) => console.error("[Groups] Failed to send invitation revoked email:", err));

    // Send confirmation email to revoker
    if (revoker?.email) {
      sendInvitationRevokedConfirmationEmail({
        email: revoker.email,
        revokerName: revoker.name || "You",
        inviteeEmail: invitation.email,
        groupName: group?.name || "the group",
        groupUrl,
      }).catch((err) => console.error("[Groups] Failed to send invitation revoked confirmation email:", err));
    }

    // Log audit event
    await logInvitationAction({
      groupId,
      invitationId,
      action: "revoked",
      inviteeEmail: invitation.email,
      performedBy: user.id,
    });

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true };
  } catch (error) {
    console.error("[Groups] cancelInvitation error:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
}

export async function updateInvitationRole(
  groupId: string,
  invitationId: string,
  newRole: GroupRole
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
    return { success: false, error: "Only coordinators and collaborators can update invitation roles" };
  }

  try {
    // Get the invitation to verify it exists and belongs to this group
    const [invitation] = await db
      .select({
        id: groupInvitations.id,
        role: groupInvitations.role,
        email: groupInvitations.inviteeEmail,
        token: groupInvitations.token,
        expiresAt: groupInvitations.expiresAt,
        acceptedAt: groupInvitations.acceptedAt,
      })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, invitationId),
          eq(groupInvitations.groupId, groupId)
        )
      );

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    if (invitation.acceptedAt) {
      return { success: false, error: "This invitation has already been accepted" };
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: "This invitation has expired" };
    }

    const oldRole = invitation.role;

    // Update the role
    await db
      .update(groupInvitations)
      .set({ role: newRole })
      .where(eq(groupInvitations.id, invitationId));

    // Get group and changer info for email
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const [changer] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, user.id));

    // Send email notification to invitee
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/invite/${invitation.token}`;
    sendInvitationRoleUpdatedEmail({
      email: invitation.email,
      groupName: group?.name || "the group",
      changedBy: changer?.name || "A coordinator",
      oldRole,
      newRole,
      inviteUrl,
    }).catch((err) => console.error("[Groups] Failed to send invitation role updated email:", err));

    // Send confirmation email to the changer
    const [changerUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, user.id));

    if (changerUser) {
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;
      sendInvitationSentConfirmationEmail({
        email: changerUser.email,
        inviterName: changer?.name || "You",
        inviteeEmail: invitation.email,
        groupName: group?.name || "the group",
        role: newRole,
        groupUrl,
        message: `Role updated from ${oldRole} to ${newRole}`,
      }).catch((err) => console.error("[Groups] Failed to send invitation role update confirmation email:", err));
    }

    // Log audit event
    await logInvitationAction({
      groupId,
      invitationId,
      action: "role_updated",
      inviteeEmail: invitation.email,
      performedBy: user.id,
      oldValue: oldRole,
      newValue: newRole,
    });

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, oldRole, newRole, email: invitation.email };
  } catch (error) {
    console.error("[Groups] updateInvitationRole error:", error);
    return { success: false, error: "Failed to update invitation role" };
  }
}

export async function resendInvitation(groupId: string, invitationId: string) {
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
    return { success: false, error: "Only coordinators and collaborators can resend invitations" };
  }

  try {
    // Get the invitation
    const [invitation] = await db
      .select({
        id: groupInvitations.id,
        email: groupInvitations.inviteeEmail,
        role: groupInvitations.role,
        token: groupInvitations.token,
        message: groupInvitations.message,
        expiresAt: groupInvitations.expiresAt,
        acceptedAt: groupInvitations.acceptedAt,
      })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, invitationId),
          eq(groupInvitations.groupId, groupId)
        )
      );

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    if (invitation.acceptedAt) {
      return { success: false, error: "This invitation has already been accepted" };
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: "This invitation has expired. Please extend it first." };
    }

    // Get group and inviter info for email
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const [inviter] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, user.id));

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/invite/${invitation.token}`;

    // Send invitation email to invitee
    await sendGroupInvitationEmail({
      email: invitation.email,
      inviterName: inviter?.name || "A group member",
      groupName: group?.name || "a group",
      inviteUrl,
      role: invitation.role,
      message: invitation.message || undefined,
    });

    // Send confirmation email to inviter
    if (inviter?.email) {
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;
      sendInvitationSentConfirmationEmail({
        email: inviter.email,
        inviterName: inviter.name || "You",
        inviteeEmail: invitation.email,
        groupName: group?.name || "the group",
        role: invitation.role,
        groupUrl,
        message: invitation.message || undefined,
      }).catch((err) => console.error("[Groups] Failed to send invitation resent confirmation email:", err));
    }

    // Log audit event
    await logInvitationAction({
      groupId,
      invitationId,
      action: "resent",
      inviteeEmail: invitation.email,
      performedBy: user.id,
      metadata: {
        role: invitation.role,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    });

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, email: invitation.email };
  } catch (error) {
    console.error("[Groups] resendInvitation error:", error);
    return { success: false, error: "Failed to resend invitation" };
  }
}

export async function extendInvitation(
  groupId: string,
  invitationId: string,
  newExpiresAt: Date
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
    return { success: false, error: "Only coordinators and collaborators can extend invitations" };
  }

  try {
    // Get the invitation
    const [invitation] = await db
      .select({
        id: groupInvitations.id,
        email: groupInvitations.inviteeEmail,
        role: groupInvitations.role,
        token: groupInvitations.token,
        message: groupInvitations.message,
        expiresAt: groupInvitations.expiresAt,
        acceptedAt: groupInvitations.acceptedAt,
      })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, invitationId),
          eq(groupInvitations.groupId, groupId)
        )
      );

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    if (invitation.acceptedAt) {
      return { success: false, error: "This invitation has already been accepted" };
    }

    // Validate expiration date is in the future
    if (newExpiresAt <= new Date()) {
      return { success: false, error: "Expiration date must be in the future" };
    }

    // Update the invitation with new expiration (keep same token so existing links work)
    await db
      .update(groupInvitations)
      .set({
        expiresAt: newExpiresAt,
      })
      .where(eq(groupInvitations.id, invitationId));

    // Get group and inviter info for email
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const [inviter] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, user.id));

    // Send email to invitee notifying them of the extended expiration
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/invite/${invitation.token}`;

    await sendGroupInvitationEmail({
      email: invitation.email,
      inviterName: inviter?.name || "A group member",
      groupName: group?.name || "a group",
      inviteUrl,
      role: invitation.role,
      message: invitation.message || undefined,
    });

    // Send confirmation email to inviter
    if (inviter?.email) {
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;
      sendInvitationSentConfirmationEmail({
        email: inviter.email,
        inviterName: inviter.name || "You",
        inviteeEmail: invitation.email,
        groupName: group?.name || "the group",
        role: invitation.role,
        groupUrl,
        message: invitation.message || undefined,
      }).catch((err) => console.error("[Groups] Failed to send invitation extended confirmation email:", err));
    }

    // Log audit event
    await logInvitationAction({
      groupId,
      invitationId,
      action: "extended",
      inviteeEmail: invitation.email,
      performedBy: user.id,
      oldValue: invitation.expiresAt.toISOString(),
      newValue: newExpiresAt.toISOString(),
    });

    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, email: invitation.email };
  } catch (error) {
    console.error("[Groups] extendInvitation error:", error);
    return { success: false, error: "Failed to extend invitation" };
  }
}

interface BulkInviteInput {
  email: string;
  role?: GroupRole;
  message?: string;
}

interface BulkInviteResult {
  email: string;
  success: boolean;
  error?: string;
}

export async function inviteMultipleMembers(
  groupId: string,
  invites: BulkInviteInput[],
  defaultRole: GroupRole = "participant",
  defaultMessage?: string,
  expiresAt?: Date
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized", results: [] };
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
    return { success: false, error: "Only coordinators and collaborators can invite members", results: [] };
  }

  // Validate we have invites
  if (!invites || invites.length === 0) {
    return { success: false, error: "No email addresses provided", results: [] };
  }

  // Limit bulk invites to prevent abuse
  if (invites.length > 50) {
    return { success: false, error: "Maximum 50 invitations allowed at once", results: [] };
  }

  // Get group and inviter info once (used for all emails)
  const [group] = await db
    .select({ name: groups.name })
    .from(groups)
    .where(eq(groups.id, groupId));

  const [inviter] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, user.id));

  // Calculate expiration date
  let expiration: Date;
  if (expiresAt) {
    expiration = new Date(expiresAt);
    if (expiration <= new Date()) {
      return { success: false, error: "Expiration date must be in the future", results: [] };
    }
  } else {
    expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);
  }

  const results: BulkInviteResult[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const invite of invites) {
    const emailLower = invite.email.toLowerCase().trim();
    const role = invite.role || defaultRole;
    const message = invite.message || defaultMessage;

    // Validate email format
    if (!emailRegex.test(emailLower)) {
      results.push({ email: emailLower, success: false, error: "Invalid email address" });
      continue;
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
            results.push({ email: emailLower, success: false, error: "Already a member" });
            continue;
          } else if (existingMember.status === "pending") {
            results.push({ email: emailLower, success: false, error: "Has pending invitation" });
            continue;
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
        results.push({ email: emailLower, success: false, error: "Invitation already sent" });
        continue;
      }

      // Generate unique token
      const token = crypto.randomUUID();

      // Insert invitation
      await db
        .insert(groupInvitations)
        .values({
          groupId,
          inviteeEmail: emailLower,
          token,
          role,
          message: message || null,
          invitedBy: user.id,
          expiresAt: expiration,
        });

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

      results.push({ email: emailLower, success: true });
    } catch (error) {
      console.error(`[Groups] Failed to invite ${emailLower}:`, error);
      results.push({ email: emailLower, success: false, error: "Failed to send invitation" });
    }
  }

  // Send summary confirmation email to inviter
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  if (inviter?.email && successCount > 0) {
    const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;
    const successEmails = results.filter(r => r.success).map(r => r.email);

    sendBulkInvitationConfirmationEmail({
      email: inviter.email,
      inviterName: inviter.name || "You",
      groupName: group?.name || "the group",
      successCount,
      failedCount,
      successEmails,
      groupUrl,
    }).catch((err) => console.error("[Groups] Failed to send bulk invitation confirmation email:", err));
  }

  // Log audit events for successful bulk invitations
  const batchId = crypto.randomUUID();
  const successfulInvites = results.filter(r => r.success);

  for (const result of successfulInvites) {
    await logInvitationAction({
      groupId,
      action: "bulk_created",
      inviteeEmail: result.email,
      performedBy: user.id,
      newValue: defaultRole,
      metadata: {
        batchId,
        totalInBatch: successfulInvites.length,
        expiresAt: expiration.toISOString(),
      },
    });
  }

  revalidatePath(`/dashboard/groups/${groupId}`);

  return {
    success: successCount > 0,
    results,
    summary: {
      total: invites.length,
      successful: successCount,
      failed: failedCount,
    },
  };
}
