/**
 * Server fallback client for video processing
 * Used when client-side FFmpeg WASM is not available
 * Uploads raw video to server API for processing
 */

import { VIDEO_CONFIG, type ProcessingStage } from "./constants";
import type {
  VideoMetadata,
  CompressionResult,
  FrameExtractionResult,
  AudioExtractionResult,
} from "./ffmpeg-client";

type ProgressCallback = (stage: ProcessingStage, progress: number) => void;

export interface ServerProcessingResult {
  compressedVideoBlob: Blob;
  thumbnailBlob: Blob;
  thumbnailBase64: string;
  diagnosticFrameBlobs: Blob[];
  diagnosticFramesBase64: string[];
  audioBlob: Blob | null;
  audioDuration: number;
  hasAudio: boolean;
  audioMimeType: string;
  metadata: VideoMetadata;
  originalSize: number;
  compressedSize: number;
}

/**
 * Process video on server (fallback for devices that can't run FFmpeg WASM)
 */
export async function processVideoOnServer(
  file: File,
  onProgress?: ProgressCallback
): Promise<ServerProcessingResult> {
  console.log("[ffmpeg-server] processVideoOnServer() - Starting");
  console.log("[ffmpeg-server] File details:", {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    type: file.type,
  });

  onProgress?.("uploading", 0);

  const formData = new FormData();
  formData.append("video", file);
  formData.append("maxDuration", VIDEO_CONFIG.MAX_DURATION_SECONDS.toString());
  formData.append(
    "framePositions",
    JSON.stringify(VIDEO_CONFIG.DIAGNOSTIC_FRAME_POSITIONS)
  );
  formData.append(
    "thumbnailPosition",
    VIDEO_CONFIG.THUMBNAIL_POSITION.toString()
  );
  formData.append("maxFrameDimension", VIDEO_CONFIG.FRAME.MAX_DIMENSION.toString());
  formData.append("frameQuality", VIDEO_CONFIG.FRAME.QUALITY.toString());

  console.log("[ffmpeg-server] Uploading to /api/video/process...");
  const uploadStart = performance.now();

  // Upload with progress tracking
  const response = await uploadWithProgress(
    "/api/video/process",
    formData,
    (progress) => {
      onProgress?.("uploading", progress * 50); // First 50% is upload
    }
  );

  const uploadTime = performance.now() - uploadStart;
  console.log("[ffmpeg-server] Upload completed in", uploadTime.toFixed(0), "ms");
  console.log("[ffmpeg-server] Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ffmpeg-server] Server error response:", errorText);

    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: errorText || "Unknown error" };
    }

    // Check for specific error codes
    if (error.code === "VIDEO_PROCESSING_UNAVAILABLE") {
      console.error("[ffmpeg-server] FFmpeg not available on server");
      throw new Error("Video processing is temporarily unavailable. Please try uploading a photo instead.");
    }

    throw new Error(error.error || `Server processing failed: ${response.status}`);
  }

  onProgress?.("uploading", 50);

  // Parse response - server returns multipart data or JSON with base64
  console.log("[ffmpeg-server] Parsing server response...");
  const result = await response.json();
  console.log("[ffmpeg-server] Response parsed:", {
    hasCompressedVideo: !!result.compressedVideo,
    hasThumbnail: !!result.thumbnail,
    diagnosticFrames: result.diagnosticFrames?.length || 0,
    hasAudio: result.hasAudio,
    metadata: result.metadata,
  });

  onProgress?.("uploading", 100);

  // Convert base64 responses back to blobs
  const compressedVideoBlob = base64ToBlob(
    result.compressedVideo,
    "video/mp4"
  );
  const thumbnailBlob = base64ToBlob(result.thumbnail, "image/jpeg");
  const diagnosticFrameBlobs = result.diagnosticFrames.map((frame: string) =>
    base64ToBlob(frame, "image/jpeg")
  );
  // Use the audio mime type from server (MP3 for AI compatibility)
  const audioMimeType = result.audioMimeType || "audio/mpeg";
  const audioBlob = result.audio
    ? base64ToBlob(result.audio, audioMimeType)
    : null;

  return {
    compressedVideoBlob,
    thumbnailBlob,
    thumbnailBase64: result.thumbnail,
    diagnosticFrameBlobs,
    diagnosticFramesBase64: result.diagnosticFrames,
    audioBlob,
    audioDuration: result.audioDuration || 0,
    hasAudio: result.hasAudio || false,
    audioMimeType,
    metadata: result.metadata,
    originalSize: file.size,
    compressedSize: compressedVideoBlob.size,
  };
}

/**
 * Get video metadata from server
 */
export async function getVideoMetadataFromServer(
  file: File
): Promise<VideoMetadata> {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("metadataOnly", "true");

  const response = await fetch("/api/video/process", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to get video metadata: ${response.status}`);
  }

  const result = await response.json();
  return result.metadata;
}

/**
 * Extract only frames from server (for partial processing)
 */
export async function extractFramesFromServer(
  file: File,
  onProgress?: ProgressCallback
): Promise<FrameExtractionResult> {
  onProgress?.("extracting-frames", 0);

  const formData = new FormData();
  formData.append("video", file);
  formData.append("framesOnly", "true");
  formData.append(
    "framePositions",
    JSON.stringify(VIDEO_CONFIG.DIAGNOSTIC_FRAME_POSITIONS)
  );
  formData.append(
    "thumbnailPosition",
    VIDEO_CONFIG.THUMBNAIL_POSITION.toString()
  );

  const response = await fetch("/api/video/process", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to extract frames: ${response.status}`);
  }

  const result = await response.json();

  onProgress?.("extracting-frames", 100);

  return {
    thumbnailBlob: base64ToBlob(result.thumbnail, "image/jpeg"),
    thumbnailBase64: result.thumbnail,
    diagnosticFrameBlobs: result.diagnosticFrames.map((frame: string) =>
      base64ToBlob(frame, "image/jpeg")
    ),
    diagnosticFramesBase64: result.diagnosticFrames,
  };
}

/**
 * Extract only audio from server (for partial processing)
 */
export async function extractAudioFromServer(
  file: File,
  onProgress?: ProgressCallback
): Promise<AudioExtractionResult> {
  onProgress?.("extracting-audio", 0);

  const formData = new FormData();
  formData.append("video", file);
  formData.append("audioOnly", "true");

  const response = await fetch("/api/video/process", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to extract audio: ${response.status}`);
  }

  const result = await response.json();

  onProgress?.("extracting-audio", 100);

  return {
    blob: result.audio ? base64ToBlob(result.audio, "audio/webm") : new Blob(),
    duration: result.audioDuration || 0,
    hasAudio: result.hasAudio || false,
  };
}

/**
 * Compress video on server
 */
export async function compressVideoOnServer(
  file: File,
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  onProgress?.("compressing", 0);

  const formData = new FormData();
  formData.append("video", file);
  formData.append("compressOnly", "true");

  const response = await uploadWithProgress(
    "/api/video/process",
    formData,
    (progress) => {
      onProgress?.("compressing", progress);
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to compress video: ${response.status}`);
  }

  const result = await response.json();

  return {
    blob: base64ToBlob(result.compressedVideo, "video/mp4"),
    originalSize: file.size,
    compressedSize: result.compressedSize,
  };
}

// Helper functions

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total);
      }
    });

    xhr.addEventListener("load", () => {
      resolve(
        new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            "Content-Type":
              xhr.getResponseHeader("Content-Type") || "application/json",
          }),
        })
      );
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", url);
    xhr.responseType = "text";
    xhr.send(formData);
  });
}
