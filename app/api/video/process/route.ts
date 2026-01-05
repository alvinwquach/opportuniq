/**
 * Server-side video processing API
 * Fallback for devices that can't run FFmpeg WASM client-side
 *
 * This endpoint processes uploaded videos and returns:
 * - Compressed video (base64)
 * - Thumbnail (base64)
 * - Diagnostic frames (base64 array)
 * - Audio track (base64)
 * - Video metadata
 */

import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { createClient } from "@/lib/supabase/server";

const execAsync = promisify(exec);

// Video processing limits
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DURATION = 30; // seconds
const COMPRESSION_CRF = 23;
const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;
const FRAME_QUALITY = 85;
const AUDIO_SAMPLE_RATE = 16000;

export const maxDuration = 60; // Allow up to 60 seconds for processing

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
  codec: string | null;
  frameRate: number | null;
}

interface ProcessingOptions {
  metadataOnly?: boolean;
  framesOnly?: boolean;
  audioOnly?: boolean;
  compressOnly?: boolean;
  framePositions?: number[];
  thumbnailPosition?: number;
  maxFrameDimension?: number;
  frameQuality?: number;
}

export async function POST(request: NextRequest) {
  console.log("[Video API] Starting video processing request");

  // Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[Video API] Unauthorized - no user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Video API] User authenticated:", user.id);

  let tempDir: string | null = null;
  let inputPath: string | null = null;

  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;

    if (!videoFile) {
      console.log("[Video API] No video file in request");
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    console.log("[Video API] Received video:", {
      name: videoFile.name,
      type: videoFile.type,
      size: `${(videoFile.size / 1024 / 1024).toFixed(2)}MB`,
    });

    // Validate file size
    if (videoFile.size > MAX_FILE_SIZE) {
      console.log("[Video API] File too large:", videoFile.size);
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Parse options
    const options: ProcessingOptions = {
      metadataOnly: formData.get("metadataOnly") === "true",
      framesOnly: formData.get("framesOnly") === "true",
      audioOnly: formData.get("audioOnly") === "true",
      compressOnly: formData.get("compressOnly") === "true",
      framePositions: formData.get("framePositions")
        ? JSON.parse(formData.get("framePositions") as string)
        : [0.15, 0.5, 0.85],
      thumbnailPosition: parseFloat(
        (formData.get("thumbnailPosition") as string) || "0"
      ),
      maxFrameDimension: parseInt(
        (formData.get("maxFrameDimension") as string) || "1024"
      ),
      frameQuality: parseInt(
        (formData.get("frameQuality") as string) || "85"
      ),
    };

    console.log("[Video API] Processing options:", options);

    // Create temp directory
    tempDir = join(tmpdir(), `video-process-${randomUUID()}`);
    console.log("[Video API] Created temp directory:", tempDir);
    await mkdir(tempDir, { recursive: true });

    // Write video to temp file
    console.log("[Video API] Writing video to temp file...");
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const extension = getExtension(videoFile.type);
    inputPath = join(tempDir, `input${extension}`);
    await writeFile(inputPath, videoBuffer);
    console.log("[Video API] Video saved to:", inputPath, `(${videoBuffer.length} bytes)`);

    // Get metadata first
    console.log("[Video API] Extracting metadata...");
    const metadata = await getVideoMetadata(inputPath);
    console.log("[Video API] Metadata extracted:", metadata);

    // Validate duration
    if (metadata.duration > MAX_DURATION) {
      console.log("[Video API] Duration exceeds limit:", metadata.duration, ">", MAX_DURATION);
      return NextResponse.json(
        { error: `Video duration exceeds ${MAX_DURATION} seconds` },
        { status: 400 }
      );
    }

    // Return metadata only if requested
    if (options.metadataOnly) {
      console.log("[Video API] Returning metadata only");
      return NextResponse.json({ metadata });
    }

    // Process based on options
    const result: Record<string, unknown> = { metadata };

    if (options.framesOnly) {
      console.log("[Video API] Processing frames only...");
      const frames = await extractFrames(
        inputPath,
        tempDir,
        metadata.duration,
        options
      );
      result.thumbnail = frames.thumbnail;
      result.diagnosticFrames = frames.diagnosticFrames;
      console.log("[Video API] Frames extracted:", frames.diagnosticFrames.length, "frames");
    } else if (options.audioOnly) {
      console.log("[Video API] Processing audio only...");
      const audio = await extractAudio(inputPath, tempDir);
      result.audio = audio.base64;
      result.audioDuration = audio.duration;
      result.hasAudio = audio.hasAudio;
      console.log("[Video API] Audio extracted:", { hasAudio: audio.hasAudio, duration: audio.duration });
    } else if (options.compressOnly) {
      console.log("[Video API] Processing compression only...");
      const compressed = await compressVideo(inputPath, tempDir);
      result.compressedVideo = compressed.base64;
      result.compressedSize = compressed.size;
      console.log("[Video API] Video compressed:", `${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
    } else {
      // Full processing
      console.log("[Video API] Starting full processing (compress + frames + audio)...");
      const startTime = Date.now();

      const [compressed, frames, audio] = await Promise.all([
        compressVideo(inputPath, tempDir),
        extractFrames(inputPath, tempDir, metadata.duration, options),
        extractAudio(inputPath, tempDir),
      ]);

      const processingTime = Date.now() - startTime;
      console.log("[Video API] Full processing completed in", processingTime, "ms");

      result.compressedVideo = compressed.base64;
      result.compressedSize = compressed.size;
      result.thumbnail = frames.thumbnail;
      result.diagnosticFrames = frames.diagnosticFrames;
      result.audio = audio.base64;
      result.audioDuration = audio.duration;
      result.hasAudio = audio.hasAudio;
      result.audioMimeType = audio.mimeType;

      console.log("[Video API] Results:", {
        compressedSize: `${(compressed.size / 1024 / 1024).toFixed(2)}MB`,
        thumbnailSize: `${(frames.thumbnail.length / 1024).toFixed(1)}KB`,
        diagnosticFrames: frames.diagnosticFrames.length,
        hasAudio: audio.hasAudio,
        audioDuration: audio.duration,
        audioMimeType: audio.mimeType,
      });
    }

    console.log("[Video API] Sending response...");
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Video API] === ERROR ===");
    console.error("[Video API] Error type:", error?.constructor?.name);
    console.error("[Video API] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[Video API] Error stack:", error instanceof Error ? error.stack : "N/A");

    const errorMessage = error instanceof Error ? error.message : "Video processing failed";

    // Provide user-friendly error messages
    if (errorMessage === "VIDEO_PROCESSING_UNAVAILABLE") {
      console.log("[Video API] Returning 503 - FFmpeg not available");
      return NextResponse.json(
        {
          error: "Video processing is not available on this server. Please try uploading a photo instead, or try again later.",
          code: "VIDEO_PROCESSING_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    console.log("[Video API] Returning 500 - General error");
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    // Clean up temp files
    if (tempDir) {
      console.log("[Video API] Cleaning up temp directory:", tempDir);
      try {
        const { rm } = await import("fs/promises");
        await rm(tempDir, { recursive: true, force: true });
        console.log("[Video API] Cleanup completed");
      } catch (cleanupErr) {
        console.log("[Video API] Cleanup failed (non-critical):", cleanupErr);
      }
    }
  }
}

async function checkFFmpegAvailable(): Promise<boolean> {
  try {
    const { stdout } = await execAsync("which ffmpeg && which ffprobe");
    console.log("[Video API] FFmpeg available at:", stdout.trim());
    return true;
  } catch (err) {
    console.log("[Video API] FFmpeg not available:", err);
    return false;
  }
}

async function getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
  console.log("[Video API] getVideoMetadata() - Starting for:", inputPath);
  try {
    // Use ffprobe to get metadata
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`;
    console.log("[Video API] getVideoMetadata() - Running:", command);

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.log("[Video API] getVideoMetadata() - stderr:", stderr);
    }

    const data = JSON.parse(stdout);
    console.log("[Video API] getVideoMetadata() - Raw ffprobe output parsed, streams:", data.streams?.length || 0);

    const videoStream = data.streams?.find(
      (s: { codec_type: string }) => s.codec_type === "video"
    );
    const audioStream = data.streams?.find(
      (s: { codec_type: string }) => s.codec_type === "audio"
    );

    const metadata = {
      duration: parseFloat(data.format?.duration || "0"),
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      hasAudio: !!audioStream,
      codec: videoStream?.codec_name || null,
      frameRate: videoStream?.r_frame_rate
        ? eval(videoStream.r_frame_rate)
        : null,
    };

    console.log("[Video API] getVideoMetadata() - Extracted:", metadata);
    return metadata;
  } catch (error) {
    console.error("[Video API] getVideoMetadata() - Failed:", error);
    // Check if FFmpeg is installed
    const ffmpegAvailable = await checkFFmpegAvailable();
    if (!ffmpegAvailable) {
      console.error("[Video API] getVideoMetadata() - FFmpeg not installed");
      throw new Error("VIDEO_PROCESSING_UNAVAILABLE");
    }
    throw new Error("Failed to analyze video file");
  }
}

async function compressVideo(
  inputPath: string,
  tempDir: string
): Promise<{ base64: string; size: number }> {
  console.log("[Video API] compressVideo() - Starting...");
  const outputPath = join(tempDir, "compressed.mp4");

  // FFmpeg compression command
  const command = [
    "ffmpeg",
    "-i",
    `"${inputPath}"`,
    "-vf",
    `"scale='min(${MAX_WIDTH},iw)':'min(${MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease"`,
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    COMPRESSION_CRF.toString(),
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    "-y",
    `"${outputPath}"`,
  ].join(" ");

  console.log("[Video API] compressVideo() - Running command:", command);
  const startTime = Date.now();

  try {
    const { stdout, stderr } = await execAsync(command);
    const elapsed = Date.now() - startTime;
    console.log("[Video API] compressVideo() - FFmpeg completed in", elapsed, "ms");
    if (stderr) {
      console.log("[Video API] compressVideo() - stderr (info):", stderr.slice(0, 500));
    }
  } catch (err) {
    console.error("[Video API] compressVideo() - FFmpeg failed:", err);
    throw err;
  }

  const buffer = await readFile(outputPath);
  console.log("[Video API] compressVideo() - Output size:", `${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
  await unlink(outputPath);

  return {
    base64: buffer.toString("base64"),
    size: buffer.length,
  };
}

async function extractFrames(
  inputPath: string,
  tempDir: string,
  duration: number,
  options: ProcessingOptions
): Promise<{ thumbnail: string; diagnosticFrames: string[] }> {
  console.log("[Video API] extractFrames() - Starting...");
  const { framePositions = [0.15, 0.5, 0.85], thumbnailPosition = 0 } = options;
  const maxDim = options.maxFrameDimension || 1024;
  const quality = Math.round((100 - (options.frameQuality || FRAME_QUALITY)) / 3);

  console.log("[Video API] extractFrames() - Config:", {
    framePositions,
    thumbnailPosition,
    maxDim,
    quality,
    duration,
  });

  // Extract thumbnail
  const thumbnailPath = join(tempDir, "thumbnail.jpg");
  const thumbnailTime = duration * thumbnailPosition;
  const thumbnailCommand = `ffmpeg -i "${inputPath}" -ss ${thumbnailTime} -vframes 1 -vf "scale='min(${maxDim},iw)':-1" -q:v ${quality} -y "${thumbnailPath}"`;

  console.log("[Video API] extractFrames() - Extracting thumbnail at", thumbnailTime, "seconds");
  try {
    await execAsync(thumbnailCommand);
  } catch (err) {
    console.error("[Video API] extractFrames() - Thumbnail extraction failed:", err);
    throw err;
  }

  const thumbnailBuffer = await readFile(thumbnailPath);
  console.log("[Video API] extractFrames() - Thumbnail size:", `${(thumbnailBuffer.length / 1024).toFixed(1)}KB`);
  await unlink(thumbnailPath);

  // Extract diagnostic frames
  const diagnosticFrames: string[] = [];
  console.log("[Video API] extractFrames() - Extracting", framePositions.length, "diagnostic frames...");

  for (let i = 0; i < framePositions.length; i++) {
    const position = framePositions[i];
    const frameTime = duration * position;
    const framePath = join(tempDir, `frame_${i}.jpg`);

    console.log("[Video API] extractFrames() - Frame", i + 1, "at", frameTime.toFixed(2), "seconds (position:", position, ")");
    try {
      await execAsync(
        `ffmpeg -i "${inputPath}" -ss ${frameTime} -vframes 1 -vf "scale='min(${maxDim},iw)':-1" -q:v ${quality} -y "${framePath}"`
      );
    } catch (err) {
      console.error("[Video API] extractFrames() - Frame", i + 1, "extraction failed:", err);
      throw err;
    }

    const frameBuffer = await readFile(framePath);
    console.log("[Video API] extractFrames() - Frame", i + 1, "size:", `${(frameBuffer.length / 1024).toFixed(1)}KB`);
    await unlink(framePath);
    diagnosticFrames.push(frameBuffer.toString("base64"));
  }

  console.log("[Video API] extractFrames() - Completed:", diagnosticFrames.length, "frames extracted");
  return {
    thumbnail: thumbnailBuffer.toString("base64"),
    diagnosticFrames,
  };
}

async function extractAudio(
  inputPath: string,
  tempDir: string
): Promise<{ base64: string | null; duration: number; hasAudio: boolean; mimeType: string }> {
  console.log("[Video API] extractAudio() - Starting...");
  // Use MP3 format for better compatibility with GPT-4o-audio-preview
  const outputPath = join(tempDir, "audio.mp3");

  try {
    // Extract audio as MP3 (better compatibility with AI models)
    const audioCommand = `ffmpeg -i "${inputPath}" -vn -ar ${AUDIO_SAMPLE_RATE} -ac 1 -c:a libmp3lame -b:a 64k -y "${outputPath}"`;
    console.log("[Video API] extractAudio() - Running:", audioCommand);

    await execAsync(audioCommand);

    const buffer = await readFile(outputPath);
    console.log("[Video API] extractAudio() - Audio extracted:", `${(buffer.length / 1024).toFixed(1)}KB`);
    await unlink(outputPath);

    // Get audio duration
    const { stdout } = await execAsync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${inputPath}"`
    );
    const duration = parseFloat(stdout.trim()) || 0;

    console.log("[Video API] extractAudio() - Completed:", { duration, size: buffer.length });
    return {
      base64: buffer.toString("base64"),
      duration,
      hasAudio: buffer.length > 0,
      mimeType: "audio/mpeg",
    };
  } catch (error) {
    // Video might not have audio
    console.log("[Video API] extractAudio() - No audio track or extraction failed:", error);
    return {
      base64: null,
      duration: 0,
      hasAudio: false,
      mimeType: "audio/mpeg",
    };
  }
}

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
