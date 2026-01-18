"use server";

/**
 * GET ACTIVITY LOGS
 *
 * Fetches activity logs for an issue. Returns raw data for client-side decryption.
 */

import { db } from "@/app/db/client";
import { issueActivityLog } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import type { RawActivityLog } from "@/hooks/encrypted-issues/types";

/**
 * Get all activity logs for an issue (sorted by creation time, newest first)
 */
export async function getActivityLogsForIssue(issueId: string): Promise<RawActivityLog[]> {
  const result = await db
    .select()
    .from(issueActivityLog)
    .where(eq(issueActivityLog.issueId, issueId))
    .orderBy(desc(issueActivityLog.createdAt));

  return result as RawActivityLog[];
}
