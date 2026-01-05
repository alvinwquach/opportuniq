"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { IoMic, IoMicOff, IoStop } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { cn } from "@/lib/utils";
import { useVoiceInput, type PermissionStatus } from "@/hooks/useVoiceInput";
import type { TranscriptionResult } from "@/lib/schemas/voice";
import {
  trackVoiceRecordingStarted,
  trackVoiceRecordingCompleted,
  trackVoiceRecordingCancelled,
  trackVoiceRecordingFailed,
} from "@/lib/analytics";

interface VoiceMicButtonProps {
  onTranscription: (result: TranscriptionResult) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  maxDuration?: number;
  conversationId?: string | null;
  source?: "initial_form" | "follow_up";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function VoiceMicButton({
  onTranscription,
  onError,
  disabled = false,
  size = "md",
  className,
  maxDuration,
  conversationId,
  source = "follow_up",
}: VoiceMicButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const recordingStartTime = useRef<number>(0);

  // Wrap onTranscription to add analytics
  const handleTranscription = useCallback((result: TranscriptionResult) => {
    const durationSeconds = (Date.now() - recordingStartTime.current) / 1000;
    trackVoiceRecordingCompleted({
      conversationId,
      source,
      durationSeconds,
      detectedLanguage: result.language,
      transcriptionLength: result.text.length,
    });
    onTranscription(result);
  }, [conversationId, source, onTranscription]);

  // Wrap onError to add analytics
  const handleError = useCallback((err: Error) => {
    trackVoiceRecordingFailed({
      conversationId,
      source,
      errorType: err.message.includes("permission") ? "permission_denied"
        : err.message.includes("transcription") ? "transcription_failed"
        : "unknown",
      errorMessage: err.message,
    });
    onError?.(err);
  }, [conversationId, source, onError]);

  const {
    isRecording,
    isTranscribing,
    error,
    permissionStatus,
    audioLevel,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
    clearError,
  } = useVoiceInput({
    onTranscription: handleTranscription,
    onError: handleError,
    maxDuration,
  });

  // Handle click
  const handleClick = useCallback(async () => {
    if (disabled) return;

    if (isRecording) {
      // Stop and transcribe
      await stopRecording();
    } else if (isTranscribing) {
      // Cancel transcription (not supported, just show loading)
      return;
    } else {
      // Check permission first
      if (permissionStatus === "denied") {
        setShowTooltip(true);
        trackVoiceRecordingFailed({
          conversationId,
          source,
          errorType: "permission_denied",
        });
        return;
      }

      // Track recording started
      recordingStartTime.current = Date.now();
      trackVoiceRecordingStarted({
        conversationId,
        source,
      });

      // Start recording
      await startRecording();
    }
  }, [disabled, isRecording, isTranscribing, permissionStatus, startRecording, stopRecording, conversationId, source]);

  // Handle cancel (long press or escape)
  const handleCancel = useCallback(() => {
    if (isRecording) {
      const durationSeconds = (Date.now() - recordingStartTime.current) / 1000;
      trackVoiceRecordingCancelled({
        conversationId,
        source,
        durationSeconds,
      });
      cancelRecording();
    }
  }, [isRecording, cancelRecording, conversationId, source]);

  // Clear error after display
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(clearError, 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, clearError]);

  // Hide tooltip after delay
  useEffect(() => {
    if (showTooltip) {
      const timeout = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showTooltip]);

  // Handle keyboard cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRecording) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, handleCancel]);

  // Format duration for display
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Determine button state
  const isLoading = isTranscribing;
  const isActive = isRecording;
  const isDenied = permissionStatus === "denied";
  const isDisabled = disabled || isLoading;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all duration-200",
          sizeClasses[size],
          // Base state
          !isActive &&
            !isLoading &&
            !isDenied &&
            "bg-[#1a1a1a] text-[#888] hover:text-[#5eead4] hover:bg-[#2a2a2a] border border-[#2a2a2a]",
          // Recording state
          isActive && "bg-red-500 text-white border border-red-500 animate-pulse",
          // Loading state
          isLoading && "bg-[#1a1a1a] text-[#5eead4] border border-[#5eead4]/50 cursor-wait",
          // Denied state
          isDenied && "bg-[#1a1a1a] text-red-400 border border-red-400/50 cursor-not-allowed",
          // Disabled state
          isDisabled && !isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        title={
          isDenied
            ? "Microphone access denied"
            : isRecording
              ? "Click to stop recording"
              : isTranscribing
                ? "Processing..."
                : "Click to record"
        }
        aria-label={
          isDenied
            ? "Microphone access denied"
            : isRecording
              ? "Stop recording"
              : isTranscribing
                ? "Processing speech"
                : "Start voice recording"
        }
      >
        {/* Audio level indicator ring */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-full border-2 border-white/50 transition-transform"
            style={{
              transform: `scale(${1 + audioLevel * 0.3})`,
              opacity: 0.5 + audioLevel * 0.5,
            }}
          />
        )}

        {/* Icon */}
        {isLoading ? (
          <ImSpinner8 className={cn(iconSizes[size], "animate-spin")} />
        ) : isActive ? (
          <IoStop className={iconSizes[size]} />
        ) : isDenied ? (
          <IoMicOff className={iconSizes[size]} />
        ) : (
          <IoMic className={iconSizes[size]} />
        )}
      </button>

      {/* Recording duration display */}
      {isActive && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
          {formatDuration(recordingDuration)}
        </div>
      )}

      {/* Permission denied tooltip */}
      {showTooltip && isDenied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-[#1a1a1a] border border-red-400/50 rounded-lg px-3 py-2 text-xs text-red-400 whitespace-nowrap shadow-lg">
            Enable microphone in browser settings
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1a1a1a]" />
          </div>
        </div>
      )}

      {/* Error tooltip */}
      {error && !showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-[#1a1a1a] border border-red-400/50 rounded-lg px-3 py-2 text-xs text-red-400 max-w-[200px] text-center shadow-lg">
            {error}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1a1a1a]" />
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isLoading && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-[#1a1a1a] border border-[#5eead4]/50 rounded-lg px-3 py-2 text-xs text-[#5eead4] whitespace-nowrap shadow-lg">
            Processing...
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1a1a1a]" />
          </div>
        </div>
      )}
    </div>
  );
}
