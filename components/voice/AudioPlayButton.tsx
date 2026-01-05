"use client";

import { useCallback } from "react";
import { IoPlay, IoPause, IoVolumeHigh } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
  trackTTSPlaybackStarted,
  trackTTSPlaybackStopped,
} from "@/lib/analytics";

interface AudioPlayButtonProps {
  text: string;
  language: string;
  messageId: string;
  conversationId?: string | null;
  className?: string;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
};

export function AudioPlayButton({
  text,
  language,
  messageId,
  conversationId,
  className,
  size = "sm",
}: AudioPlayButtonProps) {
  const {
    isPlaying,
    isLoading,
    currentPlayingId,
    error,
    speak,
    stop,
    pause,
    resume,
    isPlayingMessage,
  } = useTextToSpeech();

  const isThisMessagePlaying = isPlayingMessage(messageId);
  const isThisMessageLoading = isLoading && currentPlayingId === messageId;

  const handleClick = useCallback(async () => {
    if (isThisMessageLoading) {
      // Loading - can't do anything
      return;
    }

    if (isThisMessagePlaying) {
      // Currently playing this message - pause it
      trackTTSPlaybackStopped({
        conversationId,
        messageId,
      });
      pause();
    } else if (isPlaying) {
      // Playing a different message - stop and play this one
      stop();
      trackTTSPlaybackStarted({
        conversationId,
        messageId,
        language,
        textLength: text.length,
      });
      await speak(text, language, messageId);
    } else {
      // Not playing anything - start playing this message
      trackTTSPlaybackStarted({
        conversationId,
        messageId,
        language,
        textLength: text.length,
      });
      await speak(text, language, messageId);
    }
  }, [
    isThisMessageLoading,
    isThisMessagePlaying,
    isPlaying,
    pause,
    stop,
    speak,
    text,
    language,
    messageId,
    conversationId,
  ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isThisMessageLoading}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200",
        sizeClasses[size],
        // Base state
        !isThisMessagePlaying &&
          !isThisMessageLoading &&
          "bg-[#2a2a2a]/80 text-[#888] hover:text-[#5eead4] hover:bg-[#3a3a3a]",
        // Playing state
        isThisMessagePlaying && "bg-[#5eead4]/20 text-[#5eead4]",
        // Loading state
        isThisMessageLoading && "bg-[#2a2a2a]/80 text-[#5eead4] cursor-wait",
        // Error state
        error && "bg-red-500/20 text-red-400",
        className
      )}
      title={
        isThisMessageLoading
          ? "Loading..."
          : isThisMessagePlaying
            ? "Pause"
            : "Play audio"
      }
      aria-label={
        isThisMessageLoading
          ? "Loading audio"
          : isThisMessagePlaying
            ? "Pause audio"
            : "Play audio"
      }
    >
      {isThisMessageLoading ? (
        <ImSpinner8 className={cn(iconSizes[size], "animate-spin")} />
      ) : isThisMessagePlaying ? (
        <IoPause className={iconSizes[size]} />
      ) : (
        <IoVolumeHigh className={iconSizes[size]} />
      )}
    </button>
  );
}

// Wrapper component that provides the TTS context for message content
interface AudioPlayButtonWrapperProps {
  text: string;
  language: string;
  messageId: string;
}

export function AudioPlayButtonWrapper({
  text,
  language,
  messageId,
}: AudioPlayButtonWrapperProps) {
  // Only show if there's meaningful text to speak
  if (!text || text.trim().length < 10) {
    return null;
  }

  return (
    <AudioPlayButton
      text={text}
      language={language}
      messageId={messageId}
      size="sm"
    />
  );
}
