"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Conversation {
  id: string;
  title: string | null;
  type: string;
  category: string | null;
  severity: string | null;
  isResolved: boolean;
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

// Fetch all conversations for the user
export function useConversations() {
  return useQuery<ConversationsResponse>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
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
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
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
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
      return res.json();
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
