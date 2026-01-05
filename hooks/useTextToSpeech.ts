/**
 * Hook for text-to-speech using OpenAI TTS API.
 *
 * Synthesizes speech from text and manages audio playback.
 * Supports multiple languages and caches audio for repeated playback.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { TTSVoice } from "@/lib/schemas/voice";

// ============================================
// TYPES
// ============================================

export interface TextToSpeechState {
  isPlaying: boolean;
  isLoading: boolean;
  currentPlayingId: string | null;
  error: string | null;
  volume: number;
  speed: number;
}

interface UseTextToSpeechOptions {
  defaultVoice?: TTSVoice;
  defaultSpeed?: number;
  defaultVolume?: number;
  onStart?: (messageId: string) => void;
  onEnd?: (messageId: string) => void;
  onError?: (error: Error) => void;
}

export interface UseTextToSpeechResult {
  // State
  isPlaying: boolean;
  isLoading: boolean;
  currentPlayingId: string | null;
  error: string | null;
  volume: number;
  speed: number;

  // Actions
  speak: (text: string, language: string, messageId?: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  setSpeed: (speed: number) => void;
  clearError: () => void;

  // Helpers
  isPlayingMessage: (messageId: string) => boolean;
}

// ============================================
// AUDIO CACHE
// ============================================

// Cache synthesized audio by a hash of text + voice + speed
const audioCache = new Map<string, string>(); // key -> object URL
const MAX_CACHE_SIZE = 20;

function getCacheKey(text: string, voice: TTSVoice, speed: number): string {
  // Use first 100 chars + length for reasonable key
  const truncatedText = text.substring(0, 100) + text.length;
  return `${truncatedText}|${voice}|${speed}`;
}

function addToCache(key: string, url: string) {
  // Evict oldest entries if cache is full
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const firstKey = audioCache.keys().next().value;
    if (firstKey) {
      const oldUrl = audioCache.get(firstKey);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      audioCache.delete(firstKey);
    }
  }
  audioCache.set(key, url);
}

// ============================================
// HOOK
// ============================================

export function useTextToSpeech({
  defaultVoice = "nova",
  defaultSpeed = 1.0,
  defaultVolume = 1.0,
  onStart,
  onEnd,
  onError,
}: UseTextToSpeechOptions = {}): UseTextToSpeechResult {
  const [state, setState] = useState<TextToSpeechState>({
    isPlaying: false,
    isLoading: false,
    currentPlayingId: null,
    error: null,
    volume: defaultVolume,
    speed: defaultSpeed,
  });

  // Refs for audio element and abort controller
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentVoiceRef = useRef<TTSVoice>(defaultVoice);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Create audio element if needed
  const getAudioElement = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;
    }
    return audioRef.current;
  }, [state.volume]);

  // Speak text
  const speak = useCallback(
    async (text: string, language: string, messageId?: string) => {
      // Stop any current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const id = messageId || `tts-${Date.now()}`;
      const cacheKey = getCacheKey(text, currentVoiceRef.current, state.speed);

      // Check cache first
      const cachedUrl = audioCache.get(cacheKey);
      if (cachedUrl) {
        const audio = getAudioElement();
        audio.src = cachedUrl;
        audio.playbackRate = state.speed;

        setState((prev) => ({
          ...prev,
          isPlaying: true,
          isLoading: false,
          currentPlayingId: id,
          error: null,
        }));

        audio.onended = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            currentPlayingId: null,
          }));
          onEnd?.(id);
        };

        audio.onerror = () => {
          // Remove from cache if playback fails
          audioCache.delete(cacheKey);
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            currentPlayingId: null,
            error: "Failed to play audio",
          }));
        };

        try {
          await audio.play();
          onStart?.(id);
        } catch (err) {
          console.error("[useTextToSpeech] Playback failed:", err);
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            currentPlayingId: null,
            error: "Failed to play audio",
          }));
        }
        return;
      }

      // Fetch from API
      setState((prev) => ({
        ...prev,
        isLoading: true,
        currentPlayingId: id,
        error: null,
      }));

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/voice/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            language,
            voice: currentVoiceRef.current,
            speed: state.speed,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Synthesis failed: ${response.status}`);
        }

        // Get audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Add to cache
        addToCache(cacheKey, audioUrl);

        // Play audio
        const audio = getAudioElement();
        audio.src = audioUrl;
        audio.playbackRate = state.speed;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPlaying: true,
        }));

        audio.onended = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            currentPlayingId: null,
          }));
          onEnd?.(id);
        };

        audio.onerror = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            currentPlayingId: null,
            error: "Failed to play audio",
          }));
        };

        await audio.play();
        onStart?.(id);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isPlaying: false,
            currentPlayingId: null,
          }));
          return;
        }

        const error = err as Error;
        console.error("[useTextToSpeech] Synthesis failed:", error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPlaying: false,
          currentPlayingId: null,
          error: error.message || "Failed to synthesize speech",
        }));

        onError?.(error);
      }
    },
    [state.speed, state.volume, getAudioElement, onStart, onEnd, onError]
  );

  // Stop playback
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      currentPlayingId: null,
    }));
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  // Resume playback
  const resume = useCallback(async () => {
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
      try {
        await audioRef.current.play();
        setState((prev) => ({ ...prev, isPlaying: true }));
      } catch (err) {
        console.error("[useTextToSpeech] Resume failed:", err);
      }
    }
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  // Set speed
  const setSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.25, Math.min(4, speed));
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedSpeed;
    }
    setState((prev) => ({ ...prev, speed: clampedSpeed }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Check if specific message is playing
  const isPlayingMessage = useCallback(
    (messageId: string) => {
      return state.isPlaying && state.currentPlayingId === messageId;
    },
    [state.isPlaying, state.currentPlayingId]
  );

  return {
    // State
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    currentPlayingId: state.currentPlayingId,
    error: state.error,
    volume: state.volume,
    speed: state.speed,

    // Actions
    speak,
    stop,
    pause,
    resume,
    setVolume,
    setSpeed,
    clearError,

    // Helpers
    isPlayingMessage,
  };
}
