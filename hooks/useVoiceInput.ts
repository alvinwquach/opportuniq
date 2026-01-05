/**
 * Hook for voice input with microphone recording and transcription.
 *
 * Uses MediaRecorder API for recording and OpenAI Whisper for transcription.
 * Automatically detects language from speech.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  getBestAudioFormat,
  MAX_RECORDING_DURATION,
  type TranscriptionResult,
} from "@/lib/schemas/voice";

// ============================================
// TYPES
// ============================================

export type PermissionStatus = "granted" | "denied" | "prompt" | "unknown";

export interface VoiceInputState {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  permissionStatus: PermissionStatus;
  audioLevel: number;
  recordingDuration: number; // in milliseconds
}

interface UseVoiceInputOptions {
  onTranscription?: (result: TranscriptionResult) => void;
  onError?: (error: Error) => void;
  maxDuration?: number; // in milliseconds
}

export interface UseVoiceInputResult {
  // State
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  permissionStatus: PermissionStatus;
  audioLevel: number;
  recordingDuration: number;

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<TranscriptionResult | null>;
  cancelRecording: () => void;
  requestPermission: () => Promise<boolean>;
  clearError: () => void;
}

// ============================================
// HOOK
// ============================================

export function useVoiceInput({
  onTranscription,
  onError,
  maxDuration = MAX_RECORDING_DURATION,
}: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    isTranscribing: false,
    error: null,
    permissionStatus: "unknown",
    audioLevel: 0,
    recordingDuration: 0,
  });

  // Refs for MediaRecorder and audio processing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check microphone permission status
  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      if (!navigator.permissions) {
        return "unknown";
      }
      const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
      return result.state as PermissionStatus;
    } catch {
      return "unknown";
    }
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track) => track.stop());
      setState((prev) => ({ ...prev, permissionStatus: "granted", error: null }));
      return true;
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setState((prev) => ({
          ...prev,
          permissionStatus: "denied",
          error: "Microphone access denied. Please enable it in your browser settings.",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          permissionStatus: "unknown",
          error: "Failed to access microphone. Please check your device.",
        }));
      }
      return false;
    }
  }, []);

  // Update permission status on mount
  useEffect(() => {
    checkPermission().then((status) => {
      setState((prev) => ({ ...prev, permissionStatus: status }));
    });
  }, [checkPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (maxDurationTimeoutRef.current) {
        clearTimeout(maxDurationTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update audio level visualization
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

    setState((prev) => ({ ...prev, audioLevel: normalizedLevel }));

    if (state.isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state.isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    // Reset state
    setState((prev) => ({
      ...prev,
      isRecording: false,
      isTranscribing: false,
      error: null,
      audioLevel: 0,
      recordingDuration: 0,
    }));
    audioChunksRef.current = [];

    try {
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Set up audio analysis for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Determine best audio format
      const mimeType = getBestAudioFormat();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      recordingStartTimeRef.current = Date.now();

      setState((prev) => ({
        ...prev,
        isRecording: true,
        permissionStatus: "granted",
      }));

      // Start audio level updates
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        const duration = Date.now() - recordingStartTimeRef.current;
        setState((prev) => ({ ...prev, recordingDuration: duration }));
      }, 100);

      // Set max duration timeout
      maxDurationTimeoutRef.current = setTimeout(() => {
        console.log("[useVoiceInput] Max duration reached, stopping recording");
        stopRecording();
      }, maxDuration);
    } catch (err) {
      const error = err as Error;
      console.error("[useVoiceInput] Failed to start recording:", error);

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setState((prev) => ({
          ...prev,
          permissionStatus: "denied",
          error: "Microphone access denied. Please enable it in your browser settings.",
        }));
      } else if (error.name === "NotFoundError") {
        setState((prev) => ({
          ...prev,
          error: "No microphone found. Please connect a microphone and try again.",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: "Failed to start recording. Please try again.",
        }));
      }

      onError?.(error);
    }
  }, [maxDuration, onError, updateAudioLevel]);

  // Stop recording and transcribe
  const stopRecording = useCallback(async (): Promise<TranscriptionResult | null> => {
    // Clear timers
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Check if actually recording
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        // Check if we have audio data
        if (audioChunksRef.current.length === 0) {
          setState((prev) => ({
            ...prev,
            isRecording: false,
            error: "No audio recorded. Please try again.",
          }));
          resolve(null);
          return;
        }

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // Check minimum size (avoid sending very short/empty recordings)
        if (audioBlob.size < 1000) {
          setState((prev) => ({
            ...prev,
            isRecording: false,
            error: "Recording too short. Please try again.",
          }));
          resolve(null);
          return;
        }

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isTranscribing: true,
          audioLevel: 0,
        }));

        try {
          // Send to transcription API
          const formData = new FormData();

          // Determine file extension based on mime type
          const mimeType = mediaRecorder.mimeType;
          let extension = "webm";
          if (mimeType.includes("mp4")) extension = "mp4";
          else if (mimeType.includes("ogg")) extension = "ogg";
          else if (mimeType.includes("wav")) extension = "wav";

          formData.append("audio", audioBlob, `recording.${extension}`);

          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Transcription failed: ${response.status}`);
          }

          const result: TranscriptionResult = await response.json();

          setState((prev) => ({
            ...prev,
            isTranscribing: false,
          }));

          onTranscription?.(result);
          resolve(result);
        } catch (err) {
          const error = err as Error;
          console.error("[useVoiceInput] Transcription failed:", error);

          setState((prev) => ({
            ...prev,
            isTranscribing: false,
            error: error.message || "Failed to transcribe. Please try again.",
          }));

          onError?.(error);
          resolve(null);
        }
      };

      // Stop the recorder
      mediaRecorder.stop();
    });
  }, [onTranscription, onError]);

  // Cancel recording without transcribing
  const cancelRecording = useCallback(() => {
    // Clear timers
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear chunks
    audioChunksRef.current = [];

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isTranscribing: false,
      audioLevel: 0,
      recordingDuration: 0,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isRecording: state.isRecording,
    isTranscribing: state.isTranscribing,
    error: state.error,
    permissionStatus: state.permissionStatus,
    audioLevel: state.audioLevel,
    recordingDuration: state.recordingDuration,

    // Actions
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
    clearError,
  };
}
