"use client";

import { IoImage, IoSend, IoStop, IoVideocam } from "react-icons/io5";
import { VoiceMicButton } from "@/components/voice/VoiceMicButton";
import { VideoPreview } from "@/components/video/VideoPreview";
import { isVideoFeatureEnabled } from "@/lib/video/constants";
import { getLanguageName } from "@/lib/schemas/voice";
import type { TranscriptionResult } from "@/lib/schemas/voice";
import type { MediaItem } from "@/hooks/useMediaUpload";
import Image from "next/image";

interface FollowUpInputBarProps {
  followUpInput: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop: () => void;
  onPhotoSelect: () => void;
  onVideoSelect: () => void;
  onMediaRemove: () => void;
  onVoiceTranscription: (result: TranscriptionResult) => void;
  selectedImage: string | null;
  selectedVideo: MediaItem | null;
  isStreaming: boolean;
  isLoading: boolean;
  isProcessingVideo: boolean;
  hasMedia: boolean;
  detectedLanguage: string | null;
  activeConversationId: string | null;
}

export function FollowUpInputBar({
  followUpInput,
  onInputChange,
  onSubmit,
  onStop,
  onPhotoSelect,
  onVideoSelect,
  onMediaRemove,
  onVoiceTranscription,
  selectedImage,
  selectedVideo,
  isStreaming,
  isLoading,
  isProcessingVideo,
  hasMedia,
  detectedLanguage,
  activeConversationId,
}: FollowUpInputBarProps) {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-gray-200">
      {detectedLanguage && detectedLanguage !== "en" && (
        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className="text-[#5eead4] bg-[#5eead4]/10 px-2 py-1 rounded-full">
            Language detected: {getLanguageName(detectedLanguage)}
          </span>
          <span className="text-gray-400">
            Responses will be in {getLanguageName(detectedLanguage)}
          </span>
        </div>
      )}
      {selectedImage && (
        <div className="mb-2 relative inline-block">
          <Image
            src={selectedImage}
            alt="Attached"
            width={80}
            height={80}
            className="rounded-lg object-cover border border-gray-200"
            unoptimized
          />
          <button
            type="button"
            onClick={onMediaRemove}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
          >
            <span className="text-xs">×</span>
          </button>
        </div>
      )}
      {selectedVideo && (
        <div className="mb-2">
          <VideoPreview
            thumbnailSrc={selectedVideo.thumbnailPreview || selectedVideo.preview}
            duration={selectedVideo.durationSeconds || 0}
            hasAudio={true}
            onRemove={onMediaRemove}
            isProcessing={isProcessingVideo}
            className="w-32"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <VoiceMicButton
          onTranscription={onVoiceTranscription}
          disabled={isStreaming}
          size="md"
          conversationId={activeConversationId}
          source="follow_up"
        />
        <button
          type="button"
          onClick={onPhotoSelect}
          disabled={isStreaming || hasMedia}
          className="shrink-0 w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-[#5eead4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add photo"
        >
          <IoImage className="w-5 h-5" />
        </button>
        {isVideoFeatureEnabled() && (
          <button
            type="button"
            onClick={onVideoSelect}
            disabled={isStreaming || hasMedia}
            className="shrink-0 w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-[#5eead4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add video"
          >
            <IoVideocam className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 relative">
          <textarea
            value={followUpInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={hasMedia ? "Add details (optional)..." : "Ask a follow-up..."}
            rows={1}
            className="w-full bg-white text-gray-900 rounded-2xl px-4 py-2.5 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-[#5eead4]/50 placeholder-gray-400 text-sm"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
        </div>
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <IoStop className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={(!followUpInput.trim() && !hasMedia) || isLoading}
            className="shrink-0 w-10 h-10 rounded-full bg-[#5eead4] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4fd1c5] transition-colors"
          >
            <IoSend className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}
