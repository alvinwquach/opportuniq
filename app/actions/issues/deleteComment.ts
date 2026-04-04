"use server";

/**
 * DELETE COMMENT
 *
 * Deletes a comment from an issue.
 */

import { db } from "@/app/db/client";
import { issueComments } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CommentActionResult } from "./types";

/**
 * Delete comment by ID (only by owner)
 */
export async function deleteComment(
  commentId: string,
  issueId: string,
  userId: string
): Promise<CommentActionResult> {
  try {
    const [deleted] = await db
      .delete(issueComments)
      .where(
        and(
          eq(issueComments.id, commentId),
          eq(issueComments.issueId, issueId),
          eq(issueComments.userId, userId)
        )
      )
      .returning({ id: issueComments.id });

    if (!deleted) {
      return { success: false, error: "Comment not found or not owned by user" };
    }

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, commentId: deleted.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}
