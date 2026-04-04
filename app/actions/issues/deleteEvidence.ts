"use server";

/**
 * DELETE EVIDENCE
 *
 * Deletes evidence from an issue.
 */

import { db } from "@/app/db/client";
import { issueEvidence } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { EvidenceActionResult } from "./types";

/**
 * Delete evidence by ID
 */
export async function deleteEvidence(
  evidenceId: string,
  issueId: string
): Promise<EvidenceActionResult> {
  try {
    const [deleted] = await db
      .delete(issueEvidence)
      .where(
        and(eq(issueEvidence.id, evidenceId), eq(issueEvidence.issueId, issueId))
      )
      .returning({ id: issueEvidence.id });

    if (!deleted) {
      return { success: false, error: "Evidence not found" };
    }

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, evidenceId: deleted.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete evidence",
    };
  }
}
