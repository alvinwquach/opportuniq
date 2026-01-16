"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { aiConversations, conversationKeys } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import type { CreateConversationInput } from "./types";

// ============================================
// CREATE CONVERSATION
// ============================================

/**
 * Create a new conversation with encryption key
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Extract input parameters with defaults:
 *    a. type defaults to "diagnosis"
 *    b. wrapAlgorithm defaults to "X25519-HKDF-SHA256-AES256GCM"
 * 4. Determine encryption scope:
 *    a. If groupId provided, scope = "group"
 *    b. Otherwise, scope = "user"
 * 5. Validate required fields for user-scoped:
 *    a. wrappedConversationKey required
 *    b. publicKeyFingerprint required
 * 6. Insert conversation record:
 *    a. Set userId, groupId, type
 *    b. Set encryption metadata (scope, version, algorithm)
 *    c. Set encrypted title if provided
 *    d. Set plaintext title to "[ENCRYPTED]" marker
 * 7. For user-scoped conversations:
 *    a. Insert wrapped key into conversationKeys table
 *    b. Link to conversation and user
 * 8. Return new conversation ID and encryption metadata
 *
 * NOTE: Wrapped key allows user to decrypt conversation on any device
 * NOTE: Group-scoped uses shared group key (not wrapped per-user)
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<
  | {
      conversation: {
        id: string;
        encryption: { scope: string; keyVersion: number; algorithm: string };
        createdAt: string;
      };
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
      type = "diagnosis",
      groupId,
      wrappedConversationKey,
      publicKeyFingerprint,
      wrapAlgorithm = "X25519-HKDF-SHA256-AES256GCM",
      encryptedTitle,
      titleIv,
    } = input;

    // Step 4: Determine encryption scope
    const encryptionScope: "user" | "group" = groupId ? "group" : "user";

    // Step 5: Validate required fields for user-scoped
    if (encryptionScope === "user") {
      if (!wrappedConversationKey || !publicKeyFingerprint) {
        return {
          error: "Missing wrappedConversationKey and publicKeyFingerprint",
        };
      }
    }

    // Step 6: Insert conversation record
    const [conversation] = await db
      .insert(aiConversations)
      .values({
        userId: user.id,
        groupId: groupId || null,
        type,
        encryptionScope,
        keyVersion: 1,
        algorithm: "AES-GCM-256",
        isEncrypted: true,
        encryptedTitle: encryptedTitle || null,
        titleIv: titleIv || null,
        title: encryptedTitle ? "[ENCRYPTED]" : null,
      })
      .returning({
        id: aiConversations.id,
        encryptionScope: aiConversations.encryptionScope,
        keyVersion: aiConversations.keyVersion,
        algorithm: aiConversations.algorithm,
        createdAt: aiConversations.createdAt,
      });

    // Step 7: Store wrapped key for user-scoped conversations
    if (encryptionScope === "user" && wrappedConversationKey) {
      await db.insert(conversationKeys).values({
        conversationId: conversation.id,
        userId: user.id,
        encryptedConversationKey: wrappedConversationKey,
        encryptedForPublicKeyFingerprint: publicKeyFingerprint,
        keyVersion: 1,
        wrapAlgorithm,
      });
    }

    // Step 8: Return result
    return {
      conversation: {
        id: conversation.id,
        encryption: {
          scope: conversation.encryptionScope,
          keyVersion: conversation.keyVersion,
          algorithm: conversation.algorithm,
        },
        createdAt: conversation.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[createConversation] Error:", error);
    return { error: "Internal Server Error" };
  }
}

// ============================================
// DELETE CONVERSATION
// ============================================

/**
 * Delete a conversation
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Delete conversation:
 *    a. Filter by conversationId AND userId (ownership check)
 *    b. Return deleted ID to verify success
 * 4. If no rows deleted, return "Not found" error
 * 5. Return success
 *
 * NOTE: Cascade delete automatically removes:
 *       - Related messages (aiMessages)
 *       - Wrapped keys (conversationKeys)
 * NOTE: Ownership verified in WHERE clause
 */
export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean } | { error: string }> {
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

    // Step 3: Delete conversation (with ownership check)
    const result = await db
      .delete(aiConversations)
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, user.id)
        )
      )
      .returning({ id: aiConversations.id });

    // Step 4: Check if deleted
    if (result.length === 0) {
      return { error: "Not found" };
    }

    // Step 5: Return success
    return { success: true };
  } catch (error) {
    console.error("[deleteConversation] Error:", error);
    return { error: "Internal Server Error" };
  }
}
