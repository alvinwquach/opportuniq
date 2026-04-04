"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import {
  groups,
  groupMembers,
  groupInvitationAuditLog,
  groupMemberAuditLog,
  users,
} from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";

type InvitationAction =
  | "created"
  | "resent"
  | "role_updated"
  | "extended"
  | "revoked"
  | "accepted"
  | "declined"
  | "expired"
  | "bulk_created";

interface LogInvitationActionParams {
  groupId: string;
  invitationId?: string;
  action: InvitationAction;
  inviteeEmail: string;
  performedBy: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Internal function to log an invitation audit event
 * Called by invitation action functions
 */
export async function logInvitationAction({
  groupId,
  invitationId,
  action,
  inviteeEmail,
  performedBy,
  oldValue,
  newValue,
  metadata,
}: LogInvitationActionParams) {
  try {
    await db.insert(groupInvitationAuditLog).values({
      groupId,
      invitationId,
      action,
      inviteeEmail,
      performedBy,
      oldValue,
      newValue,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    // Log error but don't fail the main operation
  }
}

export interface InvitationAuditLogEntry {
  id: string;
  action: InvitationAction;
  inviteeEmail: string;
  oldValue: string | null;
  newValue: string | null;
  metadata: string | null;
  createdAt: Date;
  performedBy: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

/**
 * Get invitation history/audit log for a group
 * Returns paginated list of audit log entries
 */
export async function getInvitationAuditLog(
  groupId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized", entries: [] };
  }

  // Verify user is a member of this group
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
    return { success: false, error: "Not a member of this group", entries: [] };
  }

  // Only coordinators and collaborators can view full audit log
  if (membership.role !== "coordinator" && membership.role !== "collaborator") {
    return {
      success: false,
      error: "Only coordinators and collaborators can view invitation history",
      entries: [],
    };
  }

  const { limit = 50, offset = 0 } = options;

  try {

    const entries = await db
      .select({
        id: groupInvitationAuditLog.id,
        action: groupInvitationAuditLog.action,
        inviteeEmail: groupInvitationAuditLog.inviteeEmail,
        oldValue: groupInvitationAuditLog.oldValue,
        newValue: groupInvitationAuditLog.newValue,
        metadata: groupInvitationAuditLog.metadata,
        createdAt: groupInvitationAuditLog.createdAt,
        performedById: groupInvitationAuditLog.performedBy,
        performerName: users.name,
        performerEmail: users.email,
        performerAvatarUrl: users.avatarUrl,
      })
      .from(groupInvitationAuditLog)
      .leftJoin(users, eq(groupInvitationAuditLog.performedBy, users.id))
      .where(eq(groupInvitationAuditLog.groupId, groupId))
      .orderBy(desc(groupInvitationAuditLog.createdAt))
      .limit(limit)
      .offset(offset);


    const formattedEntries: InvitationAuditLogEntry[] = entries.map(
      (entry) => ({
        id: entry.id,
        action: entry.action as InvitationAction,
        inviteeEmail: entry.inviteeEmail,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        performedBy: {
          id: entry.performedById,
          name: entry.performerName ?? null,
          email: entry.performerEmail ?? "Unknown",
          avatarUrl: entry.performerAvatarUrl ?? null,
        },
      })
    );

    // Get total count for pagination
    const countResult = await db
      .select({ count: groupInvitationAuditLog.id })
      .from(groupInvitationAuditLog)
      .where(eq(groupInvitationAuditLog.groupId, groupId));

    return {
      success: true,
      entries: formattedEntries,
      total: countResult.length,
      hasMore: offset + limit < countResult.length,
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch audit log", entries: [] };
  }
}

// ============================================
// MEMBER AUDIT LOG FUNCTIONS
// ============================================

type MemberAction =
  | "role_changed"
  | "removed"
  | "left"
  | "approved"
  | "rejected";

interface LogMemberActionParams {
  groupId: string;
  memberId?: string;
  action: MemberAction;
  targetUserId: string;
  targetEmail: string;
  performedBy: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Internal function to log a member audit event
 * Called by member action functions
 */
export async function logMemberAction({
  groupId,
  memberId,
  action,
  targetUserId,
  targetEmail,
  performedBy,
  oldValue,
  newValue,
  metadata,
}: LogMemberActionParams) {
  try {
    await db.insert(groupMemberAuditLog).values({
      groupId,
      memberId,
      action,
      targetUserId,
      targetEmail,
      performedBy,
      oldValue,
      newValue,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    // Log error but don't fail the main operation
  }
}
