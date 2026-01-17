"use server";


import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import {
  aiConversations,
  aiMessages,
  conversationKeys,
} from "@/app/db/schema";
import { eq, desc, sql, and, asc, inArray } from "drizzle-orm";
import type {
  ConversationListItem,
  ConversationDetail,
  MessageItem,
} from "./types";

// ============================================
// GET CONVERSATIONS (LIST)
// ============================================

/**
 * Fetch user's conversations with encryption metadata
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Query aiConversations table:
 *    a. Select conversation fields + message count subquery
 *    b. Filter by userId
 *    c. Order by lastMessageAt descending (newest first)
 *    d. Apply pagination (limit, offset)
 * 4. For user-scoped conversations:
 *    a. Collect conversation IDs
 *    b. Fetch wrapped keys from conversationKeys table
 *    c. Build lookup map (conversationId -> wrappedKey)
 * 5. Map results to ConversationListItem format:
 *    a. Include encryption metadata
 *    b. Attach wrapped key if user-scoped
 * 6. Return conversations array
 *
 * NOTE: Message count uses subquery for efficiency
 * NOTE: Wrapped keys only fetched for user-scoped (not group-scoped)
 */
export async function getConversations(
  limit: number = 50,
  offset: number = 0
): Promise<{ conversations: ConversationListItem[] } | { error: string }> {
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

    // Step 3: Query conversations with message count
    const conversations = await db
      .select({
        id: aiConversations.id,
        type: aiConversations.type,
        groupId: aiConversations.groupId,
        encryptionScope: aiConversations.encryptionScope,
        keyVersion: aiConversations.keyVersion,
        algorithm: aiConversations.algorithm,
        isEncrypted: aiConversations.isEncrypted,
        encryptedTitle: aiConversations.encryptedTitle,
        titleIv: aiConversations.titleIv,
        title: aiConversations.title,
        category: aiConversations.category,
        severity: aiConversations.severity,
        isResolved: aiConversations.isResolved,
        createdAt: aiConversations.createdAt,
        updatedAt: aiConversations.updatedAt,
        lastMessageAt: aiConversations.lastMessageAt,
        messageCount: sql<number>`(
          SELECT COUNT(*) FROM ai_messages
          WHERE ai_messages.conversation_id = ai_conversations.id
        )`,
      })
      .from(aiConversations)
      .where(eq(aiConversations.userId, user.id))
      .orderBy(desc(aiConversations.lastMessageAt))
      .limit(limit)
      .offset(offset);

    // Step 4: Fetch wrapped keys for user-scoped conversations
    const userScopedIds = conversations
      .filter((c) => c.encryptionScope === "user")
      .map((c) => c.id);

    let wrappedKeysMap: Record<
      string,
      {
        encryptedConversationKey: string;
        encryptedForPublicKeyFingerprint: string;
        keyVersion: number;
        wrapAlgorithm: string;
      }
    > = {};

    if (userScopedIds.length > 0) {
      const wrappedKeys = await db
        .select({
          conversationId: conversationKeys.conversationId,
          encryptedConversationKey: conversationKeys.encryptedConversationKey,
          encryptedForPublicKeyFingerprint:
            conversationKeys.encryptedForPublicKeyFingerprint,
          keyVersion: conversationKeys.keyVersion,
          wrapAlgorithm: conversationKeys.wrapAlgorithm,
        })
        .from(conversationKeys)
        .where(
          and(
            eq(conversationKeys.userId, user.id),
            inArray(conversationKeys.conversationId, userScopedIds)
          )
        );

      wrappedKeysMap = Object.fromEntries(
        wrappedKeys.map((k) => [k.conversationId, k])
      );
    }

    // Step 5-6: Map and return results
    return {
      conversations: conversations.map((c) => ({
        id: c.id,
        type: c.type,
        groupId: c.groupId,
        encryption: {
          scope: c.encryptionScope,
          keyVersion: c.keyVersion,
          algorithm: c.algorithm,
          isEncrypted: c.isEncrypted,
          ...(c.encryptionScope === "user" && wrappedKeysMap[c.id]
            ? {
                wrappedKey: wrappedKeysMap[c.id].encryptedConversationKey,
                wrappedKeyFingerprint:
                  wrappedKeysMap[c.id].encryptedForPublicKeyFingerprint,
                wrapAlgorithm: wrappedKeysMap[c.id].wrapAlgorithm,
              }
            : {}),
        },
        encryptedTitle: c.encryptedTitle,
        titleIv: c.titleIv,
        title: c.title,
        category: c.category,
        severity: c.severity,
        isResolved: c.isResolved,
        messageCount: c.messageCount,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        lastMessageAt: c.lastMessageAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getConversations] Error:", error);
    return { error: "Internal Server Error" };
  }
}

// ============================================
// GET SINGLE CONVERSATION
// ============================================

/**
 * Fetch a single conversation with messages
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Query conversation by ID:
 *    a. Select all conversation fields
 *    b. Filter by conversationId AND userId (ownership check)
 * 4. If conversation not found, return error
 * 5. If user-scoped, fetch wrapped key:
 *    a. Query conversationKeys by conversationId AND userId
 * 6. Fetch all messages for conversation:
 *    a. Select message fields
 *    b. Filter by conversationId
 *    c. Order by createdAt ascending (oldest first)
 * 7. Map conversation to ConversationDetail format
 * 8. Map messages to MessageItem format
 * 9. Return conversation + messages
 *
 * NOTE: Ownership verified in WHERE clause (userId match)
 * NOTE: Messages ordered chronologically for display
 */
export async function getConversation(
  conversationId: string
): Promise<
  { conversation: ConversationDetail; messages: MessageItem[] } | { error: string }
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

    // Step 3: Fetch conversation (with ownership check)
    const [conversation] = await db
      .select({
        id: aiConversations.id,
        userId: aiConversations.userId,
        groupId: aiConversations.groupId,
        type: aiConversations.type,
        encryptionScope: aiConversations.encryptionScope,
        keyVersion: aiConversations.keyVersion,
        algorithm: aiConversations.algorithm,
        isEncrypted: aiConversations.isEncrypted,
        encryptedTitle: aiConversations.encryptedTitle,
        titleIv: aiConversations.titleIv,
        encryptedSummary: aiConversations.encryptedSummary,
        summaryIv: aiConversations.summaryIv,
        title: aiConversations.title,
        summary: aiConversations.summary,
        isResolved: aiConversations.isResolved,
        category: aiConversations.category,
        severity: aiConversations.severity,
        contractorType: aiConversations.contractorType,
        estimatedCost: aiConversations.estimatedCost,
        totalInputTokens: aiConversations.totalInputTokens,
        totalOutputTokens: aiConversations.totalOutputTokens,
        totalCostUsd: aiConversations.totalCostUsd,
        createdAt: aiConversations.createdAt,
        updatedAt: aiConversations.updatedAt,
        lastMessageAt: aiConversations.lastMessageAt,
      })
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, user.id)
        )
      )
      .limit(1);

    // Step 4: Check if found
    if (!conversation) {
      return { error: "Not found" };
    }

    // Step 5: Fetch wrapped key for user-scoped conversations
    let wrappedKey: {
      encryptedConversationKey: string;
      encryptedForPublicKeyFingerprint: string;
      keyVersion: number;
      wrapAlgorithm: string;
    } | null = null;

    if (conversation.encryptionScope === "user") {
      const [key] = await db
        .select({
          encryptedConversationKey: conversationKeys.encryptedConversationKey,
          encryptedForPublicKeyFingerprint:
            conversationKeys.encryptedForPublicKeyFingerprint,
          keyVersion: conversationKeys.keyVersion,
          wrapAlgorithm: conversationKeys.wrapAlgorithm,
        })
        .from(conversationKeys)
        .where(
          and(
            eq(conversationKeys.conversationId, conversationId),
            eq(conversationKeys.userId, user.id)
          )
        )
        .limit(1);

      wrappedKey = key || null;
    }

    // Step 6: Fetch messages (chronological order)
    const messages = await db
      .select({
        id: aiMessages.id,
        role: aiMessages.role,
        encryptionScope: aiMessages.encryptionScope,
        keyVersion: aiMessages.keyVersion,
        algorithm: aiMessages.algorithm,
        isEncrypted: aiMessages.isEncrypted,
        encryptedContent: aiMessages.encryptedContent,
        contentIv: aiMessages.contentIv,
        content: aiMessages.content,
        attachments: aiMessages.attachments,
        model: aiMessages.model,
        metadata: aiMessages.metadata,
        createdAt: aiMessages.createdAt,
      })
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(asc(aiMessages.createdAt));

    // Step 7-9: Map and return results
    return {
      conversation: {
        id: conversation.id,
        userId: conversation.userId,
        groupId: conversation.groupId,
        type: conversation.type,
        encryption: {
          scope: conversation.encryptionScope,
          keyVersion: conversation.keyVersion,
          algorithm: conversation.algorithm,
          isEncrypted: conversation.isEncrypted,
          ...(wrappedKey
            ? {
                wrappedKey: wrappedKey.encryptedConversationKey,
                wrappedKeyFingerprint:
                  wrappedKey.encryptedForPublicKeyFingerprint,
                wrapAlgorithm: wrappedKey.wrapAlgorithm,
              }
            : {}),
        },
        encryptedTitle: conversation.encryptedTitle,
        titleIv: conversation.titleIv,
        encryptedSummary: conversation.encryptedSummary,
        summaryIv: conversation.summaryIv,
        title: conversation.title,
        summary: conversation.summary,
        isResolved: conversation.isResolved,
        category: conversation.category,
        severity: conversation.severity,
        contractorType: conversation.contractorType,
        estimatedCost: conversation.estimatedCost,
        totalInputTokens: conversation.totalInputTokens,
        totalOutputTokens: conversation.totalOutputTokens,
        totalCostUsd: conversation.totalCostUsd,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        lastMessageAt: conversation.lastMessageAt.toISOString(),
      },
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        encryption: {
          scope: m.encryptionScope,
          keyVersion: m.keyVersion,
          algorithm: m.algorithm,
          isEncrypted: m.isEncrypted,
        },
        encryptedContent: m.encryptedContent,
        contentIv: m.contentIv,
        content: m.content,
        attachments: m.attachments,
        model: m.model,
        metadata: m.metadata,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getConversation] Error:", error);
    return { error: "Internal Server Error" };
  }
}
