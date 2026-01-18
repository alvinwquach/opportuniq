"use server";

/**
 * GET EVIDENCE
 *
 * Fetches evidence for an issue. Returns raw data for client-side decryption.
 */

import { db } from "@/app/db/client";
import { issueEvidence } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import type { RawEvidence } from "@/hooks/encrypted-issues/types";

/**
 * Get all evidence for an issue
 */
export async function getEvidenceForIssue(issueId: string): Promise<RawEvidence[]> {
  const result = await db
    .select()
    .from(issueEvidence)
    .where(eq(issueEvidence.issueId, issueId))
    .orderBy(desc(issueEvidence.createdAt));

  return result as RawEvidence[];
}

/**
 * Get a single evidence item by ID
 */
export async function getEvidenceById(evidenceId: string): Promise<RawEvidence | null> {
  const [result] = await db
    .select()
    .from(issueEvidence)
    .where(eq(issueEvidence.id, evidenceId))
    .limit(1);

  return (result as RawEvidence) || null;
}
