"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useConversation } from "@/hooks/useConversations";
import { trackDiagnosisStarted, trackDiagnosisCompleted, trackFollowUpSent } from "@/lib/analytics";
import { ChatMessageList } from "./ChatMessageList";
import { DragDropOverlay } from "./DragDropOverlay";
import { MediaProgressIndicator } from "./MediaProgressIndicator";
import { FollowUpInputBar } from "./FollowUpInputBar";
import { InitialFormView } from "./InitialFormView";
import { ErrorToast } from "./ErrorToast";
import { useEncryptedAttachments } from "@/hooks/useEncryptedAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useChatState, Message } from "@/hooks/useChatState";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useChatStream } from "@/hooks/useChatStream";
import type { DiagnosisRequest } from "@/lib/schemas/diagnosis";
import type { TranscriptionResult } from "@/lib/schemas/voice";
import { isVideoFeatureEnabled } from "@/lib/video/constants";

interface IssueChatProps {
  userId: string;
  userName?: string | null;
  userPostalCode?: string | null;
  groupId?: string | null;
  conversationId?: string | null;
  onConversationCreated?: (conversationId: string) => void;
  onTitleUpdated?: (conversationId: string, title: string) => void;
}

export { IssueChat as DiagnosisChat };

export function IssueChat({
  userId,
  userPostalCode,
  groupId,
  conversationId: initialConversationId,
  onConversationCreated,
  onTitleUpdated,
}: IssueChatProps) {
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

  const { messages, followUpInput, activeConversationId, isStreaming, streamingContent, error, decryptedUrls, detectedLanguage, translatedMessages } = state;

  // Safety: Reset streaming state on mount if stuck
  useEffect(() => {
    if (isStreaming && !activeConversationId && messages.length === 0) {
      console.warn("[IssueChat] Resetting stuck streaming state on mount");
      stopStreaming();
    }
  }, []); // Only run on mount

  // Safety: Reset streaming state if it's stuck for too long (10 seconds)
  useEffect(() => {
    if (isStreaming) {
      const timeout = setTimeout(() => {
        console.warn("[IssueChat] Streaming timeout - resetting stuck state");
        stopStreaming();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isStreaming, stopStreaming]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { state: mediaState, fileInputRef, handleFileSelect, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, clearAll: clearMedia, startEncrypting, finishEncrypting } = useMediaUpload({
    conversationId: activeConversationId,
    maxSizeBytes: 10 * 1024 * 1024,
    maxItems: 1,
    acceptedTypes: isVideoFeatureEnabled() ? ["image", "video"] : ["image"],
  });

  const { processVideoFile, videoProcessingStage, videoProcessingProgress, isProcessingVideo, resetVideoState } = useVideoProcessing();

  const [errorToast, setErrorToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const showError = useCallback((message: string) => setErrorToast({ message, visible: true }), []);
  const hideError = useCallback(() => setErrorToast((prev) => ({ ...prev, visible: false })), []);

  const currentMedia = mediaState.items[0];
  const isVideo = currentMedia?.type === "video";
  const selectedImage = !isVideo ? currentMedia?.preview || null : null;
  const imageFile = !isVideo ? currentMedia?.file || null : null;
  const selectedVideo = isVideo ? currentMedia : null;

  const { uploadEncryptedImage, uploadEncryptedVideo, decryptAttachment, cleanupDecryptedUrl, isUploading: isEncryptedUploading, uploadProgress: encryptedUploadProgress } = useEncryptedAttachments(userId, groupId);

  const { streamResponse, stop } = useChatStream({
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
  });

  const { data: existingConversation } = useConversation(initialConversationId || null);

  useEffect(() => {
    if (existingConversation?.messages && existingConversation.messages.length > 0) {
      type ApiMessage = {
        id: string;
        role: string;
        content: string;
        attachments?: Array<{ type?: string; mediaType?: string; attachmentId?: string }>;
        metadata?: { detectedLanguage?: string };
      };
      const loadedMessages: Message[] = (existingConversation.messages as ApiMessage[]).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: m.attachments?.map((a) => ({
          type: a.type || "image",
          mediaType: a.mediaType || "image/jpeg",
          attachmentId: a.attachmentId,
        })) || null,
      }));
      setMessages(loadedMessages);
      const firstUserMessage = (existingConversation.messages as ApiMessage[]).find((m) => m.role === "user");
      if (firstUserMessage?.metadata?.detectedLanguage) {
        setDetectedLanguage(firstUserMessage.metadata.detectedLanguage);
      }
    }
  }, [existingConversation, setMessages, setDetectedLanguage]);

  const isFirstRender = useRef(true);
  const prevInitialConversationIdRef = useRef(initialConversationId);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const prevId = prevInitialConversationIdRef.current;
    prevInitialConversationIdRef.current = initialConversationId;
    if (initialConversationId === prevId) return;
    if (initialConversationId) {
      if (initialConversationId !== activeConversationId) {
        setConversationId(initialConversationId);
        resetConversation();
      }
    } else if (prevId) {
      setConversationId(null);
      resetConversation();
    }
  }, [initialConversationId, activeConversationId, setConversationId, resetConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    return () => {
      decryptedUrls.forEach((url) => cleanupDecryptedUrl(url));
    };
  }, [decryptedUrls, cleanupDecryptedUrl]);

  const clearMediaWithReset = useCallback(() => {
    clearMedia();
    resetVideoState();
  }, [clearMedia, resetVideoState]);

  const decryptAndCacheImage = useCallback(async (attachmentId: string): Promise<string | null> => {
    if (decryptedUrls.has(attachmentId)) return decryptedUrls.get(attachmentId) || null;
    try {
      const url = await decryptAttachment(attachmentId);
      addDecryptedUrl(attachmentId, url);
      return url;
    } catch (err) {
      console.error("[Chat] Failed to decrypt:", attachmentId, err);
      return null;
    }
  }, [decryptAttachment, decryptedUrls, addDecryptedUrl]);

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const prepareImageAttachment = async (file: File): Promise<DiagnosisRequest["attachments"]> => {
    startEncrypting();
    try {
      const base64Data = await fileToBase64(file);
      const result = await uploadEncryptedImage(file);
      return [{ attachmentId: result.attachmentId, storagePath: result.storagePath, iv: result.iv, mimeType: result.mimeType, originalSize: result.originalSize, base64Data, type: "image" }];
    } finally {
      finishEncrypting();
    }
  };

  // Helper to convert blob to base64
  const blobToBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const prepareVideoAttachment = async (video: NonNullable<typeof selectedVideo>): Promise<DiagnosisRequest["attachments"] | undefined> => {
    console.log("[Chat] ========== VIDEO PREPARATION START ==========");
    const totalStart = performance.now();

    console.time("[Chat] Video processing");
    const videoResult = await processVideoFile(video.file);
    console.timeEnd("[Chat] Video processing");

    if (!videoResult) {
      console.error("[Chat] Video processing returned null");
      return undefined;
    }

    console.log("[Chat] Video processed:", {
      duration: videoResult.duration,
      hasAudio: videoResult.hasAudio,
      frames: videoResult.diagnosticFramesBase64.length,
      compressedSize: `${(videoResult.compressedBlob.size / 1024 / 1024).toFixed(2)}MB`,
      audioSize: videoResult.audioBlob ? `${(videoResult.audioBlob.size / 1024).toFixed(1)}KB` : "none",
    });

    // Transcribe audio if available (for speech - backup context)
    let transcript: string | undefined;
    let transcriptLanguage: string | undefined;
    // Convert audio to base64 for GPT-4o-audio model (can analyze non-speech sounds)
    let audioBase64: string | undefined;

    if (videoResult.hasAudio && videoResult.audioBlob) {
      try {
        // Convert audio blob to base64 for GPT-4o-audio-preview
        console.time("[Chat] Audio to base64");
        audioBase64 = await blobToBase64(videoResult.audioBlob);
        console.timeEnd("[Chat] Audio to base64");
        console.log("[Chat] Audio converted to base64, length:", audioBase64.length);

        // Also try Whisper transcription for speech (as backup context)
        console.time("[Chat] Audio transcription");
        console.log("[Chat] Transcribing video audio...", `${(videoResult.audioBlob.size / 1024).toFixed(1)}KB`);

        const formData = new FormData();
        formData.append("audio", videoResult.audioBlob, "video-audio.webm");

        const response = await fetch("/api/voice/transcribe", {
          method: "POST",
          body: formData,
        });

        console.timeEnd("[Chat] Audio transcription");

        if (response.ok) {
          const transcriptionResult = await response.json();
          transcript = transcriptionResult.text;
          transcriptLanguage = transcriptionResult.language;
          console.log("[Chat] Audio transcribed successfully:", {
            length: transcript?.length,
            language: transcriptLanguage,
            preview: transcript?.substring(0, 100),
          });
        } else {
          const errorText = await response.text();
          console.warn("[Chat] Audio transcription failed:", response.status, errorText);
        }
      } catch (err) {
        console.error("[Chat] Failed to process video audio:", err);
        // Continue without audio - not a fatal error
      }
    } else {
      console.log("[Chat] No audio to process:", { hasAudio: videoResult.hasAudio, hasBlob: !!videoResult.audioBlob });
    }

    startEncrypting();
    try {
      console.time("[Chat] Video encryption & upload");
      const result = await uploadEncryptedVideo(videoResult.compressedBlob, { durationSeconds: videoResult.duration, width: videoResult.width, height: videoResult.height, mimeType: "video/mp4", fileName: video.fileName });
      console.timeEnd("[Chat] Video encryption & upload");

      const totalTime = performance.now() - totalStart;
      console.log("[Chat] ========== VIDEO PREPARATION COMPLETE ==========");
      console.log("[Chat] Total preparation time:", `${totalTime.toFixed(0)}ms`);

      return [{
        attachmentId: result.attachmentId,
        storagePath: result.storagePath,
        iv: result.iv,
        mimeType: "video/mp4",
        originalSize: videoResult.originalSize,
        type: "video",
        durationSeconds: videoResult.duration,
        diagnosticFramesBase64: videoResult.diagnosticFramesBase64,
        hasAudio: videoResult.hasAudio,
        confidenceScore: videoResult.confidence.score,
        transcript,
        transcriptLanguage,
        audioBase64,
      }];
    } finally {
      finishEncrypting();
    }
  };

  const handleDiagnosisSubmit = async (diagnosis: DiagnosisRequest, language?: string) => {
    const hasMedia = !!imageFile || !!selectedVideo;
    trackDiagnosisStarted({ conversationId: null, hasPhoto: !!imageFile, hasVoice: !!language, isNewConversation: true, detectedLanguage: language });
    if (language) setDetectedLanguage(language);

    let attachments: DiagnosisRequest["attachments"] | undefined;
    if (imageFile) {
      try { attachments = await prepareImageAttachment(imageFile); } catch (err) { console.error("[Chat] Failed to encrypt image:", err); }
    } else if (selectedVideo) {
      try {
        attachments = await prepareVideoAttachment(selectedVideo);
      } catch (err) {
        console.error("[Chat] Failed to process video:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to process video";
        showError(
          errorMessage.includes("unavailable")
            ? "Video processing is temporarily unavailable. Please try uploading a photo instead."
            : "There was an error processing your video. Please try again or upload a photo instead."
        );
        clearMediaWithReset();
        return;
      }
    }

    // Determine user message content - empty string if only media (no visible text needed)
    const messageContent = diagnosis.issue.description || "";

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      attachments: attachments?.map((a) => ({ type: a.type || "image", mediaType: a.mimeType, attachmentId: a.attachmentId })),
    };

    const convId = await streamResponse({ type: "structured", diagnosis: { ...diagnosis, property: { ...diagnosis.property, postalCode: userPostalCode || diagnosis.property.postalCode }, attachments, language: language ? { detected: language } : undefined } }, userMessage);
    if (convId) trackDiagnosisCompleted({ conversationId: convId, messageCount: 2, hadPhotos: hasMedia, toolsUsed: [] });
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = followUpInput.trim();
    const hasImage = imageFile && selectedImage;
    const hasVideoMedia = !!selectedVideo;
    if ((!text && !hasImage && !hasVideoMedia) || !activeConversationId) return;

    trackFollowUpSent({ conversationId: activeConversationId, messageLength: text.length, hasPhoto: !!hasImage, hasVoice: !!detectedLanguage, detectedLanguage });
    setFollowUpInput("");

    let attachments: DiagnosisRequest["attachments"] | undefined;
    if (hasImage) {
      try { attachments = await prepareImageAttachment(imageFile); } catch (err) { console.error("[Chat] Failed to encrypt image:", err); }
    } else if (hasVideoMedia) {
      try {
        attachments = await prepareVideoAttachment(selectedVideo);
      } catch (err) {
        console.error("[Chat] Failed to process video:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to process video";
        showError(
          errorMessage.includes("unavailable")
            ? "Video processing is temporarily unavailable. Please try uploading a photo instead."
            : "There was an error processing your video. Please try again or upload a photo instead."
        );
        clearMediaWithReset();
        return;
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || (hasVideoMedia ? "(Video attached)" : "(Photo attached)"),
      attachments: attachments?.map((a) => ({ type: a.type || "image", mediaType: a.mimeType, attachmentId: a.attachmentId })),
    };

    await streamResponse({ type: "followup", conversationId: activeConversationId, message: text || (hasVideoMedia ? "Please analyze this video." : "Please analyze this image."), postalCode: userPostalCode, language: detectedLanguage ? { detected: detectedLanguage } : undefined, attachments }, userMessage);
  };

  const handleFollowUpVoiceTranscription = (result: TranscriptionResult) => {
    setFollowUpInput(followUpInput ? `${followUpInput}\n${result.text}` : result.text);
    if (result.language) setDetectedLanguage(result.language);
  };

  // For the initial form, don't include isStreaming (it shouldn't block new submissions)
  const isInitialFormLoading = mediaState.isEncrypting || isEncryptedUploading || isProcessingVideo;
  // For follow-up input, include isStreaming
  const isLoading = isStreaming || isInitialFormLoading;

  const hasConversation = messages.length > 0 || activeConversationId;
  const hasMedia = !!selectedImage || !!selectedVideo;

  return (
    <div
      ref={dropZoneRef}
      className={cn("flex flex-col h-full bg-[#0c0c0c] relative transition-colors z-20 overflow-hidden", mediaState.isDragging && "bg-[#5eead4]/5")}
      onDragEnter={handleDragEnter}
      onDragLeave={(e) => handleDragLeave(e, dropZoneRef)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragDropOverlay isDragging={mediaState.isDragging} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-dark">
        {!hasConversation && (
          <InitialFormView
            userId={userId}
            userPostalCode={userPostalCode}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onSubmit={handleDiagnosisSubmit}
            isLoading={isInitialFormLoading}
            selectedImage={selectedImage}
            imageFile={imageFile}
            selectedVideo={selectedVideo}
            onMediaRemove={clearMediaWithReset}
            isEncrypting={mediaState.isEncrypting || isEncryptedUploading}
            isProcessingVideo={isProcessingVideo}
            videoProcessingStage={videoProcessingStage}
            videoProcessingProgress={videoProcessingProgress}
            uploadProgress={isEncryptedUploading ? encryptedUploadProgress : mediaState.uploadProgress}
            detectedLanguage={detectedLanguage}
            onLanguageDetected={setDetectedLanguage}
          />
        )}

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

      {hasConversation && (
        <MediaProgressIndicator
          isProcessingVideo={isProcessingVideo}
          videoProcessingStage={videoProcessingStage}
          videoProcessingProgress={videoProcessingProgress}
          isEncrypting={mediaState.isEncrypting}
          isUploading={isEncryptedUploading}
          uploadProgress={isEncryptedUploading ? encryptedUploadProgress : mediaState.uploadProgress}
          selectedImage={selectedImage}
        />
      )}
      {hasConversation && (
        <FollowUpInputBar
          followUpInput={followUpInput}
          onInputChange={setFollowUpInput}
          onSubmit={handleFollowUpSubmit}
          onStop={stop}
          onPhotoSelect={() => fileInputRef.current?.click()}
          onVideoSelect={() => fileInputRef.current?.click()}
          onMediaRemove={clearMediaWithReset}
          onVoiceTranscription={handleFollowUpVoiceTranscription}
          selectedImage={selectedImage}
          selectedVideo={selectedVideo}
          isStreaming={isStreaming}
          isLoading={isLoading}
          isProcessingVideo={isProcessingVideo}
          hasMedia={hasMedia}
          detectedLanguage={detectedLanguage}
          activeConversationId={activeConversationId}
        />
      )}

      <ErrorToast message={errorToast.message} isVisible={errorToast.visible} onClose={hideError} />
    </div>
  );
}
