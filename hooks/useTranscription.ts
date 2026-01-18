"use client";

/**
 * useTranscription Hook
 *
 * Client-side hook to transcribe audio using the /api/transcribe endpoint.
 * Wraps the Whisper API proxy with loading/error states.
 */

import { useState, useCallback } from "react";

// ============================================
// TYPES
// ============================================

export interface TranscriptionResult {
  text: string;
  duration: number; // seconds
  language: string;
  cost: number; // USD
}

export interface UseTranscriptionResult {
  transcribe: (audioBlob: Blob, options?: TranscriptionOptions) => Promise<TranscriptionResult>;
  isTranscribing: boolean;
  error: string | null;
  lastResult: TranscriptionResult | null;
  reset: () => void;
}

export interface TranscriptionOptions {
  language?: string; // Language hint (e.g., "en", "es")
  prompt?: string; // Context prompt for better accuracy
}

// ============================================
// HOOK
// ============================================

export function useTranscription(): UseTranscriptionResult {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<TranscriptionResult | null>(null);

  /**
   * Transcribe an audio blob
   */
  const transcribe = useCallback(
    async (audioBlob: Blob, options?: TranscriptionOptions): Promise<TranscriptionResult> => {
      setIsTranscribing(true);
      setError(null);

      try {
        // Create form data
        const formData = new FormData();

        // Convert blob to file with proper extension
        const mimeType = audioBlob.type || "audio/webm";
        const extension = mimeType.split("/")[1]?.split(";")[0] || "webm";
        const file = new File([audioBlob], `recording.${extension}`, { type: mimeType });

        formData.append("audio", file);

        if (options?.language) {
          formData.append("language", options.language);
        }

        if (options?.prompt) {
          formData.append("prompt", options.prompt);
        }

        // Call transcription API
        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Transcription failed: ${response.status}`);
        }

        const result: TranscriptionResult = await response.json();
        setLastResult(result);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Transcription failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsTranscribing(false);
      }
    },
    []
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsTranscribing(false);
    setError(null);
    setLastResult(null);
  }, []);

  return {
    transcribe,
    isTranscribing,
    error,
    lastResult,
    reset,
  };
}
