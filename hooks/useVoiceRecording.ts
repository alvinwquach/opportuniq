"use client";

/**
 * useVoiceRecording Hook
 *
 * Handles audio recording using the MediaRecorder API.
 * Provides real-time waveform data for visualization.
 *
 * Features:
 * - Start/stop/pause/resume recording
 * - Real-time duration tracking
 * - Waveform data for visualization
 * - Max duration limit (default 120s)
 * - Browser compatibility handling
 */

import { useState, useCallback, useRef, useEffect } from "react";

// ============================================
// TYPES
// ============================================

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // milliseconds
  audioBlob: Blob | null;
  audioUrl: string | null; // Object URL for playback
  waveformData: number[]; // 0-1 normalized values for visualization
  error: string | null;
}

export interface UseVoiceRecordingOptions {
  maxDurationMs?: number; // Default 120000 (2 minutes)
  sampleRate?: number; // Default 16000 (good for speech)
  onMaxDurationReached?: () => void;
}

export interface UseVoiceRecordingResult {
  state: VoiceRecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  resetRecording: () => void;
  isSupported: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_MAX_DURATION_MS = 120000; // 2 minutes
const WAVEFORM_SAMPLE_COUNT = 50; // Number of bars in waveform
const WAVEFORM_UPDATE_INTERVAL = 50; // ms between waveform updates

// ============================================
// UTILITIES
// ============================================

/**
 * Get the best supported audio MIME type
 */
function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  // Fallback - let browser decide
  return "";
}

/**
 * Check if MediaRecorder is supported
 */
function isMediaRecorderSupported(): boolean {
  return typeof window !== "undefined" && "MediaRecorder" in window && "getUserMedia" in navigator.mediaDevices;
}

// ============================================
// HOOK
// ============================================

export function useVoiceRecording({
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  onMaxDurationReached,
}: UseVoiceRecordingOptions = {}): UseVoiceRecordingResult {
  // State
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    waveformData: [],
    error: null,
  });

  // Refs for recording infrastructure
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Refs for timing
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check support
  const isSupported = isMediaRecorderSupported();

  /**
   * Clean up audio context and stream
   */
  const cleanup = useCallback(() => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear intervals
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }

    // Clear refs
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    chunksRef.current = [];
    startTimeRef.current = 0;
    pausedDurationRef.current = 0;
  }, []);

  /**
   * Revoke object URL when component unmounts or new recording starts
   */
  useEffect(() => {
    return () => {
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
      cleanup();
    };
  }, [cleanup, state.audioUrl]);

  /**
   * Update waveform data from analyser
   */
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Reduce to WAVEFORM_SAMPLE_COUNT values
    const step = Math.floor(dataArray.length / WAVEFORM_SAMPLE_COUNT);
    const waveformData: number[] = [];

    for (let i = 0; i < WAVEFORM_SAMPLE_COUNT; i++) {
      const start = i * step;
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[start + j];
      }
      // Normalize to 0-1
      waveformData.push(sum / step / 255);
    }

    setState((prev) => ({ ...prev, waveformData }));
  }, []);

  /**
   * Update duration
   */
  const updateDuration = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current + pausedDurationRef.current;
    setState((prev) => ({ ...prev, duration: elapsed }));

    // Check max duration
    if (elapsed >= maxDurationMs) {
      onMaxDurationReached?.();
      // Auto-stop will be handled by the caller
    }
  }, [maxDurationMs, onMaxDurationReached]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Voice recording is not supported in this browser",
      }));
      return;
    }

    // Clean up any previous recording
    cleanup();

    // Revoke previous audio URL
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Set up audio context for waveform analysis
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Create MediaRecorder
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error("[useVoiceRecording] MediaRecorder error:", event);
        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          error: "Recording error occurred",
        }));
        cleanup();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Start duration tracking
      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(updateDuration, 100);

      // Start waveform updates
      waveformIntervalRef.current = setInterval(updateWaveform, WAVEFORM_UPDATE_INTERVAL);

      setState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
        waveformData: [],
        error: null,
      });
    } catch (err) {
      console.error("[useVoiceRecording] Failed to start recording:", err);

      let errorMessage = "Failed to start recording";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Microphone access denied. Please allow microphone access to record.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No microphone found. Please connect a microphone.";
        } else {
          errorMessage = err.message;
        }
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      cleanup();
    }
  }, [isSupported, state.audioUrl, cleanup, updateDuration, updateWaveform]);

  /**
   * Stop recording and return the audio blob
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!mediaRecorderRef.current || !state.isRecording) {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = () => {
        // Create final blob
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Calculate final duration
        const finalDuration = Date.now() - startTimeRef.current + pausedDurationRef.current;

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          duration: finalDuration,
          audioBlob,
          audioUrl,
        }));

        cleanup();
        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, [state.isRecording, cleanup]);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !state.isRecording || state.isPaused) {
      return;
    }

    mediaRecorderRef.current.pause();
    pausedDurationRef.current += Date.now() - startTimeRef.current;

    // Stop intervals while paused
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }

    setState((prev) => ({ ...prev, isPaused: true }));
  }, [state.isRecording, state.isPaused]);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !state.isRecording || !state.isPaused) {
      return;
    }

    mediaRecorderRef.current.resume();
    startTimeRef.current = Date.now();

    // Resume intervals
    durationIntervalRef.current = setInterval(updateDuration, 100);
    waveformIntervalRef.current = setInterval(updateWaveform, WAVEFORM_UPDATE_INTERVAL);

    setState((prev) => ({ ...prev, isPaused: false }));
  }, [state.isRecording, state.isPaused, updateDuration, updateWaveform]);

  /**
   * Cancel recording without saving
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    cleanup();

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      waveformData: [],
      error: null,
    });
  }, [state.isRecording, cleanup]);

  /**
   * Reset state (clear recorded audio)
   */
  const resetRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      waveformData: [],
      error: null,
    });
  }, [state.audioUrl]);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
    isSupported,
  };
}
