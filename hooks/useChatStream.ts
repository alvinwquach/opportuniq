"use client";

import { useRef, useCallback } from "react";
import { Message } from "./useChatState";
import { encryptText, type EncryptedText } from "@/lib/encryption";

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
  // Encryption support
  getEncryptionKey?: () => Promise<CryptoKey>;
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
  getEncryptionKey,
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

        const assistantMessageId = `assistant-${Date.now()}`;
        finishStreaming({
          id: assistantMessageId,
          role: "assistant",
          content: fullContent,
        });

        // Encrypt messages in the background (non-blocking)
        if (conversationId && getEncryptionKey) {
          encryptMessagesInBackground(
            conversationId,
            userMessage,
            { id: assistantMessageId, content: fullContent },
            getEncryptionKey
          );
        }

        if (conversationId) {
          try {
            const convResponse = await fetch(`/api/conversations/${conversationId}`);
            const convData = await convResponse.json();
            if (convData.conversation?.title && convData.conversation.title !== "New Diagnosis") {
              onTitleUpdated?.(conversationId, convData.conversation.title);

              // Also encrypt the title
              if (getEncryptionKey && convData.conversation.title) {
                encryptTitleInBackground(
                  conversationId,
                  convData.conversation.title,
                  getEncryptionKey
                );
              }
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

// ============================================
// BACKGROUND ENCRYPTION HELPERS
// ============================================

/**
 * Encrypt user and assistant messages in the background
 * This runs after the streaming completes and doesn't block the UI
 */
async function encryptMessagesInBackground(
  conversationId: string,
  userMessage: Message,
  assistantMessage: { id: string; content: string },
  getEncryptionKey: () => Promise<CryptoKey>
) {
  try {
    const key = await getEncryptionKey();

    // Fetch the actual message IDs from the server (our local IDs are temporary)
    const convResponse = await fetch(`/api/conversations/${conversationId}`);
    if (!convResponse.ok) return;

    const convData = await convResponse.json();
    const messages = convData.messages as Array<{
      id: string;
      role: string;
      content: string;
      isEncrypted: boolean;
    }>;

    // Find the messages that need encryption (not already encrypted)
    const messagesToEncrypt = messages.filter(
      (m) => !m.isEncrypted && m.content !== "[ENCRYPTED]"
    );

    if (messagesToEncrypt.length === 0) return;

    // Encrypt each message
    const encryptedMessages = await Promise.all(
      messagesToEncrypt.map(async (msg) => {
        const encrypted = await encryptText(msg.content, key);
        return {
          messageId: msg.id,
          encryptedContent: encrypted.ciphertext,
          contentIv: encrypted.iv,
        };
      })
    );

    // Send to server in batch
    await fetch(`/api/conversations/${conversationId}/encrypt`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: encryptedMessages }),
    });

    console.log("[Encryption] Messages encrypted:", encryptedMessages.length);
  } catch (error) {
    console.error("[Encryption] Failed to encrypt messages:", error);
    // Non-critical - messages remain in plaintext
  }
}

/**
 * Encrypt conversation title in the background
 */
async function encryptTitleInBackground(
  conversationId: string,
  title: string,
  getEncryptionKey: () => Promise<CryptoKey>
) {
  try {
    const key = await getEncryptionKey();
    const encrypted = await encryptText(title, key);

    await fetch(`/api/conversations/${conversationId}/encrypt`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encryptedTitle: encrypted.ciphertext,
        titleIv: encrypted.iv,
      }),
    });

    console.log("[Encryption] Title encrypted");
  } catch (error) {
    console.error("[Encryption] Failed to encrypt title:", error);
    // Non-critical - title remains in plaintext
  }
}
