/**
 * Voice Transcription API Route
 *
 * Accepts audio files and transcribes them using OpenAI Whisper API.
 * Returns the transcription text along with detected language.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { MAX_AUDIO_SIZE } from "@/lib/schemas/voice";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Detect if Chinese text is Traditional (likely Cantonese) or Simplified (likely Mandarin)
 * Uses character frequency analysis - Traditional Chinese has specific characters
 * that don't exist in Simplified Chinese
 */
function detectTraditionalChinese(text: string): boolean {
  // Common Traditional-only characters (not in Simplified)
  // These are characters that were simplified in Simplified Chinese
  const traditionalOnlyChars = /[與個國會說對開頭過點電話這種請問題時間視頻認識語說話聽過經過學會這個為什麼東西機關國家問題開門關門電腦網路]/;

  // Common Simplified-only characters
  const simplifiedOnlyChars = /[与个国会说对开头过点电话这种请问题时间视频认识语说话听过经过学会这个为什么东西机关国家问题开门关门电脑网络]/;

  const traditionalCount = (text.match(traditionalOnlyChars) || []).length;
  const simplifiedCount = (text.match(simplifiedOnlyChars) || []).length;

  // If we find more Traditional-specific characters, it's likely Cantonese/Traditional
  // Also check for Cantonese-specific particles like 嘅, 咗, 啲, 嚟, 喺, 唔, 冇, 嗰
  const cantoneseParticles = /[嘅咗啲嚟喺唔冇嗰佢哋點]/;
  const cantoneseCount = (text.match(cantoneseParticles) || []).length;

  return traditionalCount > simplifiedCount || cantoneseCount > 0;
}

// Whisper pricing (as of Jan 2025)
const WHISPER_PRICE_PER_MINUTE = 0.006;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate file size
    if (audioFile.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "Audio file too large. Maximum size is 25MB." },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes = [
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/flac",
      "audio/m4a",
    ];
    const contentType = audioFile.type.split(";")[0]; // Remove codecs part
    if (!validTypes.some((type) => contentType.startsWith(type.split("/")[0]))) {
      return NextResponse.json(
        { error: `Unsupported audio format: ${audioFile.type}` },
        { status: 400 }
      );
    }

    console.log(
      `[Transcribe API] Processing audio: ${audioFile.name}, size: ${audioFile.size}, type: ${audioFile.type}`
    );

    // Convert File to the format OpenAI expects
    // OpenAI SDK accepts File objects directly in Node.js 20+
    const transcription = await openaiClient.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json", // Get language detection
    });

    const latencyMs = Date.now() - startTime;
    const durationMinutes = (transcription.duration || 0) / 60;
    const estimatedCost = durationMinutes * WHISPER_PRICE_PER_MINUTE;

    // Detect Chinese variant (Traditional = likely Cantonese, Simplified = likely Mandarin)
    let detectedLanguage = transcription.language || "en";
    if (detectedLanguage === "zh") {
      const isTraditional = detectTraditionalChinese(transcription.text);
      detectedLanguage = isTraditional ? "zh-HK" : "zh-CN"; // zh-HK for Cantonese, zh-CN for Mandarin
      console.log(`[Transcribe API] Chinese variant detected: ${isTraditional ? "Traditional (Cantonese)" : "Simplified (Mandarin)"}`);
    }

    console.log(
      `[Transcribe API] Success: ${transcription.text.substring(0, 50)}... ` +
        `Language: ${detectedLanguage}, Duration: ${transcription.duration}s, ` +
        `Latency: ${latencyMs}ms, Est. cost: $${estimatedCost.toFixed(4)}`
    );

    return NextResponse.json({
      text: transcription.text,
      language: detectedLanguage,
      duration: transcription.duration,
    });
  } catch (error) {
    console.error("[Transcribe API] Error:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
