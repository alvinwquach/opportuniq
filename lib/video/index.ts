/**
 * Video processing module exports
 */

// Constants and types
export {
  VIDEO_CONFIG,
  CONFIDENCE_SCORES,
  isVideoFeatureEnabled,
  type ProcessingStage,
  type ProcessingStrategy,
} from "./constants";

// Capabilities
export {
  detectCapabilities,
  canUseClientFFmpeg,
  getProcessingStrategy,
  isCrossOriginIsolated,
  getClientProcessingBlocker,
  logCapabilities,
} from "./capabilities";

// Main processor
export {
  processVideo,
  validateVideoFile,
  validateVideoDuration,
  getQuickThumbnail,
  type VideoProcessingResult,
  type VideoProcessingProgress,
  type VideoMetadata,
} from "./processor";

// Confidence scoring
export {
  calculateConfidence,
  isUsableResult,
  getConfidenceDescription,
  getAudioOnlyConfidence,
  getFramesOnlyConfidence,
  type ConfidenceInput,
  type ConfidenceResult,
  type ConfidenceFactors,
} from "./confidence";

// Client-side FFmpeg (for advanced use)
export {
  loadFFmpeg,
  isFFmpegLoaded,
  terminateFFmpeg,
  getVideoMetadata,
  compressVideo,
  extractFrames,
  extractAudio,
  generateQuickThumbnail,
} from "./ffmpeg-client";

// Server fallback (for advanced use)
export {
  processVideoOnServer,
  getVideoMetadataFromServer,
  extractFramesFromServer,
  extractAudioFromServer,
  compressVideoOnServer,
} from "./ffmpeg-server";
