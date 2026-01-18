"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getConversation,
  deleteConversation,
  type ConversationListItem,
  type ConversationDetail,
  type MessageItem,
} from "@/app/actions/conversations";
import { decryptText, importKey, base64ToArrayBuffer } from "@/lib/encryption";

// ============================================
// TYPES
// ============================================

export interface Conversation {
  id: string;
  title: string | null;
  encryptedTitle?: string | null;
  titleIv?: string | null;
  type: string;
  category: string | null;
  severity: string | null;
  isResolved: boolean;
  isEncrypted?: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments: Array<{
    type: string;
    url: string;
    mediaType: string;
  }> | null;
  metadata?: {
    detectedLanguage?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
}

// ============================================
// ENCRYPTION KEY CACHING
// ============================================

// Cache for v1 symmetric encryption key (from users.encryptionKey)
let cachedV1Key: CryptoKey | null = null;

/**
 * Fetch the v1 symmetric encryption key from the server.
 * This key is stored in users.encryptionKey and used for legacy encryption.
 */
async function getV1EncryptionKey(): Promise<CryptoKey | null> {
  if (cachedV1Key) return cachedV1Key;

  try {
    const response = await fetch("/api/encryption/key");
    if (!response.ok) return null;

    const { key: base64Key } = await response.json();
    const keyData = base64ToArrayBuffer(base64Key);
    cachedV1Key = await importKey(keyData);
    return cachedV1Key;
  } catch {
    return null;
  }
}

/**
 * Clear the cached encryption key.
 * Call this on logout or when key rotation occurs.
 */
export function clearEncryptionKeyCache(): void {
  cachedV1Key = null;
}

// ============================================
// DECRYPTION HELPERS
// ============================================

/**
 * Determine if a conversation uses v1 (legacy) encryption.
 *
 * v1 encryption criteria:
 * - Has encrypted title but NO wrappedKey (per-conversation key)
 * - Uses the user's symmetric key directly
 *
 * v2 encryption criteria:
 * - Has a wrappedKey (per-conversation AES key wrapped to user's X25519 public key)
 * - Requires unwrapping the conversation key before decryption
 */
function isV1Encryption(conv: ConversationListItem): boolean {
  // v2 has wrappedKey, v1 does not
  return !conv.encryption.wrappedKey;
}

/**
 * Decrypt a single conversation title.
 *
 * Strategy:
 * 1. If not encrypted or no encrypted title, return plaintext title
 * 2. For v1 encryption: use the v1 symmetric key directly
 * 3. For v2 encryption: skip for now (wrappedKey unwrapping not yet implemented)
 * 4. On decryption failure: fall back to plaintext title or generic message
 */
async function decryptConversationTitle(
  conv: ConversationListItem,
  v1Key: CryptoKey | null
): Promise<string | null> {
  // Case 1: Not encrypted or no encrypted data - return plaintext
  if (!conv.encryption.isEncrypted || !conv.encryptedTitle || !conv.titleIv) {
    return conv.title;
  }

  // Case 2: v2 encryption (has wrappedKey) - not yet implemented
  // For now, fall back to plaintext title if available
  if (!isV1Encryption(conv)) {
    // v2 encryption requires unwrapping the per-conversation key
    // This is not yet implemented on the client side
    // Fall back to plaintext title (which may be "[ENCRYPTED]" marker)
    if (conv.title && conv.title !== "[ENCRYPTED]") {
      return conv.title;
    }
    return "Encrypted Conversation";
  }

  // Case 3: v1 encryption - use symmetric key
  if (!v1Key) {
    // No key available - fall back to plaintext or generic
    if (conv.title && conv.title !== "[ENCRYPTED]") {
      return conv.title;
    }
    return "New Conversation";
  }

  try {
    const decryptedTitle = await decryptText(
      { ciphertext: conv.encryptedTitle, iv: conv.titleIv },
      v1Key
    );
    return decryptedTitle;
  } catch {
    // Decryption failed - key mismatch or corrupted data
    // Fall back to plaintext title if it's meaningful, otherwise generic
    console.warn(
      "[Conversations] Decryption failed for conversation:",
      conv.id,
      "- falling back to plaintext title"
    );

    if (conv.title && conv.title !== "[ENCRYPTED]") {
      return conv.title;
    }
    return "New Conversation";
  }
}

/**
 * Decrypt conversation titles for a list of conversations.
 * Uses batch processing with graceful fallbacks for failures.
 */
async function decryptConversations(
  conversations: ConversationListItem[]
): Promise<Conversation[]> {
  // Fetch v1 key once for all conversations
  const v1Key = await getV1EncryptionKey();

  // Process all conversations, handling errors individually
  return Promise.all(
    conversations.map(async (conv) => {
      const title = await decryptConversationTitle(conv, v1Key);

      return {
        id: conv.id,
        title,
        encryptedTitle: conv.encryptedTitle,
        titleIv: conv.titleIv,
        type: conv.type,
        category: conv.category,
        severity: conv.severity,
        isResolved: conv.isResolved,
        isEncrypted: conv.encryption.isEncrypted,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessageAt: conv.lastMessageAt,
        messageCount: conv.messageCount,
      };
    })
  );
}

// Fetch all conversations for the user
export function useConversations() {
  return useQuery<ConversationsResponse>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const result = await getConversations();

      if ("error" in result) {
        throw new Error(result.error);
      }

      // Decrypt titles client-side
      const decryptedConversations = await decryptConversations(result.conversations);

      return { conversations: decryptedConversations };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Decrypt a single message content.
 * Similar strategy to conversation title decryption.
 */
async function decryptMessageContent(
  message: MessageItem,
  v1Key: CryptoKey | null
): Promise<string> {
  // If not encrypted or no encrypted content, return plaintext
  if (!message.encryption.isEncrypted || !message.encryptedContent || !message.contentIv) {
    return message.content;
  }

  // v1 encryption - use symmetric key
  if (!v1Key) {
    // No key available - return plaintext or marker
    if (message.content && message.content !== "[ENCRYPTED]") {
      return message.content;
    }
    return "[Message unavailable]";
  }

  try {
    const decryptedContent = await decryptText(
      { ciphertext: message.encryptedContent, iv: message.contentIv },
      v1Key
    );
    return decryptedContent;
  } catch {
    // Decryption failed - fall back to plaintext
    console.warn(
      "[Conversations] Message decryption failed for message:",
      message.id,
      "- falling back to plaintext"
    );

    if (message.content && message.content !== "[ENCRYPTED]") {
      return message.content;
    }
    return "[Message unavailable]";
  }
}

/**
 * Decrypt conversation detail title.
 * Similar to list item decryption but for ConversationDetail type.
 */
async function decryptConversationDetailTitle(
  conv: ConversationDetail,
  v1Key: CryptoKey | null
): Promise<string | null> {
  // Not encrypted or no encrypted data - return plaintext
  if (!conv.encryption.isEncrypted || !conv.encryptedTitle || !conv.titleIv) {
    return conv.title;
  }

  // v2 encryption (has wrappedKey) - not yet implemented
  if (conv.encryption.wrappedKey) {
    if (conv.title && conv.title !== "[ENCRYPTED]") {
      return conv.title;
    }
    return "Encrypted Conversation";
  }

  // v1 encryption - use symmetric key
  if (!v1Key) {
    if (conv.title && conv.title !== "[ENCRYPTED]") {
      return conv.title;
    }
    return "New Conversation";
  }

  try {
    const decryptedTitle = await decryptText(
      { ciphertext: conv.encryptedTitle, iv: conv.titleIv },
      v1Key
    );
    return decryptedTitle;
  } catch {
    console.warn(
      "[Conversations] Title decryption failed for conversation:",
      conv.id,
      "- falling back to plaintext"
    );

    if (conv.title && conv.title !== "[ENCRYPTED]") {
      return conv.title;
    }
    return "New Conversation";
  }
}

// Fetch a single conversation with messages
export function useConversation(conversationId: string | null) {
  return useQuery<ConversationDetailResponse>({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error("No conversation ID");

      const result = await getConversation(conversationId);

      if ("error" in result) {
        throw new Error(result.error);
      }

      // Fetch v1 key for decryption
      const v1Key = await getV1EncryptionKey();

      // Decrypt conversation title
      const decryptedTitle = await decryptConversationDetailTitle(
        result.conversation,
        v1Key
      );

      // Transform to expected format
      const conversation: Conversation = {
        id: result.conversation.id,
        title: decryptedTitle,
        encryptedTitle: result.conversation.encryptedTitle,
        titleIv: result.conversation.titleIv,
        type: result.conversation.type,
        category: result.conversation.category,
        severity: result.conversation.severity,
        isResolved: result.conversation.isResolved,
        isEncrypted: result.conversation.encryption.isEncrypted,
        createdAt: result.conversation.createdAt,
        updatedAt: result.conversation.updatedAt,
        lastMessageAt: result.conversation.lastMessageAt,
        messageCount: result.messages.length,
      };

      // Decrypt all messages
      const messages: Message[] = await Promise.all(
        result.messages.map(async (m) => {
          const decryptedContent = await decryptMessageContent(m, v1Key);
          return {
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            content: decryptedContent,
            attachments: m.attachments as Message["attachments"],
            metadata: m.metadata as Message["metadata"],
            createdAt: m.createdAt,
          };
        })
      );

      return { conversation, messages };
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

// Delete a conversation
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const result = await deleteConversation(conversationId);

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onMutate: async (conversationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversations"] });

      // Snapshot previous value
      const previousConversations = queryClient.getQueryData<ConversationsResponse>(["conversations"]);

      // Optimistically remove from list
      queryClient.setQueryData<ConversationsResponse>(["conversations"], (old) => {
        if (!old) return old;
        return {
          conversations: old.conversations.filter((c) => c.id !== conversationId),
        };
      });

      return { previousConversations };
    },
    onError: (err, conversationId, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations"], context.previousConversations);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// Optimistically add a new conversation to the list
export function useOptimisticConversation() {
  const queryClient = useQueryClient();

  const addOptimisticConversation = (conversation: Conversation) => {
    queryClient.setQueryData<ConversationsResponse>(["conversations"], (old) => {
      if (!old) return { conversations: [conversation] };
      return {
        conversations: [conversation, ...old.conversations],
      };
    });
  };

  const updateConversationTitle = (conversationId: string, title: string) => {
    queryClient.setQueryData<ConversationsResponse>(["conversations"], (old) => {
      if (!old) return old;
      return {
        conversations: old.conversations.map((c) =>
          c.id === conversationId ? { ...c, title } : c
        ),
      };
    });
  };

  const invalidateConversations = () => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return {
    addOptimisticConversation,
    updateConversationTitle,
    invalidateConversations,
  };
}
