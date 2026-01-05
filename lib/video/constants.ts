/**
 * Video processing configuration constants
 */

export const VIDEO_CONFIG = {
  // Duration and size limits
  MAX_DURATION_SECONDS: 30,
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100MB raw input
  COMPRESSED_TARGET_SIZE: 20 * 1024 * 1024, // 20MB target after compression

  // Frame extraction - thumbnail is separate from diagnostic frames
  THUMBNAIL_POSITION: 0, // 0% - first frame for preview
  DIAGNOSTIC_FRAME_POSITIONS: [0.15, 0.5, 0.85] as const, // 15%, 50%, 85% for AI analysis
  DIAGNOSTIC_FRAME_COUNT: 3,

  // Compression settings
  COMPRESSION: {
    MAX_WIDTH: 1280,
    MAX_HEIGHT: 720,
    TARGET_BITRATE: 2_000_000, // 2 Mbps
    FRAME_RATE: 24,
    VIDEO_CODEC: "libx264",
    AUDIO_CODEC: "aac",
    AUDIO_BITRATE: "128k",
    PRESET: "fast", // Balance between speed and compression
  },

  // Frame extraction settings
  FRAME: {
    FORMAT: "jpeg" as const,
    QUALITY: 85, // 0-100
    MAX_DIMENSION: 1024, // Max width/height for GPT-4o
  },

  // Audio extraction settings (for Whisper)
  AUDIO: {
    SAMPLE_RATE: 16000, // Whisper optimal
    CHANNELS: 1, // Mono
    FORMAT: "webm" as const,
    CODEC: "libopus",
  },

  // Supported input formats
  SUPPORTED_FORMATS: [
    "video/mp4",
    "video/webm",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "video/x-matroska", // .mkv
  ] as const,

  // Device capability thresholds
  MIN_DEVICE_MEMORY_GB: 4,

  // Feature flag environment variable
  FEATURE_FLAG_ENV: "NEXT_PUBLIC_VIDEO_DIAGNOSIS_ENABLED",
} as const;

/**
 * Processing stages for progress tracking
 */
export type ProcessingStage =
  | "idle"
  | "validating"
  | "loading-ffmpeg"
  | "compressing"
  | "extracting-thumbnail"
  | "extracting-frames"
  | "extracting-audio"
  | "transcribing"
  | "encrypting"
  | "uploading"
  | "complete"
  | "error";

/**
 * Processing strategy based on device capabilities
 */
export type ProcessingStrategy = "client" | "server";

/**
 * Confidence score thresholds
 */
export const CONFIDENCE_SCORES = {
  FULL_SUCCESS: 100, // All frames + audio + transcript
  FRAMES_ONLY: 80, // Frames extracted but no audio
  AUDIO_ONLY: 70, // Audio extracted but no frames
  PARTIAL_FRAMES: 60, // Some frames extracted
  MINIMUM: 50, // Minimum acceptable confidence
} as const;

/**
 * Check if video feature is enabled via feature flag
 */
export function isVideoFeatureEnabled(): boolean {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_VIDEO_DIAGNOSIS_ENABLED === "true";
  }
  return (
    process.env.NEXT_PUBLIC_VIDEO_DIAGNOSIS_ENABLED === "true" ||
    (typeof window !== "undefined" &&
      (window as unknown as { __VIDEO_ENABLED__?: boolean })
        .__VIDEO_ENABLED__ === true)
  );
}
