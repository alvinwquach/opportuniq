"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { IoSend, IoImage, IoClose, IoStop, IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { useConversation } from "@/hooks/useConversations";
import { Progress } from "@/components/ui/progress";
import { trackDiagnosisStarted, trackDiagnosisCompleted, trackFollowUpSent } from "@/lib/analytics";
import { MessageContent } from "./MessageContent";
import { EncryptedImage } from "./EncryptedImage";
import { DiagnosisForm } from "./DiagnosisForm";
import { useEncryptedAttachments } from "@/hooks/useEncryptedAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import type { DiagnosisRequest } from "@/lib/schemas/diagnosis";

interface DiagnosisChatProps {
  userId: string;
  userName?: string | null;
  userPostalCode?: string | null;
  groupId?: string | null;
  conversationId?: string | null;
  onConversationCreated?: (conversationId: string) => void;
  onTitleUpdated?: (conversationId: string, title: string) => void;
}

interface MessageAttachment {
  type: string;
  mediaType: string;
  url?: string;
  attachmentId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: MessageAttachment[] | null;
}

export function DiagnosisChat({
  userId,
  userName,
  userPostalCode,
  groupId,
  conversationId: initialConversationId,
  onConversationCreated,
  onTitleUpdated,
}: DiagnosisChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [decryptedUrls, setDecryptedUrls] = useState<Map<string, string>>(new Map());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Media upload hook
  const {
    state: mediaState,
    fileInputRef,
    handleFileSelect,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    clearAll: clearMedia,
    startEncrypting,
    finishEncrypting,
  } = useMediaUpload({
    conversationId: activeConversationId,
    maxSizeBytes: 10 * 1024 * 1024,
    maxItems: 1,
    acceptedTypes: ["image"],
  });

  const currentImage = mediaState.items[0];
  const selectedImage = currentImage?.preview || null;
  const imageFile = currentImage?.file || null;

  // Encrypted attachments hook
  const {
    uploadEncryptedImage,
    decryptAttachment,
    cleanupDecryptedUrl,
    isUploading: isEncryptedUploading,
    uploadProgress: encryptedUploadProgress,
  } = useEncryptedAttachments(userId, groupId);

  // Load existing conversation
  const { data: existingConversation } = useConversation(initialConversationId || null);

  // Load existing messages
  useEffect(() => {
    if (existingConversation?.messages && existingConversation.messages.length > 0) {
      const loadedMessages: Message[] = existingConversation.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: m.attachments,
      }));
      setMessages(loadedMessages);
    }
  }, [existingConversation]);

  // Reset when conversation changes
  useEffect(() => {
    setActiveConversationId(initialConversationId || null);
    if (!initialConversationId) {
      setMessages([]);
      setStreamingContent("");
      setError(null);
    }
  }, [initialConversationId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Clean up decrypted URLs on unmount
  useEffect(() => {
    return () => {
      decryptedUrls.forEach((url) => cleanupDecryptedUrl(url));
    };
  }, [decryptedUrls, cleanupDecryptedUrl]);

  const decryptAndCacheImage = useCallback(
    async (attachmentId: string): Promise<string | null> => {
      if (decryptedUrls.has(attachmentId)) {
        return decryptedUrls.get(attachmentId) || null;
      }
      try {
        const url = await decryptAttachment(attachmentId);
        setDecryptedUrls((prev) => new Map(prev).set(attachmentId, url));
        return url;
      } catch (err) {
        console.error("[Chat] Failed to decrypt:", attachmentId, err);
        return null;
      }
    },
    [decryptAttachment, decryptedUrls]
  );

  // Stream response from API
  const streamResponse = async (
    body: object,
    userMessage: Message,
    isInitialDiagnosis: boolean = false,
    hadPhotos: boolean = false
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent("");
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const conversationId = response.headers.get("X-Conversation-Id");
      if (conversationId && conversationId !== activeConversationId) {
        setActiveConversationId(conversationId);
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
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const textContent = JSON.parse(line.slice(2));
              if (typeof textContent === "string") {
                fullContent += textContent;
                setStreamingContent(fullContent);
              }
            } catch {
              // Skip malformed
            }
          }
        }
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");

      // Track diagnosis completion (only for initial diagnosis)
      if (isInitialDiagnosis && conversationId) {
        trackDiagnosisCompleted({
          conversationId,
          messageCount: 2, // user + assistant
          hadPhotos,
          toolsUsed: [], // Tool info not available client-side
        });
      }

      // Fetch updated title
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
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStreamingContent("");
        return;
      }
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsStreaming(false);
      clearMedia();
    }
  };

  // Convert file to base64 for AI vision
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle structured diagnosis form submission
  const handleDiagnosisSubmit = async (diagnosis: DiagnosisRequest) => {
    trackDiagnosisStarted({
      conversationId: null,
      hasPhoto: !!imageFile,
      isNewConversation: true,
    });

    let attachments: DiagnosisRequest["attachments"] | undefined;

    // Handle image upload
    if (imageFile && selectedImage) {
      try {
        startEncrypting();

        // Get base64 for AI vision (before encryption)
        const base64Data = await fileToBase64(imageFile);

        // Upload encrypted version for storage
        const uploadResult = await uploadEncryptedImage(imageFile);
        attachments = [
          {
            attachmentId: uploadResult.attachmentId,
            storagePath: uploadResult.storagePath,
            iv: uploadResult.iv,
            mimeType: uploadResult.mimeType,
            originalSize: uploadResult.originalSize,
            // Include base64 for GPT-4o vision analysis
            base64Data,
          },
        ];
      } catch (err) {
        console.error("[Chat] Failed to encrypt image:", err);
      } finally {
        finishEncrypting();
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: diagnosis.issue.description,
      attachments: attachments?.map((a) => ({
        type: "image",
        mediaType: a.mimeType,
        attachmentId: a.attachmentId,
      })),
    };

    await streamResponse(
      {
        type: "structured",
        diagnosis: {
          ...diagnosis,
          // Ensure postal code uses the server-provided value if available
          property: {
            ...diagnosis.property,
            postalCode: userPostalCode || diagnosis.property.postalCode,
          },
          attachments,
        },
      },
      userMessage,
      true, // isInitialDiagnosis
      !!imageFile // hadPhotos
    );
  };

  // Handle follow-up message
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = followUpInput.trim();
    if (!text || !activeConversationId) return;

    // Track follow-up sent
    trackFollowUpSent({
      conversationId: activeConversationId,
      messageLength: text.length,
    });

    setFollowUpInput("");

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    await streamResponse(
      {
        type: "followup",
        conversationId: activeConversationId,
        message: text,
        postalCode: userPostalCode,
      },
      userMessage
    );
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingContent("");
  };

  const isLoading = isStreaming || mediaState.isEncrypting || isEncryptedUploading;
  const hasConversation = messages.length > 0 || activeConversationId;

  return (
    <div
      ref={dropZoneRef}
      className={cn(
        "flex flex-col h-full bg-[#0c0c0c] relative transition-colors z-20 overflow-hidden",
        mediaState.isDragging && "bg-[#5eead4]/5"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={(e) => handleDragLeave(e, dropZoneRef)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {mediaState.isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0c0c0c]/90 border-2 border-dashed border-[#5eead4] rounded-lg m-4">
          <div className="text-center">
            <IoImage className="w-12 h-12 text-[#5eead4] mx-auto mb-2" />
            <p className="text-[#5eead4] font-medium">Drop image here</p>
            <p className="text-[#888888] text-sm">to diagnose the issue</p>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-dark">
        {/* Empty state with structured form */}
        {!hasConversation && (
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#5eead4]/10 flex items-center justify-center mb-4 mx-auto">
                  <IoImage className="w-8 h-8 text-[#5eead4]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Photo Diagnosis</h2>
                <p className="text-[#888888] text-sm">
                  Describe your issue and I'll help identify the problem, assess severity, and
                  recommend next steps.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Structured diagnosis form */}
              <DiagnosisForm
                userId={userId}
                userPostalCode={userPostalCode}
                onSubmit={handleDiagnosisSubmit}
                isSubmitting={isLoading}
                selectedImage={selectedImage}
                imageFile={imageFile}
                onImageSelect={() => fileInputRef.current?.click()}
                onImageRemove={clearMedia}
                isEncrypting={mediaState.isEncrypting || isEncryptedUploading}
                uploadProgress={isEncryptedUploading ? encryptedUploadProgress : mediaState.uploadProgress}
              />
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === "user" ? "bg-[#5eead4] text-black" : "bg-[#1a1a1a] text-white"
              )}
            >
              {/* Attachments */}
              {message.attachments?.map((att, index) => (
                <EncryptedImage
                  key={`${message.id}-${index}`}
                  attachmentId={att.attachmentId}
                  url={att.url}
                  mimeType={att.mediaType}
                  alt="Uploaded"
                  onDecrypt={decryptAndCacheImage}
                  cachedUrl={att.attachmentId ? decryptedUrls.get(att.attachmentId) : undefined}
                />
              ))}

              {/* Content */}
              {message.role === "assistant" ? (
                <MessageContent content={message.content} conversationId={activeConversationId} />
              ) : (
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[#1a1a1a] text-white">
              <MessageContent content={streamingContent} conversationId={activeConversationId} />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-[#5eead4] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#5eead4] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#5eead4] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Upload progress */}
      {(mediaState.isProcessing || mediaState.isEncrypting || isEncryptedUploading) &&
        hasConversation && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                  {selectedImage ? (
                    <Image
                      src={selectedImage}
                      alt="Uploading"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover opacity-50"
                      unoptimized
                    />
                  ) : (
                    <IoImage className="w-6 h-6 text-[#5eead4]" />
                  )}
                </div>
                {(mediaState.uploadProgress === 100 || encryptedUploadProgress === 100) && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#5eead4] rounded-full flex items-center justify-center">
                    <IoCheckmarkCircle className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white truncate flex items-center gap-1.5">
                    <IoLockClosed className="w-3.5 h-3.5 text-[#5eead4]" />
                    Encrypting...
                  </span>
                  <span className="text-xs text-[#888888] ml-2">
                    {isEncryptedUploading ? encryptedUploadProgress : mediaState.uploadProgress}%
                  </span>
                </div>
                <Progress
                  value={isEncryptedUploading ? encryptedUploadProgress : mediaState.uploadProgress}
                  className="h-1.5 bg-[#2a2a2a]"
                  indicatorClassName="bg-[#5eead4]"
                />
              </div>
            </div>
          </div>
        )}

      {/* Follow-up input (only shown after initial diagnosis) */}
      {hasConversation && (
        <form onSubmit={handleFollowUpSubmit} className="p-4 border-t border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <textarea
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                rows={1}
                className="w-full bg-[#1a1a1a] text-white rounded-2xl px-4 py-2.5 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-[#5eead4]/50 placeholder-[#666666] text-sm"
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFollowUpSubmit(e);
                  }
                }}
              />
            </div>
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <IoStop className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!followUpInput.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5eead4] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4fd1c5] transition-colors"
              >
                <IoSend className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
