"use server";

/**
 * GET COMMENTS
 *
 * Fetches comments for an issue. Returns raw data for client-side decryption.
 */

import { db } from "@/app/db/client";
import { issueComments } from "@/app/db/schema";
import { eq, asc } from "drizzle-orm";
import type { RawComment } from "@/hooks/encrypted-issues/types";

/**
 * Get all comments for an issue (sorted by creation time)
 */
export async function getCommentsForIssue(issueId: string): Promise<RawComment[]> {
  const result = await db
    .select()
    .from(issueComments)
    .where(eq(issueComments.issueId, issueId))
    .orderBy(asc(issueComments.createdAt));

  return result as RawComment[];
}
