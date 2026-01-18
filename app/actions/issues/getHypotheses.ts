"use server";

/**
 * GET HYPOTHESES
 *
 * Fetches hypotheses for an issue. Returns raw data for client-side decryption.
 */

import { db } from "@/app/db/client";
import { issueHypotheses } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import type { RawHypothesis } from "@/hooks/encrypted-issues/types";

/**
 * Get all hypotheses for an issue (sorted by confidence)
 */
export async function getHypothesesForIssue(issueId: string): Promise<RawHypothesis[]> {
  const result = await db
    .select()
    .from(issueHypotheses)
    .where(eq(issueHypotheses.issueId, issueId))
    .orderBy(desc(issueHypotheses.confidence));

  return result as RawHypothesis[];
}
