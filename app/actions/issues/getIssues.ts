"use server";

/**
 * GET ISSUES
 *
 * Fetches issues for a group. Returns raw data for client-side decryption.
 */

import { db } from "@/app/db/client";
import { issues } from "@/app/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { RawIssue } from "@/hooks/encrypted-issues/types";

/**
 * Get all issues for a group
 */
export async function getIssuesForGroup(groupId: string): Promise<RawIssue[]> {
  const result = await db
    .select()
    .from(issues)
    .where(eq(issues.groupId, groupId))
    .orderBy(desc(issues.createdAt));

  return result as RawIssue[];
}

/**
 * Get a single issue by ID
 */
export async function getIssueById(
  issueId: string,
  groupId: string
): Promise<RawIssue | null> {
  const [result] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.id, issueId), eq(issues.groupId, groupId)))
    .limit(1);

  return (result as RawIssue) || null;
}

/**
 * Get issues by status
 */
export async function getIssuesByStatus(
  groupId: string,
  status: string
): Promise<RawIssue[]> {
  const result = await db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.groupId, groupId),
        eq(issues.status, status as typeof issues.status.enumValues[number])
      )
    )
    .orderBy(desc(issues.createdAt));

  return result as RawIssue[];
}

/**
 * Get open/active issues for a group
 */
export async function getActiveIssues(groupId: string): Promise<RawIssue[]> {
  const result = await db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.groupId, groupId),
        // Not completed or deferred
        // Note: This is a simplified filter; you may need to adjust
      )
    )
    .orderBy(desc(issues.priority), desc(issues.createdAt));

  // Filter out completed/deferred in application code for flexibility
  return (result as RawIssue[]).filter(
    (issue) => issue.status !== "completed" && issue.status !== "deferred"
  );
}
