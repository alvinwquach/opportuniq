"use client";

import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { IoSend, IoImage, IoStop, IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { useConversation } from "@/hooks/useConversations";
import { Progress } from "@/components/ui/progress";
import { trackDiagnosisStarted, trackDiagnosisCompleted, trackFollowUpSent } from "@/lib/analytics";
import { DiagnosisForm } from "./DiagnosisForm";
import { ChatMessageList } from "./ChatMessageList";
import { useEncryptedAttachments } from "@/hooks/useEncryptedAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useChatState, Message } from "@/hooks/useChatState";
import { VoiceMicButton } from "@/components/voice/VoiceMicButton";
import type { DiagnosisRequest } from "@/lib/schemas/diagnosis";
import type { TranscriptionResult } from "@/lib/schemas/voice";
import { getLanguageName } from "@/lib/schemas/voice";

interface DiagnosisChatProps {
  userId: string;
  userName?: string | null;
  userPostalCode?: string | null;
  groupId?: string | null;
  conversationId?: string | null;
  onConversationCreated?: (conversationId: string) => void;
  onTitleUpdated?: (conversationId: string, title: string) => void;
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
  const {
    state,
    setMessages,
    addMessage,
    setFollowUpInput,
    setConversationId,
    resetConversation,
    startStreaming,
    updateStreamingContent,
    finishStreaming,
    stopStreaming,
    setError,
    addDecryptedUrl,
    setDetectedLanguage,
    setTranslation,
  } = useChatState(initialConversationId || null);

  const {
    messages,
    followUpInput,
    activeConversationId,
    isStreaming,
    streamingContent,
    error,
    decryptedUrls,
    detectedLanguage,
    translatedMessages,
  } = state;

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

  // Load existing messages and extract language from metadata
  useEffect(() => {
    if (existingConversation?.messages && existingConversation.messages.length > 0) {
      const loadedMessages: Message[] = existingConversation.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: m.attachments,
      }));
      setMessages(loadedMessages);

      // Extract detected language from the first user message's metadata
      const firstUserMessage = existingConversation.messages.find((m) => m.role === "user");
      if (firstUserMessage?.metadata?.detectedLanguage) {
        setDetectedLanguage(firstUserMessage.metadata.detectedLanguage);
      }
    }
  }, [existingConversation, setMessages, setDetectedLanguage]);

  // Track if this is the first render to avoid resetting on initial mount
  const isFirstRender = useRef(true);
  const prevInitialConversationIdRef = useRef(initialConversationId);

  // Sync conversationId when prop changes from parent (e.g., navigating between conversations)
  useEffect(() => {
    // Skip the first render - initial state is already set by the reducer
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const prevId = prevInitialConversationIdRef.current;
    prevInitialConversationIdRef.current = initialConversationId;

    // Check if prop actually changed
    if (initialConversationId === prevId) return;

    // Parent is navigating to a different conversation
    if (initialConversationId) {
      // Loading an existing conversation - reset and let existingConversation useEffect populate
      if (initialConversationId !== activeConversationId) {
        setConversationId(initialConversationId);
        resetConversation();
      }
    } else {
      // Navigating to "new diagnosis" - only reset if we had a previous conversation
      if (prevId) {
        setConversationId(null);
        resetConversation();
      }
    }
  }, [initialConversationId, activeConversationId, setConversationId, resetConversation]);

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
        addDecryptedUrl(attachmentId, url);
        return url;
      } catch (err) {
        console.error("[Chat] Failed to decrypt:", attachmentId, err);
        return null;
      }
    },
    [decryptAttachment, decryptedUrls, addDecryptedUrl]
  );

  // Stream response from API
  const streamResponse = async (
    body: object,
    userMessage: Message,
    isInitialDiagnosis: boolean = false,
    hadPhotos: boolean = false
  ) => {
    console.log("[Chat] Starting stream response");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    addMessage(userMessage);
    startStreaming();

    try {
      console.log("[Chat] Fetching /api/chat");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      console.log("[Chat] Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Chat] Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const conversationId = response.headers.get("X-Conversation-Id");
      if (conversationId && conversationId !== activeConversationId) {
        setConversationId(conversationId);
        onConversationCreated?.(conversationId);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      console.log("[Chat] Starting to read stream");
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[Chat] Stream complete, content length:", fullContent.length);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
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

      // Add assistant message
      console.log("[Chat] Creating assistant message with content:", fullContent.substring(0, 100) + "...");
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullContent,
      };
      finishStreaming(assistantMessage);
      console.log("[Chat] Called finishStreaming");

      // Track diagnosis completion (only for initial diagnosis)
      if (isInitialDiagnosis && conversationId) {
        trackDiagnosisCompleted({
          conversationId,
          messageCount: 2,
          hadPhotos,
          toolsUsed: [],
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
        stopStreaming();
        return;
      }
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      clearMedia();
    }
  };

  // Convert file to base64 for AI vision
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle structured diagnosis form submission
  const handleDiagnosisSubmit = async (diagnosis: DiagnosisRequest, language?: string) => {
    trackDiagnosisStarted({
      conversationId: null,
      hasPhoto: !!imageFile,
      hasVoice: !!language,
      isNewConversation: true,
      detectedLanguage: language,
    });

    if (language) {
      setDetectedLanguage(language);
    }

    let attachments: DiagnosisRequest["attachments"] | undefined;

    if (imageFile && selectedImage) {
      try {
        startEncrypting();
        const base64Data = await fileToBase64(imageFile);
        const uploadResult = await uploadEncryptedImage(imageFile);
        attachments = [
          {
            attachmentId: uploadResult.attachmentId,
            storagePath: uploadResult.storagePath,
            iv: uploadResult.iv,
            mimeType: uploadResult.mimeType,
            originalSize: uploadResult.originalSize,
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
          property: {
            ...diagnosis.property,
            postalCode: userPostalCode || diagnosis.property.postalCode,
          },
          attachments,
          language: language ? { detected: language } : undefined,
        },
      },
      userMessage,
      true,
      !!imageFile
    );
  };

  // Handle follow-up message (with optional image)
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = followUpInput.trim();
    const hasImage = imageFile && selectedImage;

    // Require either text or image
    if ((!text && !hasImage) || !activeConversationId) return;

    trackFollowUpSent({
      conversationId: activeConversationId,
      messageLength: text.length,
      hasPhoto: hasImage,
      hasVoice: !!detectedLanguage,
      detectedLanguage,
    });

    setFollowUpInput("");

    let attachments: DiagnosisRequest["attachments"] | undefined;

    // Handle image upload for follow-up
    if (hasImage) {
      try {
        startEncrypting();
        const base64Data = await fileToBase64(imageFile);
        const uploadResult = await uploadEncryptedImage(imageFile);
        attachments = [
          {
            attachmentId: uploadResult.attachmentId,
            storagePath: uploadResult.storagePath,
            iv: uploadResult.iv,
            mimeType: uploadResult.mimeType,
            originalSize: uploadResult.originalSize,
            base64Data,
          },
        ];
      } catch (err) {
        console.error("[Chat] Failed to encrypt follow-up image:", err);
      } finally {
        finishEncrypting();
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || "(Photo attached)",
      attachments: attachments?.map((a) => ({
        type: "image",
        mediaType: a.mimeType,
        attachmentId: a.attachmentId,
      })),
    };

    await streamResponse(
      {
        type: "followup",
        conversationId: activeConversationId,
        message: text || "Please analyze this image.",
        postalCode: userPostalCode,
        language: detectedLanguage ? { detected: detectedLanguage } : undefined,
        attachments,
      },
      userMessage
    );
  };

  // Handle voice input for follow-up messages
  const handleFollowUpVoiceTranscription = (result: TranscriptionResult) => {
    const newInput = followUpInput ? `${followUpInput}\n${result.text}` : result.text;
    setFollowUpInput(newInput);
    if (result.language) {
      setDetectedLanguage(result.language);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopStreaming();
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

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
                detectedLanguage={detectedLanguage}
                onLanguageDetected={setDetectedLanguage}
              />
            </div>
          </div>
        )}

        {/* Message list */}
        <ChatMessageList
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          error={error}
          activeConversationId={activeConversationId}
          decryptedUrls={decryptedUrls}
          detectedLanguage={detectedLanguage}
          translatedMessages={translatedMessages}
          onDecrypt={decryptAndCacheImage}
          onTranslationChange={setTranslation}
        />

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

      {/* Follow-up input */}
      {hasConversation && (
        <form onSubmit={handleFollowUpSubmit} className="p-4 border-t border-[#1f1f1f]">
          {/* Language indicator */}
          {detectedLanguage && detectedLanguage !== "en" && (
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="text-[#5eead4] bg-[#5eead4]/10 px-2 py-1 rounded-full">
                🌐 Language detected: {getLanguageName(detectedLanguage)}
              </span>
              <span className="text-[#666]">
                Responses will be in {getLanguageName(detectedLanguage)}
              </span>
            </div>
          )}

          {/* Image preview for follow-up */}
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <Image
                src={selectedImage}
                alt="Attached"
                width={80}
                height={80}
                className="rounded-lg object-cover border border-[#2a2a2a]"
                unoptimized
              />
              <button
                type="button"
                onClick={clearMedia}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
              >
                <span className="text-xs">×</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Voice input button */}
            <VoiceMicButton
              onTranscription={handleFollowUpVoiceTranscription}
              disabled={isStreaming}
              size="md"
              conversationId={activeConversationId}
              source="follow_up"
            />

            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming || !!selectedImage}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a1a1a] text-[#888888] flex items-center justify-center hover:bg-[#2a2a2a] hover:text-[#5eead4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach photo"
            >
              <IoImage className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder={selectedImage ? "Add a message (optional)..." : "Ask a follow-up question..."}
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
                onClick={handleStop}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <IoStop className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!followUpInput.trim() && !selectedImage) || isLoading}
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
