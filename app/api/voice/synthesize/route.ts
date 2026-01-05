/**
 * Voice Synthesis (TTS) API Route
 *
 * Accepts text and language, returns audio stream using OpenAI TTS API.
 * Streams the response for faster first-byte playback.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { synthesizeRequestSchema, type TTSVoice } from "@/lib/schemas/voice";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TTS pricing (as of Jan 2025)
const TTS_PRICE_PER_1K_CHARS = 0.015;

// Max text length per request (OpenAI limit is 4096)
const MAX_TEXT_LENGTH = 4096;

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

    // Parse and validate request body
    const body = await request.json();
    const parseResult = synthesizeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { text, voice, speed } = parseResult.data;

    // Truncate text if too long
    const truncatedText = text.length > MAX_TEXT_LENGTH
      ? text.substring(0, MAX_TEXT_LENGTH)
      : text;

    if (text.length > MAX_TEXT_LENGTH) {
      console.warn(
        `[Synthesize API] Text truncated from ${text.length} to ${MAX_TEXT_LENGTH} chars`
      );
    }

    console.log(
      `[Synthesize API] Synthesizing: ${truncatedText.substring(0, 50)}... ` +
        `Voice: ${voice}, Speed: ${speed}, Length: ${truncatedText.length} chars`
    );

    // Call OpenAI TTS API with streaming
    const mp3Response = await openaiClient.audio.speech.create({
      model: "tts-1", // Use tts-1 for speed, tts-1-hd for quality
      voice: voice as TTSVoice,
      input: truncatedText,
      speed: speed,
      response_format: "mp3",
    });

    const latencyMs = Date.now() - startTime;
    const estimatedCost = (truncatedText.length / 1000) * TTS_PRICE_PER_1K_CHARS;

    console.log(
      `[Synthesize API] Success: ${truncatedText.length} chars, ` +
        `Latency: ${latencyMs}ms, Est. cost: $${estimatedCost.toFixed(4)}`
    );

    // Get the audio as a buffer
    const audioBuffer = await mp3Response.arrayBuffer();

    // Return audio as streaming response
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "X-Audio-Duration-Estimate": Math.ceil(truncatedText.length / 15).toString(), // Rough estimate
      },
    });
  } catch (error) {
    console.error("[Synthesize API] Error:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
