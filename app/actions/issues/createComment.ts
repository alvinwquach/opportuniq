"use server";

/**
 * CREATE COMMENT
 *
 * Creates a new comment on an issue.
 */

import { db } from "@/app/db/client";
import { issueComments } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type { EncryptedCommentInput, CommentActionResult } from "./types";

/**
 * Create comment with encrypted data
 */
export async function createCommentEncrypted(
  issueId: string,
  userId: string,
  encryptedData: EncryptedCommentInput
): Promise<CommentActionResult> {
  try {
    const [comment] = await db
      .insert(issueComments)
      .values({
        issueId,
        userId,
        isEncrypted: true,
        keyVersion: encryptedData.keyVersion || 1,
        algorithm: "AES-GCM-256",
        encryptedContent: encryptedData.encryptedContent,
        contentIv: encryptedData.contentIv,
      })
      .returning({ id: issueComments.id });

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, commentId: comment.id };
  } catch (error) {
    console.error("[Create Comment] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

/**
 * Create comment with plaintext data (no encryption)
 */
export async function createCommentPlaintext(
  issueId: string,
  userId: string,
  content: string
): Promise<CommentActionResult> {
  try {
    const [comment] = await db
      .insert(issueComments)
      .values({
        issueId,
        userId,
        isEncrypted: false,
        content,
      })
      .returning({ id: issueComments.id });

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, commentId: comment.id };
  } catch (error) {
    console.error("[Create Comment] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}
