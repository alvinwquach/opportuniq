/**
 * Client-side FFmpeg WASM wrapper for video processing
 * Handles compression, frame extraction, and audio extraction
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { VIDEO_CONFIG, type ProcessingStage } from "./constants";

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;
let ffmpegLoading: Promise<void> | null = null;

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
  codec: string | null;
  frameRate: number | null;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
}

export interface FrameExtractionResult {
  thumbnailBlob: Blob;
  thumbnailBase64: string;
  diagnosticFrameBlobs: Blob[];
  diagnosticFramesBase64: string[];
}

export interface AudioExtractionResult {
  blob: Blob;
  duration: number;
  hasAudio: boolean;
}

type ProgressCallback = (stage: ProcessingStage, progress: number) => void;

/**
 * Load FFmpeg WASM - lazy loaded and cached
 */
export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  // Return existing instance if already loaded
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance;
  }

  // Wait for existing loading process if in progress
  if (ffmpegLoading) {
    await ffmpegLoading;
    return ffmpegInstance!;
  }

  // Start loading
  ffmpegLoading = (async () => {
    ffmpegInstance = new FFmpeg();

    // Set up progress logging
    ffmpegInstance.on("log", ({ message }) => {
      // Parse FFmpeg progress from logs if needed
      console.log("[FFmpeg]", message);
    });

    ffmpegInstance.on("progress", ({ progress }) => {
      onProgress?.(progress * 100);
    });

    // Load FFmpeg core from CDN with proper CORS headers
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    ffmpegLoaded = true;
  })();

  await ffmpegLoading;
  ffmpegLoading = null;

  return ffmpegInstance!;
}

/**
 * Check if FFmpeg is loaded
 */
export function isFFmpegLoaded(): boolean {
  return ffmpegLoaded && ffmpegInstance !== null;
}

/**
 * Get video metadata (duration, dimensions, etc.)
 */
export async function getVideoMetadata(file: File): Promise<VideoMetadata> {
  const ffmpeg = await loadFFmpeg();

  // Write input file
  const inputName = "input" + getExtension(file.type);
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Run ffprobe-like command to get metadata
  // FFmpeg outputs metadata to stderr, which we capture via logs
  const metadata: VideoMetadata = {
    duration: 0,
    width: 0,
    height: 0,
    hasAudio: false,
    codec: null,
    frameRate: null,
  };

  // Use a simple approach: extract one frame to get dimensions
  // and use file duration from the video element
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => {
      metadata.duration = video.duration;
      metadata.width = video.videoWidth;
      metadata.height = video.videoHeight;
      // Check for audio tracks
      const audioTracks = (video as HTMLVideoElement & { audioTracks?: { length: number } }).audioTracks;
      metadata.hasAudio = audioTracks ? audioTracks.length > 0 : true; // Assume has audio if we can't detect
      resolve();
    };
    video.onerror = () => reject(new Error("Failed to load video metadata"));
  });

  URL.revokeObjectURL(video.src);

  // Clean up
  await ffmpeg.deleteFile(inputName);

  return metadata;
}

/**
 * Compress video to target size and resolution
 */
export async function compressVideo(
  file: File,
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  const ffmpeg = await loadFFmpeg();
  onProgress?.("compressing", 0);

  const inputName = "input" + getExtension(file.type);
  const outputName = "output.mp4";

  // Write input file
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const { COMPRESSION } = VIDEO_CONFIG;

  // Build FFmpeg command for compression
  // -vf scale: scale video to max dimensions while maintaining aspect ratio
  // -c:v libx264: use H.264 codec
  // -preset fast: balance between speed and compression
  // -crf 23: constant rate factor (quality)
  // -c:a aac: use AAC audio codec
  // -b:a 128k: audio bitrate
  await ffmpeg.exec([
    "-i",
    inputName,
    "-vf",
    `scale='min(${COMPRESSION.MAX_WIDTH},iw)':min'(${COMPRESSION.MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease`,
    "-c:v",
    COMPRESSION.VIDEO_CODEC,
    "-preset",
    COMPRESSION.PRESET,
    "-crf",
    "23",
    "-c:a",
    COMPRESSION.AUDIO_CODEC,
    "-b:a",
    COMPRESSION.AUDIO_BITRATE,
    "-movflags",
    "+faststart", // Enable streaming
    "-y",
    outputName,
  ]);

  onProgress?.("compressing", 100);

  // Read output file
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" });

  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return {
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
  };
}

/**
 * Extract thumbnail (first frame) and diagnostic frames
 */
export async function extractFrames(
  file: File,
  duration: number,
  onProgress?: ProgressCallback
): Promise<FrameExtractionResult> {
  const ffmpeg = await loadFFmpeg();
  onProgress?.("extracting-thumbnail", 0);

  const inputName = "input" + getExtension(file.type);
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const { FRAME, DIAGNOSTIC_FRAME_POSITIONS, THUMBNAIL_POSITION } =
    VIDEO_CONFIG;

  // Extract thumbnail (first frame)
  const thumbnailName = "thumbnail.jpg";
  const thumbnailTime = duration * THUMBNAIL_POSITION;

  await ffmpeg.exec([
    "-i",
    inputName,
    "-ss",
    thumbnailTime.toString(),
    "-vframes",
    "1",
    "-vf",
    `scale='min(${FRAME.MAX_DIMENSION},iw)':-1`,
    "-q:v",
    Math.round((100 - FRAME.QUALITY) / 3).toString(), // Convert quality to FFmpeg scale
    "-y",
    thumbnailName,
  ]);

  onProgress?.("extracting-thumbnail", 100);
  onProgress?.("extracting-frames", 0);

  // Extract diagnostic frames
  const diagnosticFrameBlobs: Blob[] = [];
  const diagnosticFramesBase64: string[] = [];

  for (let i = 0; i < DIAGNOSTIC_FRAME_POSITIONS.length; i++) {
    const position = DIAGNOSTIC_FRAME_POSITIONS[i];
    const frameTime = duration * position;
    const frameName = `frame_${i}.jpg`;

    await ffmpeg.exec([
      "-i",
      inputName,
      "-ss",
      frameTime.toString(),
      "-vframes",
      "1",
      "-vf",
      `scale='min(${FRAME.MAX_DIMENSION},iw)':-1`,
      "-q:v",
      Math.round((100 - FRAME.QUALITY) / 3).toString(),
      "-y",
      frameName,
    ]);

    const frameData = await ffmpeg.readFile(frameName);
    const frameBlob = new Blob([new Uint8Array(frameData as Uint8Array)], { type: "image/jpeg" });
    diagnosticFrameBlobs.push(frameBlob);
    diagnosticFramesBase64.push(await blobToBase64(frameBlob));

    await ffmpeg.deleteFile(frameName);

    onProgress?.(
      "extracting-frames",
      ((i + 1) / DIAGNOSTIC_FRAME_POSITIONS.length) * 100
    );
  }

  // Read thumbnail
  const thumbnailData = await ffmpeg.readFile(thumbnailName);
  const thumbnailBlob = new Blob([new Uint8Array(thumbnailData as Uint8Array)], { type: "image/jpeg" });
  const thumbnailBase64 = await blobToBase64(thumbnailBlob);

  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(thumbnailName);

  return {
    thumbnailBlob,
    thumbnailBase64,
    diagnosticFrameBlobs,
    diagnosticFramesBase64,
  };
}

/**
 * Extract audio track for Whisper transcription
 */
export async function extractAudio(
  file: File,
  onProgress?: ProgressCallback
): Promise<AudioExtractionResult> {
  const ffmpeg = await loadFFmpeg();
  onProgress?.("extracting-audio", 0);

  const inputName = "input" + getExtension(file.type);
  const outputName = "audio.webm";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const { AUDIO } = VIDEO_CONFIG;

  try {
    // Extract audio and convert to WebM with Opus codec
    // -vn: no video
    // -ar: sample rate
    // -ac: audio channels
    await ffmpeg.exec([
      "-i",
      inputName,
      "-vn",
      "-ar",
      AUDIO.SAMPLE_RATE.toString(),
      "-ac",
      AUDIO.CHANNELS.toString(),
      "-c:a",
      AUDIO.CODEC,
      "-y",
      outputName,
    ]);

    onProgress?.("extracting-audio", 100);

    const audioData = await ffmpeg.readFile(outputName);
    const blob = new Blob([new Uint8Array(audioData as Uint8Array)], { type: `audio/${AUDIO.FORMAT}` });

    // Get audio duration
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(blob);

    const duration = await new Promise<number>((resolve) => {
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        resolve(0);
      };
    });

    // Clean up
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    return {
      blob,
      duration,
      hasAudio: blob.size > 0 && duration > 0,
    };
  } catch (error) {
    // Clean up on error
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch {
      // Ignore cleanup errors
    }

    // Return empty result if audio extraction fails (video might not have audio)
    return {
      blob: new Blob(),
      duration: 0,
      hasAudio: false,
    };
  }
}

/**
 * Generate thumbnail from first frame (quick version using Canvas)
 * Use this for immediate preview before full processing
 */
export async function generateQuickThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      // Seek to first frame
      video.currentTime = 0;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Scale to max dimension while maintaining aspect ratio
      const maxDim = VIDEO_CONFIG.FRAME.MAX_DIMENSION;
      const scale = Math.min(maxDim / video.videoWidth, maxDim / video.videoHeight, 1);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", VIDEO_CONFIG.FRAME.QUALITY / 100);
      const base64 = dataUrl.split(",")[1];

      URL.revokeObjectURL(video.src);
      resolve(base64);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video for thumbnail"));
    };

    video.src = URL.createObjectURL(file);
  });
}

// Helper functions

function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
    "video/x-matroska": ".mkv",
  };
  return extensions[mimeType] || ".mp4";
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Terminate FFmpeg instance and free memory
 */
export function terminateFFmpeg(): void {
  if (ffmpegInstance) {
    ffmpegInstance.terminate();
    ffmpegInstance = null;
    ffmpegLoaded = false;
  }
}
