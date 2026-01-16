"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { aiConversations, aiMessages } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import type {
  EncryptMessageInput,
  EncryptConversationInput,
  BatchEncryptMessagesInput,
} from "./types";

// ============================================
// ENCRYPT SINGLE MESSAGE
// ============================================

/**
 * Encrypt and update a single message
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Extract input parameters with defaults:
 *    a. encryptionScope defaults to "user"
 *    b. keyVersion defaults to 1
 *    c. algorithm defaults to "AES-GCM-256"
 * 4. Verify conversation ownership:
 *    a. Query conversation by ID
 *    b. Check userId matches current user
 * 5. Validate encryption scope (must be "user" or "group")
 * 6. Update message record:
 *    a. Set encryptedContent and contentIv
 *    b. Set isEncrypted = true
 *    c. Set encryption metadata (scope, version, algorithm)
 *    d. Set plaintext content to "[ENCRYPTED]" marker
 * 7. If no rows updated, return "Message not found" error
 * 8. Return success with encryption metadata
 *
 * NOTE: Original plaintext is replaced with "[ENCRYPTED]" marker
 * NOTE: Encrypted content is Base64-encoded ciphertext
 */
export async function encryptMessage(
  input: EncryptMessageInput
): Promise<
  | {
      success: boolean;
      messageId: string;
      encryption: { scope: string; keyVersion: number; algorithm: string };
    }
  | { error: string }
> {
  try {
    // Step 1: Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Step 2: Check authentication
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Step 3: Extract input with defaults
    const {
      conversationId,
      messageId,
      encryptedContent,
      contentIv,
      encryptionScope = "user",
      keyVersion = 1,
      algorithm = "AES-GCM-256",
    } = input;

    // Step 4: Verify conversation ownership
    const [conversation] = await db
      .select({ userId: aiConversations.userId })
      .from(aiConversations)
      .where(eq(aiConversations.id, conversationId));

    if (!conversation || conversation.userId !== user.id) {
      return { error: "Not found" };
    }

    // Step 5: Validate encryption scope
    if (encryptionScope !== "user" && encryptionScope !== "group") {
      return { error: "Invalid encryptionScope" };
    }

    // Step 6: Update message with encrypted content
    const result = await db
      .update(aiMessages)
      .set({
        encryptedContent,
        contentIv,
        isEncrypted: true,
        encryptionScope,
        keyVersion,
        algorithm,
        content: "[ENCRYPTED]",
      })
      .where(
        and(
          eq(aiMessages.id, messageId),
          eq(aiMessages.conversationId, conversationId)
        )
      )
      .returning({ id: aiMessages.id });

    // Step 7: Check if updated
    if (result.length === 0) {
      return { error: "Message not found" };
    }

    // Step 8: Return success
    return {
      success: true,
      messageId: result[0].id,
      encryption: { scope: encryptionScope, keyVersion, algorithm },
    };
  } catch (error) {
    console.error("[encryptMessage] Error:", error);
    return { error: "Internal Server Error" };
  }
}

// ============================================
// ENCRYPT CONVERSATION METADATA
// ============================================

/**
 * Encrypt conversation title and summary
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Extract input parameters with defaults
 * 4. Validate encryption scope (must be "user" or "group")
 * 5. Build update object:
 *    a. Set isEncrypted = true
 *    b. Set encryption metadata (scope, version, algorithm)
 *    c. Set updatedAt timestamp
 *    d. If encryptedTitle provided:
 *       - Set encryptedTitle and titleIv
 *       - Set title to "[ENCRYPTED]" marker
 *    e. If encryptedSummary provided:
 *       - Set encryptedSummary and summaryIv
 *       - Set summary to "[ENCRYPTED]" marker
 * 6. Update conversation (with ownership check)
 * 7. If no rows updated, return "Not found" error
 * 8. Return success with encryption metadata
 *
 * NOTE: Only updates fields that are provided (partial update)
 * NOTE: Ownership verified in WHERE clause
 */
export async function encryptConversationMetadata(
  input: EncryptConversationInput
): Promise<
  | {
      success: boolean;
      conversationId: string;
      encryption: { scope: string; keyVersion: number; algorithm: string };
    }
  | { error: string }
> {
  try {
    // Step 1: Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Step 2: Check authentication
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Step 3: Extract input with defaults
    const {
      conversationId,
      encryptedTitle,
      titleIv,
      encryptedSummary,
      summaryIv,
      encryptionScope = "user",
      keyVersion = 1,
      algorithm = "AES-GCM-256",
    } = input;

    // Step 4: Validate encryption scope
    if (encryptionScope !== "user" && encryptionScope !== "group") {
      return { error: "Invalid encryptionScope" };
    }

    // Step 5: Build update object
    const updateData: Record<string, unknown> = {
      isEncrypted: true,
      encryptionScope,
      keyVersion,
      algorithm,
      updatedAt: new Date(),
    };

    // Add title if provided
    if (encryptedTitle && titleIv) {
      updateData.encryptedTitle = encryptedTitle;
      updateData.titleIv = titleIv;
      updateData.title = "[ENCRYPTED]";
    }

    // Add summary if provided
    if (encryptedSummary && summaryIv) {
      updateData.encryptedSummary = encryptedSummary;
      updateData.summaryIv = summaryIv;
      updateData.summary = "[ENCRYPTED]";
    }

    // Step 6: Update conversation (with ownership check)
    const result = await db
      .update(aiConversations)
      .set(updateData)
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, user.id)
        )
      )
      .returning({ id: aiConversations.id });

    // Step 7: Check if updated
    if (result.length === 0) {
      return { error: "Conversation not found" };
    }

    // Step 8: Return success
    return {
      success: true,
      conversationId: result[0].id,
      encryption: { scope: encryptionScope, keyVersion, algorithm },
    };
  } catch (error) {
    console.error("[encryptConversationMetadata] Error:", error);
    return { error: "Internal Server Error" };
  }
}

// ============================================
// BATCH ENCRYPT MESSAGES
// ============================================

/**
 * Batch encrypt multiple messages at once
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Extract input parameters with defaults
 * 4. Verify conversation ownership:
 *    a. Query conversation by ID
 *    b. Check userId matches current user
 * 5. Validate encryption scope (must be "user" or "group")
 * 6. For each message in array (parallel):
 *    a. Update message with encrypted content
 *    b. Track success/failure
 * 7. Count successful encryptions
 * 8. Return success count and total
 *
 * NOTE: Uses Promise.all for parallel updates (faster)
 * NOTE: Partial success possible (some messages may fail)
 * NOTE: All messages use same encryption scope/version
 */
export async function batchEncryptMessages(
  input: BatchEncryptMessagesInput
): Promise<
  | {
      success: boolean;
      encrypted: number;
      total: number;
      encryption: { scope: string; keyVersion: number; algorithm: string };
    }
  | { error: string }
> {
  try {
    // Step 1: Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Step 2: Check authentication
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Step 3: Extract input with defaults
    const {
      conversationId,
      messages,
      encryptionScope = "user",
      keyVersion = 1,
      algorithm = "AES-GCM-256",
    } = input;

    // Step 4: Verify conversation ownership
    const [conversation] = await db
      .select({ userId: aiConversations.userId })
      .from(aiConversations)
      .where(eq(aiConversations.id, conversationId));

    if (!conversation || conversation.userId !== user.id) {
      return { error: "Not found" };
    }

    // Step 5: Validate encryption scope
    if (encryptionScope !== "user" && encryptionScope !== "group") {
      return { error: "Invalid encryptionScope" };
    }

    // Step 6: Update all messages in parallel
    const results = await Promise.all(
      messages.map(async (msg) => {
        const result = await db
          .update(aiMessages)
          .set({
            encryptedContent: msg.encryptedContent,
            contentIv: msg.contentIv,
            isEncrypted: true,
            encryptionScope,
            keyVersion,
            algorithm,
            content: "[ENCRYPTED]",
          })
          .where(
            and(
              eq(aiMessages.id, msg.messageId),
              eq(aiMessages.conversationId, conversationId)
            )
          )
          .returning({ id: aiMessages.id });

        return result[0]?.id || null;
      })
    );

    // Step 7: Count successes
    const successCount = results.filter(Boolean).length;

    // Step 8: Return results
    return {
      success: true,
      encrypted: successCount,
      total: messages.length,
      encryption: { scope: encryptionScope, keyVersion, algorithm },
    };
  } catch (error) {
    console.error("[batchEncryptMessages] Error:", error);
    return { error: "Internal Server Error" };
  }
}
