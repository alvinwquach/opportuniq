"use server";

/**
 * UPDATE COMMENT
 *
 * Updates an existing comment on an issue.
 */

import { db } from "@/app/db/client";
import { issueComments } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { EncryptedCommentInput, CommentActionResult } from "./types";

/**
 * Update comment with encrypted data
 */
export async function updateCommentEncrypted(
  commentId: string,
  issueId: string,
  userId: string,
  encryptedData: EncryptedCommentInput
): Promise<CommentActionResult> {
  try {
    const [comment] = await db
      .update(issueComments)
      .set({
        isEncrypted: true,
        keyVersion: encryptedData.keyVersion || 1,
        algorithm: "AES-GCM-256",
        encryptedContent: encryptedData.encryptedContent,
        contentIv: encryptedData.contentIv,
        content: null, // Clear plaintext
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(issueComments.id, commentId),
          eq(issueComments.issueId, issueId),
          eq(issueComments.userId, userId)
        )
      )
      .returning({ id: issueComments.id });

    if (!comment) {
      return { success: false, error: "Comment not found or not owned by user" };
    }

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, commentId: comment.id };
  } catch (error) {
    console.error("[Update Comment] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}

/**
 * Update comment with plaintext data
 */
export async function updateCommentPlaintext(
  commentId: string,
  issueId: string,
  userId: string,
  content: string
): Promise<CommentActionResult> {
  try {
    const [comment] = await db
      .update(issueComments)
      .set({
        isEncrypted: false,
        content,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(issueComments.id, commentId),
          eq(issueComments.issueId, issueId),
          eq(issueComments.userId, userId)
        )
      )
      .returning({ id: issueComments.id });

    if (!comment) {
      return { success: false, error: "Comment not found or not owned by user" };
    }

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, commentId: comment.id };
  } catch (error) {
    console.error("[Update Comment] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}
