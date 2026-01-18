"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import {
  issues,
  issueActivityLog,
  issueEvidence,
  issueComments,
  issueHypotheses,
  diySchedules,
  groupMembers,
  users,
} from "@/app/db/schema";
import {
  decisions,
  decisionOptions,
  decisionVotes,
} from "@/app/db/schema/decisions";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import type { NewIssueActivityLog } from "@/app/db/schema";

// ============================================
// ACTIVITY LOGGING CORE
// ============================================

type IssueActivityType =
  | "status_changed"
  | "issue_created"
  | "issue_reopened"
  | "evidence_added"
  | "evidence_removed"
  | "hypothesis_generated"
  | "diagnosis_updated"
  | "options_generated"
  | "decision_made"
  | "decision_voted"
  | "schedule_created"
  | "schedule_updated"
  | "schedule_deleted"
  | "comment_added"
  | "comment_edited"
  | "vendor_contacted"
  | "vendor_added"
  | "product_purchased"
  | "outcome_recorded"
  | "issue_completed"
  | "resolution_set";

interface LogIssueActivityParams {
  issueId: string;
  activityType: IssueActivityType;
  performedBy?: string; // Group member ID (null for system/AI actions)
  title: string;
  description?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: NewIssueActivityLog["metadata"];
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Core function to log an issue activity event
 * Called by all issue-related action functions
 */
export async function logIssueActivity({
  issueId,
  activityType,
  performedBy,
  title,
  description,
  oldValue,
  newValue,
  metadata,
  relatedEntityType,
  relatedEntityId,
}: LogIssueActivityParams) {
  try {
    await db.insert(issueActivityLog).values({
      issueId,
      activityType,
      performedBy,
      title,
      description,
      oldValue,
      newValue,
      metadata,
      relatedEntityType,
      relatedEntityId,
    });
  } catch (error) {
    // Log error but don't fail the main operation
    console.error("[IssueActivityLog] Failed to log activity:", error);
  }
}

// ============================================
// ISSUE STATUS & RESOLUTION ACTIONS
// ============================================

/**
 * Update issue status with activity logging
 */
export async function updateIssueStatus(
  issueId: string,
  newStatus: "open" | "investigating" | "options_generated" | "decided" | "in_progress" | "completed" | "deferred"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get current issue and verify membership
    const [issue] = await db
      .select({
        id: issues.id,
        status: issues.status,
        groupId: issues.groupId,
      })
      .from(issues)
      .where(eq(issues.id, issueId));

    if (!issue) {
      return { success: false, error: "Issue not found" };
    }

    // Verify user is a member of the group
    const [membership] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issue.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    const oldStatus = issue.status;

    // Update the issue
    await db
      .update(issues)
      .set({
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === "completed" ? { completedAt: new Date() } : {}),
      })
      .where(eq(issues.id, issueId));

    // Log the activity
    await logIssueActivity({
      issueId,
      activityType: newStatus === "completed" ? "issue_completed" : "status_changed",
      performedBy: membership.id,
      title: `Status changed to ${newStatus.replace("_", " ")}`,
      oldValue: oldStatus,
      newValue: newStatus,
    });

    return { success: true };
  } catch (error) {
    console.error("[Issues] updateIssueStatus error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Set issue resolution with outcome tracking
 */
export async function setIssueResolution(
  issueId: string,
  resolution: {
    type: "diy" | "hired" | "replaced" | "abandoned" | "deferred" | "monitoring";
    notes?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get current issue and verify membership
    const [issue] = await db
      .select({
        id: issues.id,
        groupId: issues.groupId,
        resolutionType: issues.resolutionType,
      })
      .from(issues)
      .where(eq(issues.id, issueId));

    if (!issue) {
      return { success: false, error: "Issue not found" };
    }

    // Verify user is a member of the group
    const [membership] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issue.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    const oldResolution = issue.resolutionType;

    // Update the issue with resolution
    await db
      .update(issues)
      .set({
        resolutionType: resolution.type,
        resolutionNotes: resolution.notes,
        resolvedAt: new Date(),
        resolvedBy: membership.id,
        status: resolution.type === "deferred" || resolution.type === "monitoring" ? "deferred" : "completed",
        updatedAt: new Date(),
        ...(resolution.type !== "deferred" && resolution.type !== "monitoring" ? { completedAt: new Date() } : {}),
      })
      .where(eq(issues.id, issueId));

    // Log the activity
    await logIssueActivity({
      issueId,
      activityType: "resolution_set",
      performedBy: membership.id,
      title: `Resolved as ${resolution.type}`,
      description: resolution.notes ?? undefined,
      oldValue: oldResolution ?? undefined,
      newValue: resolution.type,
      metadata: {
        resolutionType: resolution.type,
        resolutionReason: resolution.notes,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[Issues] setIssueResolution error:", error);
    return { success: false, error: "Failed to set resolution" };
  }
}

/**
 * Reopen a resolved or completed issue
 */
export async function reopenIssue(issueId: string, reason?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get current issue and verify membership
    const [issue] = await db
      .select({
        id: issues.id,
        groupId: issues.groupId,
        status: issues.status,
        resolutionType: issues.resolutionType,
      })
      .from(issues)
      .where(eq(issues.id, issueId));

    if (!issue) {
      return { success: false, error: "Issue not found" };
    }

    // Verify user is a member of the group
    const [membership] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issue.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    const oldStatus = issue.status;

    // Reopen the issue
    await db
      .update(issues)
      .set({
        status: "open",
        resolutionType: null,
        resolutionNotes: null,
        resolvedAt: null,
        resolvedBy: null,
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, issueId));

    // Log the activity
    await logIssueActivity({
      issueId,
      activityType: "issue_reopened",
      performedBy: membership.id,
      title: "Issue reopened",
      description: reason,
      oldValue: oldStatus,
      newValue: "open",
    });

    return { success: true };
  } catch (error) {
    console.error("[Issues] reopenIssue error:", error);
    return { success: false, error: "Failed to reopen issue" };
  }
}

// ============================================
// TIMELINE AGGREGATION
// ============================================

export interface TimelineEntry {
  id: string;
  type: "activity" | "comment" | "evidence" | "schedule" | "decision" | "vote" | "outcome";
  timestamp: Date;
  title: string;
  description?: string;
  performer?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Get aggregated timeline for an issue
 * Merges activity log, comments, evidence, schedules, decisions, votes, outcomes
 */
export async function getIssueTimeline(
  issueId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ success: boolean; error?: string; entries: TimelineEntry[]; total: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized", entries: [], total: 0 };
  }

  try {
    // Get issue and verify membership
    const [issue] = await db
      .select({ id: issues.id, groupId: issues.groupId })
      .from(issues)
      .where(eq(issues.id, issueId));

    if (!issue) {
      return { success: false, error: "Issue not found", entries: [], total: 0 };
    }

    // Verify user is a member
    const [membership] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issue.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group", entries: [], total: 0 };
    }

    const entries: TimelineEntry[] = [];

    // 1. Activity log entries
    const activities = await db
      .select({
        id: issueActivityLog.id,
        title: issueActivityLog.title,
        description: issueActivityLog.description,
        createdAt: issueActivityLog.createdAt,
        performedBy: issueActivityLog.performedBy,
        metadata: issueActivityLog.metadata,
      })
      .from(issueActivityLog)
      .where(eq(issueActivityLog.issueId, issueId))
      .orderBy(desc(issueActivityLog.createdAt));

    // 2. Comments
    const comments = await db
      .select({
        id: issueComments.id,
        content: issueComments.content,
        createdAt: issueComments.createdAt,
        userId: issueComments.userId,
      })
      .from(issueComments)
      .where(eq(issueComments.issueId, issueId));

    // 3. Evidence
    const evidence = await db
      .select({
        id: issueEvidence.id,
        evidenceType: issueEvidence.evidenceType,
        fileName: issueEvidence.fileName,
        createdAt: issueEvidence.createdAt,
        uploadedBy: issueEvidence.uploadedBy,
      })
      .from(issueEvidence)
      .where(eq(issueEvidence.issueId, issueId));

    // 4. Schedules
    const schedules = await db
      .select({
        id: diySchedules.id,
        scheduledTime: diySchedules.scheduledTime,
        createdAt: diySchedules.createdAt,
        createdBy: diySchedules.createdBy,
      })
      .from(diySchedules)
      .where(eq(diySchedules.issueId, issueId));

    // Collect all member IDs for user lookup
    const memberIds = new Set<string>();
    activities.forEach((a) => a.performedBy && memberIds.add(a.performedBy));
    comments.forEach((c) => memberIds.add(c.userId));
    evidence.forEach((e) => memberIds.add(e.uploadedBy));
    schedules.forEach((s) => memberIds.add(s.createdBy));

    // Get user details for all members
    const memberIdArray = Array.from(memberIds);
    const memberDetails: Map<string, { name: string | null; avatarUrl: string | null }> = new Map();

    if (memberIdArray.length > 0) {
      const members = await db
        .select({
          memberId: groupMembers.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        })
        .from(groupMembers)
        .leftJoin(users, eq(groupMembers.userId, users.id))
        .where(inArray(groupMembers.id, memberIdArray));

      members.forEach((m) => {
        memberDetails.set(m.memberId, { name: m.name, avatarUrl: m.avatarUrl });
      });
    }

    // Transform activities
    activities.forEach((a) => {
      const performer = a.performedBy ? memberDetails.get(a.performedBy) : null;
      entries.push({
        id: a.id,
        type: "activity",
        timestamp: a.createdAt,
        title: a.title || "Untitled Activity",
        description: a.description ?? undefined,
        performer: performer ? { id: a.performedBy!, ...performer } : undefined,
        metadata: a.metadata as Record<string, unknown> | undefined,
      });
    });

    // Transform comments
    comments.forEach((c) => {
      const performer = memberDetails.get(c.userId);
      entries.push({
        id: c.id,
        type: "comment",
        timestamp: c.createdAt,
        title: "Added a comment",
        description: c.content ?? undefined,
        performer: performer ? { id: c.userId, ...performer } : undefined,
      });
    });

    // Transform evidence (only if not already in activity log)
    const activityEvidenceIds = new Set(
      activities
        .map((a) => (a.metadata as { evidenceId?: string } | null)?.evidenceId)
        .filter(Boolean)
    );

    evidence.forEach((e) => {
      if (!activityEvidenceIds.has(e.id)) {
        const performer = memberDetails.get(e.uploadedBy);
        entries.push({
          id: e.id,
          type: "evidence",
          timestamp: e.createdAt,
          title: `Added ${e.evidenceType} evidence`,
          description: e.fileName ?? undefined,
          performer: performer ? { id: e.uploadedBy, ...performer } : undefined,
          metadata: { evidenceType: e.evidenceType },
        });
      }
    });

    // Transform schedules (only if not already in activity log)
    const activityScheduleIds = new Set(
      activities
        .map((a) => (a.metadata as { scheduleId?: string } | null)?.scheduleId)
        .filter(Boolean)
    );

    schedules.forEach((s) => {
      if (!activityScheduleIds.has(s.id)) {
        const performer = memberDetails.get(s.createdBy);
        entries.push({
          id: s.id,
          type: "schedule",
          timestamp: s.createdAt,
          title: "Scheduled DIY work",
          description: `Scheduled for ${s.scheduledTime.toLocaleDateString()}`,
          performer: performer ? { id: s.createdBy, ...performer } : undefined,
          metadata: { scheduledTime: s.scheduledTime.toISOString() },
        });
      }
    });

    // Sort by timestamp descending
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const { limit = 50, offset = 0 } = options;
    const paginatedEntries = entries.slice(offset, offset + limit);

    return {
      success: true,
      entries: paginatedEntries,
      total: entries.length,
    };
  } catch (error) {
    console.error("[Issues] getIssueTimeline error:", error);
    return { success: false, error: "Failed to fetch timeline", entries: [], total: 0 };
  }
}

// ============================================
// ISSUE DETAILS
// ============================================

export interface IssueDetails {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  diagnosis: string | null;
  severity: string | null;
  urgency: string | null;
  resolutionType: string | null;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  groupId: string;
  groupName: string;
  createdBy: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  resolvedBy?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  evidenceCount: number;
  commentCount: number;
  scheduleCount: number;
}

/**
 * Get full issue details with related counts
 */
export async function getIssueDetails(
  issueId: string
): Promise<{ success: boolean; error?: string; issue?: IssueDetails }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Import groups dynamically to avoid circular dependency
    const { groups } = await import("@/app/db/schema/groups");

    // Get issue with creator details
    const [issueData] = await db
      .select({
        id: issues.id,
        title: issues.title,
        description: issues.description,
        status: issues.status,
        priority: issues.priority,
        category: issues.category,
        diagnosis: issues.diagnosis,
        severity: issues.severity,
        urgency: issues.urgency,
        resolutionType: issues.resolutionType,
        resolutionNotes: issues.resolutionNotes,
        resolvedAt: issues.resolvedAt,
        resolvedBy: issues.resolvedBy,
        createdAt: issues.createdAt,
        updatedAt: issues.updatedAt,
        completedAt: issues.completedAt,
        groupId: issues.groupId,
        createdBy: issues.createdBy,
        groupName: groups.name,
      })
      .from(issues)
      .leftJoin(groups, eq(issues.groupId, groups.id))
      .where(eq(issues.id, issueId));

    if (!issueData) {
      return { success: false, error: "Issue not found" };
    }

    // Verify user is a member
    const [membership] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issueData.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    // Get creator details
    const [creatorMember] = await db
      .select({
        memberId: groupMembers.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.id, issueData.createdBy));

    // Get resolver details if resolved
    let resolverDetails;
    if (issueData.resolvedBy) {
      const [resolverMember] = await db
        .select({
          memberId: groupMembers.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        })
        .from(groupMembers)
        .leftJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.id, issueData.resolvedBy));

      if (resolverMember) {
        resolverDetails = {
          id: resolverMember.memberId,
          name: resolverMember.name,
          avatarUrl: resolverMember.avatarUrl,
        };
      }
    }

    // Get counts
    const evidenceResult = await db
      .select({ id: issueEvidence.id })
      .from(issueEvidence)
      .where(eq(issueEvidence.issueId, issueId));

    const commentResult = await db
      .select({ id: issueComments.id })
      .from(issueComments)
      .where(eq(issueComments.issueId, issueId));

    const scheduleResult = await db
      .select({ id: diySchedules.id })
      .from(diySchedules)
      .where(eq(diySchedules.issueId, issueId));

    return {
      success: true,
      issue: {
        id: issueData.id,
        title: issueData.title || "Untitled Issue",
        description: issueData.description,
        status: issueData.status,
        priority: issueData.priority,
        category: issueData.category,
        diagnosis: issueData.diagnosis,
        severity: issueData.severity,
        urgency: issueData.urgency,
        resolutionType: issueData.resolutionType,
        resolutionNotes: issueData.resolutionNotes,
        resolvedAt: issueData.resolvedAt,
        createdAt: issueData.createdAt,
        updatedAt: issueData.updatedAt,
        completedAt: issueData.completedAt,
        groupId: issueData.groupId,
        groupName: issueData.groupName ?? "Unknown Group",
        createdBy: {
          id: creatorMember?.memberId ?? issueData.createdBy,
          name: creatorMember?.name ?? null,
          avatarUrl: creatorMember?.avatarUrl ?? null,
        },
        resolvedBy: resolverDetails,
        evidenceCount: evidenceResult.length,
        commentCount: commentResult.length,
        scheduleCount: scheduleResult.length,
      },
    };
  } catch (error) {
    console.error("[Issues] getIssueDetails error:", error);
    return { success: false, error: "Failed to fetch issue details" };
  }
}
