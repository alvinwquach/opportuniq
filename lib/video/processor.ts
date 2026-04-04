/**
 * High-level video processing pipeline
 * Orchestrates client/server processing with fallbacks and confidence scoring
 */

import {
  VIDEO_CONFIG,
  type ProcessingStage,
  type ProcessingStrategy,
} from "./constants";
import { getProcessingStrategy, canUseClientFFmpeg } from "./capabilities";
import {
  loadFFmpeg,
  getVideoMetadata as getClientMetadata,
  compressVideo as compressClientVideo,
  extractFrames as extractClientFrames,
  extractAudio as extractClientAudio,
  generateQuickThumbnail,
  type VideoMetadata,
} from "./ffmpeg-client";
import {
  processVideoOnServer,
  getVideoMetadataFromServer,
} from "./ffmpeg-server";
import {
  calculateConfidence,
  getAudioOnlyConfidence,
  getFramesOnlyConfidence,
  type ConfidenceResult,
} from "./confidence";

export interface VideoProcessingResult {
  // Compressed video
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;

  // Thumbnail (for preview)
  thumbnailBlob: Blob;
  thumbnailBase64: string;

  // Diagnostic frames (for AI)
  diagnosticFrameBlobs: Blob[];
  diagnosticFramesBase64: string[];

  // Audio (for transcription)
  audioBlob: Blob | null;
  audioDuration: number;
  hasAudio: boolean;

  // Metadata
  duration: number;
  width: number;
  height: number;

  // Processing info
  processingStrategy: ProcessingStrategy;
  processingTimeMs: number;
  confidence: ConfidenceResult;
}

export interface VideoProcessingProgress {
  stage: ProcessingStage;
  progress: number; // 0-100
  message: string;
}

type ProgressCallback = (progress: VideoProcessingProgress) => void;

/**
 * Validate video file before processing
 */
export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!VIDEO_CONFIG.SUPPORTED_FORMATS.includes(file.type as (typeof VIDEO_CONFIG.SUPPORTED_FORMATS)[number])) {
    return {
      valid: false,
      error: `Unsupported video format. Supported formats: ${VIDEO_CONFIG.SUPPORTED_FORMATS.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > VIDEO_CONFIG.MAX_FILE_SIZE_BYTES) {
    const maxMB = VIDEO_CONFIG.MAX_FILE_SIZE_BYTES / 1024 / 1024;
    return {
      valid: false,
      error: `Video file too large. Maximum size is ${maxMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate video duration (requires loading metadata first)
 */
export async function validateVideoDuration(file: File): Promise<{
  valid: boolean;
  duration: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(video.src);

      if (duration > VIDEO_CONFIG.MAX_DURATION_SECONDS) {
        resolve({
          valid: false,
          duration,
          error: `Video is too long. Maximum duration is ${VIDEO_CONFIG.MAX_DURATION_SECONDS} seconds`,
        });
      } else {
        resolve({ valid: true, duration });
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        valid: false,
        duration: 0,
        error: "Failed to load video file",
      });
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Get quick thumbnail for immediate preview
 */
export async function getQuickThumbnail(file: File): Promise<string> {
  return generateQuickThumbnail(file);
}

/**
 * Main video processing pipeline
 */
export async function processVideo(
  file: File,
  onProgress?: ProgressCallback
): Promise<VideoProcessingResult> {

  const startTime = performance.now();
  const processingStrategy = getProcessingStrategy();
  const canUseClient = canUseClientFFmpeg();


  const errors: string[] = [];

  // Report progress helper
  const reportProgress = (
    stage: ProcessingStage,
    progress: number,
    message?: string
  ) => {
    onProgress?.({
      stage,
      progress,
      message: message || getStageMessage(stage),
    });
  };

  reportProgress("validating", 0);

  // Validate file
  const fileValidation = validateVideoFile(file);
  if (!fileValidation.valid) {
    throw new Error(fileValidation.error);
  }

  // Validate duration
  const durationValidation = await validateVideoDuration(file);
  if (!durationValidation.valid) {
    throw new Error(durationValidation.error);
  }

  reportProgress("validating", 100);

  // Process based on strategy
  if (processingStrategy === "server" || !canUseClient) {
    return processVideoServer(file, startTime, onProgress);
  }

  return processVideoClient(file, startTime, errors, onProgress);
}

/**
 * Client-side processing using FFmpeg WASM
 */
async function processVideoClient(
  file: File,
  startTime: number,
  errors: string[],
  onProgress?: ProgressCallback
): Promise<VideoProcessingResult> {
  const reportProgress = (
    stage: ProcessingStage,
    progress: number,
    message?: string
  ) => {
    onProgress?.({
      stage,
      progress,
      message: message || getStageMessage(stage),
    });
  };

  // Load FFmpeg
  reportProgress("loading-ffmpeg", 0);
  await loadFFmpeg((progress) => {
    reportProgress("loading-ffmpeg", progress);
  });
  reportProgress("loading-ffmpeg", 100);

  // Get metadata
  const metadata = await getClientMetadata(file);

  // Variables to track results
  let compressedBlob: Blob = file;
  let compressedSize = file.size;
  let compressionSucceeded = false;

  let thumbnailBlob: Blob | null = null;
  let thumbnailBase64 = "";
  let diagnosticFrameBlobs: Blob[] = [];
  let diagnosticFramesBase64: string[] = [];

  let audioBlob: Blob | null = null;
  let audioDuration = 0;
  let hasAudio = false;

  // Compress video
  try {
    reportProgress("compressing", 0);
    const compressionResult = await compressClientVideo(file, (stage, progress) => {
      if (stage === "compressing") {
        reportProgress("compressing", progress);
      }
    });
    compressedBlob = compressionResult.blob;
    compressedSize = compressionResult.compressedSize;
    compressionSucceeded = true;
    reportProgress("compressing", 100);
  } catch (error) {
    errors.push("Video compression failed");
    // Continue with original file
  }

  // Extract frames
  try {
    const frameResult = await extractClientFrames(
      file,
      metadata.duration,
      (stage, progress) => {
        if (stage === "extracting-thumbnail") {
          reportProgress("extracting-thumbnail", progress);
        } else if (stage === "extracting-frames") {
          reportProgress("extracting-frames", progress);
        }
      }
    );
    thumbnailBlob = frameResult.thumbnailBlob;
    thumbnailBase64 = frameResult.thumbnailBase64;
    diagnosticFrameBlobs = frameResult.diagnosticFrameBlobs;
    diagnosticFramesBase64 = frameResult.diagnosticFramesBase64;
  } catch (error) {
    errors.push("Frame extraction failed");
  }

  // Extract audio
  try {
    reportProgress("extracting-audio", 0);
    const audioResult = await extractClientAudio(file, (stage, progress) => {
      if (stage === "extracting-audio") {
        reportProgress("extracting-audio", progress);
      }
    });
    audioBlob = audioResult.blob;
    audioDuration = audioResult.duration;
    hasAudio = audioResult.hasAudio;
    reportProgress("extracting-audio", 100);
  } catch (error) {
    errors.push("Audio extraction failed");
  }

  // Calculate confidence
  const confidence = calculateConfidence({
    framesExtracted: diagnosticFramesBase64.length,
    expectedFrames: VIDEO_CONFIG.DIAGNOSTIC_FRAME_COUNT,
    hasAudio,
    hasTranscript: false, // Transcript comes later
    compressionSucceeded,
    processingErrors: errors,
  });

  // Handle fallback scenarios
  if (diagnosticFramesBase64.length === 0 && hasAudio) {
    // Audio-only fallback
    const audioConfidence = getAudioOnlyConfidence();
    return {
      compressedBlob,
      originalSize: file.size,
      compressedSize,
      thumbnailBlob: thumbnailBlob || new Blob(),
      thumbnailBase64: thumbnailBase64 || "",
      diagnosticFrameBlobs: [],
      diagnosticFramesBase64: [],
      audioBlob,
      audioDuration,
      hasAudio: true,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      processingStrategy: "client",
      processingTimeMs: performance.now() - startTime,
      confidence: audioConfidence,
    };
  }

  if (!hasAudio && diagnosticFramesBase64.length > 0) {
    // Frames-only fallback
    const framesConfidence = getFramesOnlyConfidence(
      diagnosticFramesBase64.length
    );
    return {
      compressedBlob,
      originalSize: file.size,
      compressedSize,
      thumbnailBlob: thumbnailBlob || new Blob(),
      thumbnailBase64,
      diagnosticFrameBlobs,
      diagnosticFramesBase64,
      audioBlob: null,
      audioDuration: 0,
      hasAudio: false,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      processingStrategy: "client",
      processingTimeMs: performance.now() - startTime,
      confidence: framesConfidence,
    };
  }

  reportProgress("complete", 100);

  return {
    compressedBlob,
    originalSize: file.size,
    compressedSize,
    thumbnailBlob: thumbnailBlob || new Blob(),
    thumbnailBase64,
    diagnosticFrameBlobs,
    diagnosticFramesBase64,
    audioBlob,
    audioDuration,
    hasAudio,
    duration: metadata.duration,
    width: metadata.width,
    height: metadata.height,
    processingStrategy: "client",
    processingTimeMs: performance.now() - startTime,
    confidence,
  };
}

/**
 * Server-side processing (fallback)
 */
async function processVideoServer(
  file: File,
  startTime: number,
  onProgress?: ProgressCallback
): Promise<VideoProcessingResult> {

  const reportProgress = (
    stage: ProcessingStage,
    progress: number,
    message?: string
  ) => {
    onProgress?.({
      stage,
      progress,
      message: message || getStageMessage(stage),
    });
  };

  reportProgress("uploading", 0, "Uploading video to server...");

  try {
    const result = await processVideoOnServer(file, (stage, progress) => {
      reportProgress(stage, progress);
    });


    // Calculate confidence
    const confidence = calculateConfidence({
      framesExtracted: result.diagnosticFramesBase64.length,
      expectedFrames: VIDEO_CONFIG.DIAGNOSTIC_FRAME_COUNT,
      hasAudio: result.hasAudio,
      hasTranscript: false,
      compressionSucceeded: result.compressedVideoBlob.size > 0,
      processingErrors: [],
    });


    reportProgress("complete", 100);

    const totalTime = performance.now() - startTime;

    return {
      compressedBlob: result.compressedVideoBlob,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      thumbnailBlob: result.thumbnailBlob,
      thumbnailBase64: result.thumbnailBase64,
      diagnosticFrameBlobs: result.diagnosticFrameBlobs,
      diagnosticFramesBase64: result.diagnosticFramesBase64,
      audioBlob: result.audioBlob,
      audioDuration: result.audioDuration,
      hasAudio: result.hasAudio,
      duration: result.metadata.duration,
      width: result.metadata.width,
      height: result.metadata.height,
      processingStrategy: "server",
      processingTimeMs: totalTime,
      confidence,
    };
  } catch (err) {
    throw err;
  }
}

function getStageMessage(stage: ProcessingStage): string {
  const messages: Record<ProcessingStage, string> = {
    idle: "Ready",
    validating: "Validating video...",
    "loading-ffmpeg": "Loading video processor...",
    compressing: "Compressing video...",
    "extracting-thumbnail": "Extracting thumbnail...",
    "extracting-frames": "Extracting diagnostic frames...",
    "extracting-audio": "Extracting audio...",
    transcribing: "Transcribing audio...",
    encrypting: "Encrypting video...",
    uploading: "Uploading...",
    complete: "Complete",
    error: "Error occurred",
  };
  return messages[stage];
}

// Re-export types
export type { VideoMetadata, ProcessingStage, ProcessingStrategy };
export { VIDEO_CONFIG };
