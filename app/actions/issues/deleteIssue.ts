"use server";

/**
 * DELETE ISSUE
 *
 * Deletes an issue and all related data (cascade).
 */

import { db } from "@/app/db/client";
import { issues } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { IssueActionResult } from "./types";

/**
 * Delete an issue by ID
 */
export async function deleteIssue(
  issueId: string,
  groupId: string
): Promise<IssueActionResult> {
  try {
    const [deleted] = await db
      .delete(issues)
      .where(and(eq(issues.id, issueId), eq(issues.groupId, groupId)))
      .returning({ id: issues.id });

    if (!deleted) {
      return { success: false, error: "Issue not found" };
    }

    revalidatePath("/dashboard/issues");
    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, issueId: deleted.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete issue",
    };
  }
}
