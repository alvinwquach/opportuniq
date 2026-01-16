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

// Cache for encryption key to avoid repeated fetches
let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey | null> {
  if (cachedKey) return cachedKey;

  try {
    const response = await fetch("/api/encryption/key");
    if (!response.ok) return null;

    const { key: base64Key } = await response.json();
    const keyData = base64ToArrayBuffer(base64Key);
    cachedKey = await importKey(keyData);
    return cachedKey;
  } catch {
    return null;
  }
}

// Decrypt conversation titles that are encrypted
async function decryptConversations(
  conversations: ConversationListItem[]
): Promise<Conversation[]> {
  const key = await getEncryptionKey();
  if (!key) {
    return conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
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
    }));
  }

  return Promise.all(
    conversations.map(async (conv) => {
      let title = conv.title;

      // If encrypted and has encrypted title, decrypt it
      if (conv.encryption.isEncrypted && conv.encryptedTitle && conv.titleIv) {
        try {
          title = await decryptText(
            { ciphertext: conv.encryptedTitle, iv: conv.titleIv },
            key
          );
        } catch (error) {
          console.error("[Conversations] Failed to decrypt title:", conv.id, error);
          title = "[Unable to decrypt]";
        }
      }

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

      // Transform to expected format
      const conversation: Conversation = {
        id: result.conversation.id,
        title: result.conversation.title,
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
        messageCount: 0,
      };

      const messages: Message[] = result.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        attachments: m.attachments as Message["attachments"],
        metadata: m.metadata as Message["metadata"],
        createdAt: m.createdAt,
      }));

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
