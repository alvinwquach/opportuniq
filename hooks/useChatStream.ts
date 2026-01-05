"use client";

import { useRef, useCallback } from "react";
import { Message } from "./useChatState";

interface UseChatStreamOptions {
  activeConversationId: string | null;
  onConversationCreated?: (id: string) => void;
  onTitleUpdated?: (id: string, title: string) => void;
  addMessage: (message: Message) => void;
  startStreaming: () => void;
  updateStreamingContent: (content: string) => void;
  finishStreaming: (message: Message) => void;
  stopStreaming: () => void;
  setError: (error: Error | null) => void;
  setConversationId: (id: string | null) => void;
  clearMedia: () => void;
}

export function useChatStream({
  activeConversationId,
  onConversationCreated,
  onTitleUpdated,
  addMessage,
  startStreaming,
  updateStreamingContent,
  finishStreaming,
  stopStreaming,
  setError,
  setConversationId,
  clearMedia,
}: UseChatStreamOptions) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamResponse = useCallback(
    async (body: object, userMessage: Message) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      addMessage(userMessage);
      startStreaming();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const conversationId = response.headers.get("X-Conversation-Id");
        if (conversationId && conversationId !== activeConversationId) {
          setConversationId(conversationId);
          onConversationCreated?.(conversationId);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("0:")) {
              try {
                const textContent = JSON.parse(line.slice(2));
                if (typeof textContent === "string") {
                  fullContent += textContent;
                  updateStreamingContent(fullContent);
                }
              } catch {
                // Skip malformed
              }
            }
          }
        }

        finishStreaming({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullContent,
        });

        if (conversationId) {
          try {
            const convResponse = await fetch(`/api/conversations/${conversationId}`);
            const convData = await convResponse.json();
            if (convData.conversation?.title && convData.conversation.title !== "New Diagnosis") {
              onTitleUpdated?.(conversationId, convData.conversation.title);
            }
          } catch {
            // Non-critical
          }
        }

        return conversationId;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          stopStreaming();
          return null;
        }
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        clearMedia();
      }
    },
    [
      activeConversationId,
      onConversationCreated,
      onTitleUpdated,
      addMessage,
      startStreaming,
      updateStreamingContent,
      finishStreaming,
      stopStreaming,
      setError,
      setConversationId,
      clearMedia,
    ]
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    stopStreaming();
  }, [stopStreaming]);

  return { streamResponse, stop };
}
