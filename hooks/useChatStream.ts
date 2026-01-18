"use client";

import { useRef, useCallback } from "react";
import { Message } from "./useChatState";
import { encryptText, type EncryptedText } from "@/lib/encryption";
import { getConversation } from "@/app/actions/conversations/queries";
import { batchEncryptMessages, encryptConversationMetadata } from "@/app/actions/conversations/encryption";

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
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines from buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Debug: Log the first few lines to see the format
            if (fullContent.length === 0) {
              console.log("[Stream] Line received:", trimmedLine.substring(0, 100));
            }

            // Handle UI Message Stream format (SSE): data: {"type":"text-delta","delta":"..."}
            if (trimmedLine.startsWith("data:")) {
              const jsonStr = trimmedLine.slice(5).trim();
              // Skip empty data or [DONE] marker
              if (!jsonStr || jsonStr === "[DONE]") continue;

              try {
                const data = JSON.parse(jsonStr);

                // Handle text delta - check for both 'delta' and 'textDelta' (AI SDK v4)
                if (data.type === "text-delta") {
                  const text = data.delta ?? data.textDelta;
                  if (typeof text === "string") {
                    fullContent += text;
                    updateStreamingContent(fullContent);
                  }
                }
              } catch {
                // Skip malformed JSON (could be other control messages)
              }
            }
            // Handle Data Stream format: 0:"text" for text deltas
            else if (trimmedLine.startsWith("0:")) {
              try {
                const textContent = JSON.parse(trimmedLine.slice(2));
                if (typeof textContent === "string") {
                  fullContent += textContent;
                  updateStreamingContent(fullContent);
                }
              } catch {
                // Skip malformed JSON
              }
            }
            // Skip control messages (f:, e:, d:, event:, etc.)
          }
        }

        // Process any remaining buffer content
        if (buffer.trim()) {
          const trimmedLine = buffer.trim();
          if (trimmedLine.startsWith("data:")) {
            const jsonStr = trimmedLine.slice(5).trim();
            // Skip empty data or [DONE] marker
            if (jsonStr && jsonStr !== "[DONE]") {
              try {
                const data = JSON.parse(jsonStr);
                if (data.type === "text-delta") {
                  const text = data.delta ?? data.textDelta;
                  if (typeof text === "string") {
                    fullContent += text;
                    updateStreamingContent(fullContent);
                  }
                }
              } catch {
                // Skip malformed
              }
            }
          } else if (trimmedLine.startsWith("0:")) {
            try {
              const textContent = JSON.parse(trimmedLine.slice(2));
              if (typeof textContent === "string") {
                fullContent += textContent;
                updateStreamingContent(fullContent);
              }
            } catch {
              // Skip malformed
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
            const convResult = await getConversation(conversationId);
            if ("conversation" in convResult && convResult.conversation?.title && convResult.conversation.title !== "New Diagnosis") {
              onTitleUpdated?.(conversationId, convResult.conversation.title);

              // Also encrypt the title
              if (getEncryptionKey && convResult.conversation.title) {
                encryptTitleInBackground(
                  conversationId,
                  convResult.conversation.title,
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
        // Make sure to stop streaming on any error so the form isn't stuck
        stopStreaming();
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
    const convResult = await getConversation(conversationId);
    if ("error" in convResult) return;

    const messages = convResult.messages as Array<{
      id: string;
      role: string;
      content: string | null;
      encryption: { isEncrypted: boolean };
    }>;

    // Find the messages that need encryption (not already encrypted)
    const messagesToEncrypt = messages.filter(
      (m) => !m.encryption.isEncrypted && m.content && m.content !== "[ENCRYPTED]"
    );

    if (messagesToEncrypt.length === 0) return;

    // Encrypt each message
    const encryptedMessages = await Promise.all(
      messagesToEncrypt.map(async (msg) => {
        const encrypted = await encryptText(msg.content!, key);
        return {
          messageId: msg.id,
          encryptedContent: encrypted.ciphertext,
          contentIv: encrypted.iv,
        };
      })
    );

    // Send to server in batch using server action
    await batchEncryptMessages({
      conversationId,
      messages: encryptedMessages,
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

    // Use server action instead of API fetch
    await encryptConversationMetadata({
      conversationId,
      encryptedTitle: encrypted.ciphertext,
      titleIv: encrypted.iv,
    });

    console.log("[Encryption] Title encrypted");
  } catch (error) {
    console.error("[Encryption] Failed to encrypt title:", error);
    // Non-critical - title remains in plaintext
  }
}
