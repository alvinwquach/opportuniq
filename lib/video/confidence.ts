/**
 * Confidence scoring for video processing results
 * Determines the quality/completeness of the processing
 */

import { CONFIDENCE_SCORES, VIDEO_CONFIG } from "./constants";

export interface ConfidenceInput {
  framesExtracted: number;
  expectedFrames: number;
  hasAudio: boolean;
  hasTranscript: boolean;
  compressionSucceeded: boolean;
  processingErrors: string[];
}

export interface ConfidenceResult {
  score: number;
  level: "high" | "medium" | "low";
  factors: ConfidenceFactors;
  warnings: string[];
}

export interface ConfidenceFactors {
  frameScore: number;
  audioScore: number;
  transcriptScore: number;
  compressionScore: number;
}

/**
 * Calculate confidence score based on processing results
 */
export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  const { expectedFrames } = input;
  const warnings: string[] = [];

  // Calculate individual factor scores
  const frameScore = calculateFrameScore(
    input.framesExtracted,
    expectedFrames,
    warnings
  );
  const audioScore = calculateAudioScore(input.hasAudio, warnings);
  const transcriptScore = calculateTranscriptScore(
    input.hasTranscript,
    input.hasAudio,
    warnings
  );
  const compressionScore = calculateCompressionScore(
    input.compressionSucceeded,
    warnings
  );

  // Weight factors for final score
  // Frames are most important for visual diagnosis
  const weights = {
    frame: 0.4,
    audio: 0.2,
    transcript: 0.25,
    compression: 0.15,
  };

  const weightedScore =
    frameScore * weights.frame +
    audioScore * weights.audio +
    transcriptScore * weights.transcript +
    compressionScore * weights.compression;

  // Round to nearest integer
  const score = Math.round(weightedScore);

  // Determine confidence level
  const level = getConfidenceLevel(score);

  // Add processing errors as warnings
  input.processingErrors.forEach((error) => {
    warnings.push(`Processing error: ${error}`);
  });

  return {
    score,
    level,
    factors: {
      frameScore,
      audioScore,
      transcriptScore,
      compressionScore,
    },
    warnings,
  };
}

function calculateFrameScore(
  extracted: number,
  expected: number,
  warnings: string[]
): number {
  if (expected === 0) return 100; // No frames expected

  const ratio = extracted / expected;

  if (ratio >= 1) {
    return 100;
  } else if (ratio >= 0.66) {
    warnings.push(`Only ${extracted} of ${expected} frames extracted`);
    return 80;
  } else if (ratio > 0) {
    warnings.push(`Only ${extracted} of ${expected} frames extracted`);
    return 60;
  } else {
    warnings.push("No frames could be extracted");
    return 0;
  }
}

function calculateAudioScore(hasAudio: boolean, warnings: string[]): number {
  if (hasAudio) {
    return 100;
  } else {
    warnings.push("No audio track found in video");
    return 0;
  }
}

function calculateTranscriptScore(
  hasTranscript: boolean,
  hasAudio: boolean,
  warnings: string[]
): number {
  if (hasTranscript) {
    return 100;
  } else if (!hasAudio) {
    // No audio to transcribe, not a failure
    return 100;
  } else {
    warnings.push("Audio transcription failed");
    return 0;
  }
}

function calculateCompressionScore(
  succeeded: boolean,
  warnings: string[]
): number {
  if (succeeded) {
    return 100;
  } else {
    warnings.push("Video compression failed");
    return 50; // Still usable with original
  }
}

function getConfidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

/**
 * Determine if processing result is usable for diagnosis
 */
export function isUsableResult(confidence: ConfidenceResult): boolean {
  return confidence.score >= CONFIDENCE_SCORES.MINIMUM;
}

/**
 * Get a human-readable description of the confidence result
 */
export function getConfidenceDescription(confidence: ConfidenceResult): string {
  const { score, level } = confidence;

  if (level === "high") {
    return `High confidence (${score}%): Full video analysis available with audio transcription.`;
  } else if (level === "medium") {
    return `Medium confidence (${score}%): Partial analysis available. ${confidence.warnings[0] || ""}`;
  } else {
    return `Low confidence (${score}%): Limited analysis available. ${confidence.warnings.join(". ")}`;
  }
}

/**
 * Calculate confidence for audio-only fallback
 */
export function getAudioOnlyConfidence(): ConfidenceResult {
  return {
    score: CONFIDENCE_SCORES.AUDIO_ONLY,
    level: "medium",
    factors: {
      frameScore: 0,
      audioScore: 100,
      transcriptScore: 100,
      compressionScore: 0,
    },
    warnings: [
      "Frame extraction failed - using audio transcript only for diagnosis",
    ],
  };
}

/**
 * Calculate confidence for frames-only fallback
 */
export function getFramesOnlyConfidence(
  framesExtracted: number
): ConfidenceResult {
  const frameRatio =
    framesExtracted / VIDEO_CONFIG.DIAGNOSTIC_FRAME_COUNT;
  const baseScore = CONFIDENCE_SCORES.FRAMES_ONLY;
  const adjustedScore = Math.round(baseScore * frameRatio);

  return {
    score: adjustedScore,
    level: adjustedScore >= 60 ? "medium" : "low",
    factors: {
      frameScore: framesExtracted > 0 ? Math.round(100 * frameRatio) : 0,
      audioScore: 0,
      transcriptScore: 0,
      compressionScore: 100,
    },
    warnings: [
      "Audio extraction failed - using visual frames only for diagnosis",
    ],
  };
}
