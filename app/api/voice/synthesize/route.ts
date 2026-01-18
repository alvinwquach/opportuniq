/**
 * Voice Synthesis (TTS) API Route
 *
 * Accepts text and language, returns audio stream.
 * - Uses Google Cloud TTS for 45+ languages with native voice support
 * - Falls back to OpenAI TTS for unsupported languages
 *
 * Streams the response for faster first-byte playback.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import { createClient } from "@/lib/supabase/server";
import { synthesizeRequestSchema, type TTSVoice } from "@/lib/schemas/voice";
import { db } from "@/app/db/client";
import { voiceApiUsage } from "@/app/db/schema";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google Cloud TTS client
// Requires GOOGLE_APPLICATION_CREDENTIALS env var
const googleTtsClient = new TextToSpeechClient();

// TTS pricing (as of Jan 2025)
const OPENAI_TTS_PRICE_PER_1K_CHARS = 0.015;
const GOOGLE_TTS_PRICE_PER_1M_CHARS = 4.0; // Standard voices

// Max text length per request (OpenAI limit is 4096)
const MAX_TEXT_LENGTH = 4096;

/**
 * Google Cloud TTS voice configuration - All supported languages
 * See: https://cloud.google.com/text-to-speech/docs/voices
 */
const GOOGLE_TTS_CONFIG: Record<string, { languageCode: string; voiceName: string; name: string }> = {
  // African
  "af-ZA": { languageCode: "af-ZA", voiceName: "af-ZA-Standard-A", name: "Afrikaans" },

  // Arabic
  "ar-XA": { languageCode: "ar-XA", voiceName: "ar-XA-Standard-A", name: "Arabic" },

  // Asian - Chinese
  "yue-HK": { languageCode: "yue-HK", voiceName: "yue-HK-Standard-A", name: "Cantonese" },
  "cmn-CN": { languageCode: "cmn-CN", voiceName: "cmn-CN-Standard-A", name: "Mandarin (Simplified)" },
  "cmn-TW": { languageCode: "cmn-TW", voiceName: "cmn-TW-Standard-A", name: "Mandarin (Traditional)" },

  // Asian - East/Southeast
  "ja-JP": { languageCode: "ja-JP", voiceName: "ja-JP-Standard-A", name: "Japanese" },
  "ko-KR": { languageCode: "ko-KR", voiceName: "ko-KR-Standard-A", name: "Korean" },
  "vi-VN": { languageCode: "vi-VN", voiceName: "vi-VN-Standard-A", name: "Vietnamese" },
  "th-TH": { languageCode: "th-TH", voiceName: "th-TH-Standard-A", name: "Thai" },
  "id-ID": { languageCode: "id-ID", voiceName: "id-ID-Standard-A", name: "Indonesian" },
  "fil-PH": { languageCode: "fil-PH", voiceName: "fil-PH-Standard-A", name: "Filipino" },
  "ms-MY": { languageCode: "ms-MY", voiceName: "ms-MY-Standard-A", name: "Malay" },

  // Asian - South
  "bn-IN": { languageCode: "bn-IN", voiceName: "bn-IN-Standard-A", name: "Bengali" },
  "gu-IN": { languageCode: "gu-IN", voiceName: "gu-IN-Standard-A", name: "Gujarati" },
  "hi-IN": { languageCode: "hi-IN", voiceName: "hi-IN-Standard-A", name: "Hindi" },
  "kn-IN": { languageCode: "kn-IN", voiceName: "kn-IN-Standard-A", name: "Kannada" },
  "ml-IN": { languageCode: "ml-IN", voiceName: "ml-IN-Standard-A", name: "Malayalam" },
  "mr-IN": { languageCode: "mr-IN", voiceName: "mr-IN-Standard-A", name: "Marathi" },
  "pa-IN": { languageCode: "pa-IN", voiceName: "pa-IN-Standard-A", name: "Punjabi" },
  "ta-IN": { languageCode: "ta-IN", voiceName: "ta-IN-Standard-A", name: "Tamil" },
  "te-IN": { languageCode: "te-IN", voiceName: "te-IN-Standard-A", name: "Telugu" },

  // European - English
  "en-AU": { languageCode: "en-AU", voiceName: "en-AU-Standard-A", name: "English (Australia)" },
  "en-GB": { languageCode: "en-GB", voiceName: "en-GB-Standard-A", name: "English (UK)" },
  "en-IN": { languageCode: "en-IN", voiceName: "en-IN-Standard-A", name: "English (India)" },
  "en-US": { languageCode: "en-US", voiceName: "en-US-Standard-A", name: "English (US)" },

  // European - Germanic
  "de-DE": { languageCode: "de-DE", voiceName: "de-DE-Standard-A", name: "German" },
  "nl-BE": { languageCode: "nl-BE", voiceName: "nl-BE-Standard-A", name: "Dutch (Belgium)" },
  "nl-NL": { languageCode: "nl-NL", voiceName: "nl-NL-Standard-A", name: "Dutch (Netherlands)" },
  "sv-SE": { languageCode: "sv-SE", voiceName: "sv-SE-Standard-A", name: "Swedish" },
  "da-DK": { languageCode: "da-DK", voiceName: "da-DK-Standard-A", name: "Danish" },
  "nb-NO": { languageCode: "nb-NO", voiceName: "nb-NO-Standard-A", name: "Norwegian" },
  "is-IS": { languageCode: "is-IS", voiceName: "is-IS-Standard-A", name: "Icelandic" },

  // European - Romance
  "es-ES": { languageCode: "es-ES", voiceName: "es-ES-Standard-A", name: "Spanish (Spain)" },
  "es-US": { languageCode: "es-US", voiceName: "es-US-Standard-A", name: "Spanish (US)" },
  "fr-CA": { languageCode: "fr-CA", voiceName: "fr-CA-Standard-A", name: "French (Canada)" },
  "fr-FR": { languageCode: "fr-FR", voiceName: "fr-FR-Standard-A", name: "French (France)" },
  "it-IT": { languageCode: "it-IT", voiceName: "it-IT-Standard-A", name: "Italian" },
  "pt-BR": { languageCode: "pt-BR", voiceName: "pt-BR-Standard-A", name: "Portuguese (Brazil)" },
  "pt-PT": { languageCode: "pt-PT", voiceName: "pt-PT-Standard-A", name: "Portuguese (Portugal)" },
  "ro-RO": { languageCode: "ro-RO", voiceName: "ro-RO-Standard-A", name: "Romanian" },
  "ca-ES": { languageCode: "ca-ES", voiceName: "ca-ES-Standard-A", name: "Catalan" },
  "gl-ES": { languageCode: "gl-ES", voiceName: "gl-ES-Standard-A", name: "Galician" },

  // European - Slavic
  "bg-BG": { languageCode: "bg-BG", voiceName: "bg-BG-Standard-A", name: "Bulgarian" },
  "cs-CZ": { languageCode: "cs-CZ", voiceName: "cs-CZ-Standard-A", name: "Czech" },
  "hr-HR": { languageCode: "hr-HR", voiceName: "hr-HR-Standard-A", name: "Croatian" },
  "pl-PL": { languageCode: "pl-PL", voiceName: "pl-PL-Standard-A", name: "Polish" },
  "ru-RU": { languageCode: "ru-RU", voiceName: "ru-RU-Standard-A", name: "Russian" },
  "sk-SK": { languageCode: "sk-SK", voiceName: "sk-SK-Standard-A", name: "Slovak" },
  "sl-SI": { languageCode: "sl-SI", voiceName: "sl-SI-Standard-A", name: "Slovenian" },
  "sr-RS": { languageCode: "sr-RS", voiceName: "sr-RS-Standard-A", name: "Serbian" },
  "uk-UA": { languageCode: "uk-UA", voiceName: "uk-UA-Standard-A", name: "Ukrainian" },

  // European - Baltic
  "lt-LT": { languageCode: "lt-LT", voiceName: "lt-LT-Standard-A", name: "Lithuanian" },
  "lv-LV": { languageCode: "lv-LV", voiceName: "lv-LV-Standard-A", name: "Latvian" },
  "et-EE": { languageCode: "et-EE", voiceName: "et-EE-Standard-A", name: "Estonian" },

  // European - Other
  "el-GR": { languageCode: "el-GR", voiceName: "el-GR-Standard-A", name: "Greek" },
  "fi-FI": { languageCode: "fi-FI", voiceName: "fi-FI-Standard-A", name: "Finnish" },
  "hu-HU": { languageCode: "hu-HU", voiceName: "hu-HU-Standard-A", name: "Hungarian" },
  "tr-TR": { languageCode: "tr-TR", voiceName: "tr-TR-Standard-A", name: "Turkish" },
  "eu-ES": { languageCode: "eu-ES", voiceName: "eu-ES-Standard-A", name: "Basque" },

  // Middle Eastern
  "he-IL": { languageCode: "he-IL", voiceName: "he-IL-Standard-A", name: "Hebrew" },
};

/**
 * Resolve language hint to Google Cloud TTS code
 */
function resolveTTSLanguageCode(hint: string): string | null {
  // Direct match
  if (GOOGLE_TTS_CONFIG[hint]) return hint;

  const normalized = hint.toLowerCase().trim();

  // Case-insensitive match against existing codes
  for (const code of Object.keys(GOOGLE_TTS_CONFIG)) {
    if (code.toLowerCase() === normalized) return code;
  }

  // Common aliases and language names
  const aliases: Record<string, string> = {
    // Chinese
    "cantonese": "yue-HK", "yue": "yue-HK", "zh-hk": "yue-HK", "yue-hant-hk": "yue-HK",
    "mandarin": "cmn-CN", "chinese": "cmn-CN", "zh-cn": "cmn-CN", "cmn-hans-cn": "cmn-CN", "cmn": "cmn-CN",
    "taiwanese": "cmn-TW", "zh-tw": "cmn-TW", "cmn-hant-tw": "cmn-TW",

    // East/Southeast Asian
    "japanese": "ja-JP", "ja": "ja-JP",
    "korean": "ko-KR", "ko": "ko-KR",
    "vietnamese": "vi-VN", "vi": "vi-VN",
    "thai": "th-TH", "th": "th-TH",
    "indonesian": "id-ID", "id": "id-ID", "bahasa": "id-ID",
    "filipino": "fil-PH", "tagalog": "fil-PH", "fil": "fil-PH",
    "malay": "ms-MY", "ms": "ms-MY",

    // South Asian
    "hindi": "hi-IN", "hi": "hi-IN",
    "bengali": "bn-IN", "bn": "bn-IN", "bangla": "bn-IN",
    "tamil": "ta-IN", "ta": "ta-IN",
    "telugu": "te-IN", "te": "te-IN",
    "gujarati": "gu-IN", "gu": "gu-IN",
    "kannada": "kn-IN", "kn": "kn-IN",
    "malayalam": "ml-IN", "ml": "ml-IN",
    "marathi": "mr-IN", "mr": "mr-IN",
    "punjabi": "pa-IN", "pa": "pa-IN",

    // English
    "english": "en-US", "en": "en-US",
    "british": "en-GB", "uk english": "en-GB",
    "australian": "en-AU", "aussie": "en-AU",

    // Germanic
    "german": "de-DE", "de": "de-DE", "deutsch": "de-DE",
    "dutch": "nl-NL", "nl": "nl-NL", "nederlands": "nl-NL",
    "swedish": "sv-SE", "sv": "sv-SE", "svenska": "sv-SE",
    "danish": "da-DK", "da": "da-DK", "dansk": "da-DK",
    "norwegian": "nb-NO", "nb": "nb-NO", "norsk": "nb-NO",
    "icelandic": "is-IS", "is": "is-IS",

    // Romance
    "spanish": "es-ES", "es": "es-ES", "español": "es-ES", "espanol": "es-ES",
    "french": "fr-FR", "fr": "fr-FR", "français": "fr-FR", "francais": "fr-FR",
    "italian": "it-IT", "it": "it-IT", "italiano": "it-IT",
    "portuguese": "pt-BR", "pt": "pt-BR", "português": "pt-BR", "portugues": "pt-BR",
    "brazilian": "pt-BR",
    "romanian": "ro-RO", "ro": "ro-RO",
    "catalan": "ca-ES", "ca": "ca-ES", "català": "ca-ES",
    "galician": "gl-ES", "gl": "gl-ES", "galego": "gl-ES",

    // Slavic
    "russian": "ru-RU", "ru": "ru-RU", "русский": "ru-RU",
    "polish": "pl-PL", "pl": "pl-PL", "polski": "pl-PL",
    "czech": "cs-CZ", "cs": "cs-CZ", "čeština": "cs-CZ",
    "slovak": "sk-SK", "sk": "sk-SK",
    "bulgarian": "bg-BG", "bg": "bg-BG",
    "ukrainian": "uk-UA", "uk": "uk-UA", "українська": "uk-UA",
    "serbian": "sr-RS", "sr": "sr-RS",
    "croatian": "hr-HR", "hr": "hr-HR",
    "slovenian": "sl-SI", "sl": "sl-SI",

    // Baltic
    "lithuanian": "lt-LT", "lt": "lt-LT",
    "latvian": "lv-LV", "lv": "lv-LV",
    "estonian": "et-EE", "et": "et-EE",

    // Other European
    "greek": "el-GR", "el": "el-GR", "ελληνικά": "el-GR",
    "finnish": "fi-FI", "fi": "fi-FI", "suomi": "fi-FI",
    "hungarian": "hu-HU", "hu": "hu-HU", "magyar": "hu-HU",
    "turkish": "tr-TR", "tr": "tr-TR", "türkçe": "tr-TR",
    "basque": "eu-ES", "eu": "eu-ES", "euskara": "eu-ES",

    // Middle Eastern
    "arabic": "ar-XA", "ar": "ar-XA", "العربية": "ar-XA",
    "hebrew": "he-IL", "he": "he-IL", "עברית": "he-IL",

    // African
    "afrikaans": "af-ZA", "af": "af-ZA",
  };

  return aliases[normalized] || null;
}

/**
 * Synthesize speech using Google Cloud TTS
 * Supports multiple Asian languages with native voices
 */
async function synthesizeWithGoogle(
  text: string,
  languageCode: string = "yue-HK",
  voiceName: string = "yue-HK-Standard-A"
): Promise<Buffer> {
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      speakingRate: 1.0,
      pitch: 0,
    },
  };

  const [response] = await googleTtsClient.synthesizeSpeech(request);
  return Buffer.from(response.audioContent as Uint8Array);
}

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

    const { text, voice, speed, language } = parseResult.data;

    // Truncate text if too long
    const truncatedText = text.length > MAX_TEXT_LENGTH
      ? text.substring(0, MAX_TEXT_LENGTH)
      : text;

    if (text.length > MAX_TEXT_LENGTH) {
      console.warn(
        `[Synthesize API] Text truncated from ${text.length} to ${MAX_TEXT_LENGTH} chars`
      );
    }

    // Resolve language to Google Cloud code
    const googleLangCode = language ? resolveTTSLanguageCode(language) : null;
    const googleVoiceConfig = googleLangCode ? GOOGLE_TTS_CONFIG[googleLangCode] : null;
    const useGoogleTts = googleVoiceConfig && process.env.GOOGLE_APPLICATION_CREDENTIALS;

    let audioBuffer: ArrayBuffer;
    let estimatedCost: number;

    if (useGoogleTts && googleVoiceConfig) {
      console.log(
        `[Synthesize API] Google TTS (${googleVoiceConfig.name}): ${truncatedText.substring(0, 50)}... ${truncatedText.length} chars`
      );

      const googleBuffer = await synthesizeWithGoogle(
        truncatedText,
        googleVoiceConfig.languageCode,
        googleVoiceConfig.voiceName
      );
      audioBuffer = googleBuffer;
      estimatedCost = (truncatedText.length / 1_000_000) * GOOGLE_TTS_PRICE_PER_1M_CHARS;

      const latencyMs = Date.now() - startTime;
      console.log(
        `[Synthesize API] Google TTS Success: ${truncatedText.length} chars, ${latencyMs}ms, $${estimatedCost.toFixed(6)}`
      );

      // Log usage (non-blocking)
      db.insert(voiceApiUsage).values({
        userId: user.id,
        apiType: "tts",
        provider: "google_tts",
        languageCode: googleVoiceConfig.languageCode,
        characterCount: truncatedText.length,
        latencyMs,
        costUsd: estimatedCost.toFixed(6),
        voiceName: googleVoiceConfig.voiceName,
        success: 1,
      }).catch((err) => console.error("[Synthesize API] Failed to log usage:", err));
    } else {
      // Use OpenAI TTS for unsupported languages or no Google credentials
      if (language && !googleLangCode) {
        console.log(`[Synthesize API] Unknown language "${language}", using OpenAI`);
      } else if (googleVoiceConfig && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log("[Synthesize API] Google credentials not set, using OpenAI");
      }

      console.log(
        `[Synthesize API] Using OpenAI TTS: ${truncatedText.substring(0, 50)}... ` +
          `Voice: ${voice}, Speed: ${speed}, Length: ${truncatedText.length} chars`
      );

      const mp3Response = await openaiClient.audio.speech.create({
        model: "tts-1",
        voice: voice as TTSVoice,
        input: truncatedText,
        speed: speed,
        response_format: "mp3",
      });

      audioBuffer = await mp3Response.arrayBuffer();
      estimatedCost = (truncatedText.length / 1000) * OPENAI_TTS_PRICE_PER_1K_CHARS;

      const latencyMs = Date.now() - startTime;
      console.log(
        `[Synthesize API] OpenAI TTS Success: ${truncatedText.length} chars, ` +
          `Latency: ${latencyMs}ms, Est. cost: $${estimatedCost.toFixed(4)}`
      );

      // Log usage to database (non-blocking)
      db.insert(voiceApiUsage).values({
        userId: user.id,
        apiType: "tts",
        provider: "openai_tts",
        languageCode: language || "en",
        characterCount: truncatedText.length,
        latencyMs,
        costUsd: estimatedCost.toFixed(6),
        model: "tts-1",
        voiceName: voice,
        success: 1,
      }).catch((err) => console.error("[Synthesize API] Failed to log usage:", err));
    }

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
        "X-Audio-Duration-Estimate": Math.ceil(truncatedText.length / 15).toString(),
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

    // Handle Google Cloud errors
    if (error instanceof Error && error.message.includes("google")) {
      return NextResponse.json(
        { error: `Google Cloud TTS error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
