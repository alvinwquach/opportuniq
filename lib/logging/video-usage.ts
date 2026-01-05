/**
 * Video usage logging utilities for AI usage tracking
 * Logs video-specific metrics to the AI messages metadata
 */

export interface VideoUsageMetadata {
  // Video-specific flags
  usedVideo: boolean;
  videoType?: "video_diagnosis"; // Tool type for filtering

  // Video metrics
  videoDuration?: number;
  videoFrameCount?: number;
  videoHasAudio?: boolean;
  videoFileSizeBytes?: number;
  videoCompressedSizeBytes?: number;
  videoConfidenceScore?: number;
  videoProcessingStrategy?: "client" | "server";
  videoProcessingTimeMs?: number;

  // Audio/transcript metrics (from video)
  videoTranscriptLength?: number;
  videoTranscriptLanguage?: string;
  videoAudioDurationSeconds?: number;

  // Existing fields (to merge with)
  usedVoice?: boolean;
  usedPhoto?: boolean;
  detectedLanguage?: string;
}

export interface WhisperVideoUsageLog {
  userId: string;
  audioDurationSeconds: number;
  detectedLanguage: string;
  sourceType: "video_extraction";
  estimatedCost: number;
}

export interface VideoDiagnosisUsageLog {
  userId: string;
  conversationId: string;
  model: string;

  // Video-specific metadata
  videoDuration: number;
  frameCount: number;
  hasAudio: boolean;
  audioTranscriptLength: number;
  transcriptLanguage: string | null;
  fileSizeBytes: number;
  confidenceScore: number;
  processingStrategy: "client" | "server";

  // Cost tracking
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

/**
 * Build video metadata for AI message logging
 * Merges with existing metadata fields
 */
export function buildVideoMetadata(
  videoData: {
    duration: number;
    frameCount: number;
    hasAudio: boolean;
    fileSizeBytes: number;
    compressedSizeBytes: number;
    confidenceScore: number;
    processingStrategy: "client" | "server";
    processingTimeMs: number;
    transcriptLength?: number;
    transcriptLanguage?: string;
    audioDurationSeconds?: number;
  },
  existingMetadata?: Record<string, unknown>
): VideoUsageMetadata {
  return {
    // Merge existing metadata
    ...(existingMetadata as VideoUsageMetadata),

    // Video flags
    usedVideo: true,
    videoType: "video_diagnosis",

    // Video metrics
    videoDuration: videoData.duration,
    videoFrameCount: videoData.frameCount,
    videoHasAudio: videoData.hasAudio,
    videoFileSizeBytes: videoData.fileSizeBytes,
    videoCompressedSizeBytes: videoData.compressedSizeBytes,
    videoConfidenceScore: videoData.confidenceScore,
    videoProcessingStrategy: videoData.processingStrategy,
    videoProcessingTimeMs: videoData.processingTimeMs,

    // Audio/transcript metrics
    videoTranscriptLength: videoData.transcriptLength,
    videoTranscriptLanguage: videoData.transcriptLanguage,
    videoAudioDurationSeconds: videoData.audioDurationSeconds,
  };
}

/**
 * Calculate Whisper cost for video audio transcription
 * Whisper pricing: $0.006 per minute
 */
export function calculateWhisperCost(audioDurationSeconds: number): number {
  const minutes = audioDurationSeconds / 60;
  return minutes * 0.006;
}

/**
 * Log video diagnosis usage (to be called after successful GPT-4o call)
 * This function should be called server-side in the chat API
 */
export function buildVideoDiagnosisLog(params: {
  userId: string;
  conversationId: string;
  videoDuration: number;
  frameCount: number;
  hasAudio: boolean;
  transcriptLength: number;
  transcriptLanguage: string | null;
  fileSizeBytes: number;
  confidenceScore: number;
  processingStrategy: "client" | "server";
  inputTokens: number;
  outputTokens: number;
}): VideoDiagnosisUsageLog {
  // GPT-4o pricing (approximate)
  // Input: $2.50 per 1M tokens
  // Output: $10.00 per 1M tokens
  const inputCost = (params.inputTokens / 1_000_000) * 2.5;
  const outputCost = (params.outputTokens / 1_000_000) * 10;

  return {
    userId: params.userId,
    conversationId: params.conversationId,
    model: "gpt-4o",
    videoDuration: params.videoDuration,
    frameCount: params.frameCount,
    hasAudio: params.hasAudio,
    audioTranscriptLength: params.transcriptLength,
    transcriptLanguage: params.transcriptLanguage,
    fileSizeBytes: params.fileSizeBytes,
    confidenceScore: params.confidenceScore,
    processingStrategy: params.processingStrategy,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    estimatedCost: inputCost + outputCost,
  };
}

/**
 * Log Whisper usage for video audio transcription
 * This function should be called server-side in the transcribe API
 */
export function buildWhisperVideoLog(params: {
  userId: string;
  audioDurationSeconds: number;
  detectedLanguage: string;
}): WhisperVideoUsageLog {
  return {
    userId: params.userId,
    audioDurationSeconds: params.audioDurationSeconds,
    detectedLanguage: params.detectedLanguage,
    sourceType: "video_extraction",
    estimatedCost: calculateWhisperCost(params.audioDurationSeconds),
  };
}

/**
 * Check if metadata indicates video was used
 */
export function isVideoUsage(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  return (metadata as VideoUsageMetadata).usedVideo === true;
}

/**
 * Get video metrics from metadata
 */
export function getVideoMetrics(metadata: unknown): Partial<VideoUsageMetadata> | null {
  if (!isVideoUsage(metadata)) return null;

  const m = metadata as VideoUsageMetadata;
  return {
    videoDuration: m.videoDuration,
    videoFrameCount: m.videoFrameCount,
    videoHasAudio: m.videoHasAudio,
    videoFileSizeBytes: m.videoFileSizeBytes,
    videoConfidenceScore: m.videoConfidenceScore,
    videoProcessingStrategy: m.videoProcessingStrategy,
    videoTranscriptLength: m.videoTranscriptLength,
    videoTranscriptLanguage: m.videoTranscriptLanguage,
  };
}

/**
 * Safe logging wrapper that doesn't throw on errors
 * Use this to ensure logging doesn't break user flow
 */
export async function safeLog<T>(
  logFn: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await logFn();
  } catch (error) {
    console.error(`[Video Usage Log] Failed to log ${context}:`, error);
    return null;
  }
}
