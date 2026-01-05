"use client";

import { MessageContent } from "./MessageContent";
import { EncryptedImage } from "./EncryptedImage";
import { EncryptedVideo } from "./EncryptedVideo";
import { AudioPlayButton } from "@/components/voice/AudioPlayButton";
import { TranslateButton } from "@/components/voice/TranslateButton";
import type { Message, TranslationState } from "@/hooks/useChatState";

interface ChatMessageListProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  error: Error | null;
  activeConversationId: string | null;
  decryptedUrls: Map<string, string>;
  detectedLanguage: string | null;
  translatedMessages: Map<string, TranslationState>;
  onDecrypt: (attachmentId: string) => Promise<string | null>;
  onTranslationChange: (messageId: string, text: string, isTranslated: boolean) => void;
}

export function ChatMessageList({
  messages,
  streamingContent,
  isStreaming,
  error,
  activeConversationId,
  decryptedUrls,
  detectedLanguage,
  translatedMessages,
  onDecrypt,
  onTranslationChange,
}: ChatMessageListProps) {
  return (
    <>
      {/* Messages */}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          activeConversationId={activeConversationId}
          decryptedUrls={decryptedUrls}
          detectedLanguage={detectedLanguage}
          translatedMessages={translatedMessages}
          onDecrypt={onDecrypt}
          onTranslationChange={onTranslationChange}
        />
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
      {isStreaming && !streamingContent && <LoadingIndicator />}

      {/* Error */}
      {error && <ErrorMessage />}
    </>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ChatMessageProps {
  message: Message;
  activeConversationId: string | null;
  decryptedUrls: Map<string, string>;
  detectedLanguage: string | null;
  translatedMessages: Map<string, TranslationState>;
  onDecrypt: (attachmentId: string) => Promise<string | null>;
  onTranslationChange: (messageId: string, text: string, isTranslated: boolean) => void;
}

function ChatMessage({
  message,
  activeConversationId,
  decryptedUrls,
  detectedLanguage,
  translatedMessages,
  onDecrypt,
  onTranslationChange,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const translation = translatedMessages.get(message.id);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-[#5eead4] text-black" : "bg-[#1a1a1a] text-white"
        }`}
      >
        {message.attachments?.map((att, index) => {
          const isVideo = att.type === "video" || att.mediaType?.startsWith("video/");

          if (isVideo) {
            return (
              <EncryptedVideo
                key={`${message.id}-${index}`}
                attachmentId={att.attachmentId}
                mimeType={att.mediaType}
                onDecrypt={onDecrypt}
                cachedUrl={att.attachmentId ? decryptedUrls.get(att.attachmentId) : undefined}
              />
            );
          }

          return (
            <EncryptedImage
              key={`${message.id}-${index}`}
              attachmentId={att.attachmentId}
              url={att.url}
              mimeType={att.mediaType}
              alt="Uploaded"
              onDecrypt={onDecrypt}
              cachedUrl={att.attachmentId ? decryptedUrls.get(att.attachmentId) : undefined}
            />
          );
        })}
        {message.role === "assistant" ? (
          <AssistantMessageContent
            message={message}
            activeConversationId={activeConversationId}
            detectedLanguage={detectedLanguage}
            translation={translation}
            onTranslationChange={onTranslationChange}
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        )}
      </div>
    </div>
  );
}

interface AssistantMessageContentProps {
  message: Message;
  activeConversationId: string | null;
  detectedLanguage: string | null;
  translation: TranslationState | undefined;
  onTranslationChange: (messageId: string, text: string, isTranslated: boolean) => void;
}

function AssistantMessageContent({
  message,
  activeConversationId,
  detectedLanguage,
  translation,
  onTranslationChange,
}: AssistantMessageContentProps) {
  const displayContent = translation?.isTranslated ? translation.text : message.content;
  const ttsLanguage = translation?.isTranslated ? "en" : detectedLanguage || "en";

  return (
    <div className="relative">
      <MessageContent content={displayContent} conversationId={activeConversationId} />
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#2a2a2a]">
        <AudioPlayButton
          text={displayContent}
          language={ttsLanguage}
          messageId={message.id}
          conversationId={activeConversationId}
          size="md"
        />
        <span className="text-xs text-[#666]">Listen</span>
        {detectedLanguage && detectedLanguage !== "en" && (
          <>
            <div className="w-px h-4 bg-[#2a2a2a] mx-1" />
            <TranslateButton
              text={message.content}
              originalLanguage={detectedLanguage}
              messageId={message.id}
              conversationId={activeConversationId}
              onTranslationChange={(translatedText, isTranslated) => {
                onTranslationChange(
                  message.id,
                  translatedText || message.content,
                  isTranslated
                );
              }}
              size="md"
            />
            <span className="text-xs text-[#666]">
              {translation?.isTranslated ? "Original" : "Translate"}
            </span>
          </>
        )}
        {translation?.isTranslated && (
          <span className="text-xs text-[#5eead4] ml-auto">Translated to English</span>
        )}
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
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
  );
}

function ErrorMessage() {
  return (
    <div className="flex justify-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
        <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
      </div>
    </div>
  );
}
