/**
 * Voice Transcription API Route
 *
 * Accepts audio files and transcribes them using:
 * - Google Cloud Speech-to-Text for Asian languages with native support:
 *   - Cantonese (yue-Hant-HK) - Traditional Chinese, Hong Kong
 *   - Mandarin Simplified (cmn-Hans-CN) - Mainland China
 *   - Mandarin Traditional (cmn-Hant-TW) - Taiwan
 *   - Vietnamese (vi-VN) - no north/south dialect distinction in API
 *   - Japanese (ja-JP)
 *   - Korean (ko-KR)
 *   - Thai (th-TH)
 * - OpenAI Whisper for other languages (auto-detect)
 *
 * Returns the transcription text along with detected language.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SpeechClient, protos } from "@google-cloud/speech";
import { createClient } from "@/lib/supabase/server";
import { MAX_AUDIO_SIZE } from "@/lib/schemas/voice";
import { db } from "@/app/db/client";
import { voiceApiUsage } from "@/app/db/schema";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google Cloud Speech client
// Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
// Or GOOGLE_CLOUD_PROJECT + default credentials
const speechClient = new SpeechClient();

// Whisper pricing (as of Jan 2025)
const WHISPER_PRICE_PER_MINUTE = 0.006;

// Google Cloud Speech pricing (as of Jan 2025)
const GOOGLE_SPEECH_PRICE_PER_MINUTE = 0.016; // Standard model

/**
 * Google Cloud Speech-to-Text V2 - All supported languages
 * Cantonese (yue-Hant-HK) requires "default" model, others use "latest_long"
 */
const GOOGLE_STT_LANGUAGES: Record<string, { name: string; useDefaultModel?: boolean }> = {
  // Chinese
  "yue-Hant-HK": { name: "Cantonese", useDefaultModel: true },
  "cmn-Hans-CN": { name: "Mandarin (Simplified)" },
  "cmn-Hant-TW": { name: "Mandarin (Traditional)" },
  // East/Southeast Asian
  "ja-JP": { name: "Japanese" },
  "ko-KR": { name: "Korean" },
  "vi-VN": { name: "Vietnamese" },
  "th-TH": { name: "Thai" },
  "id-ID": { name: "Indonesian" },
  "ms-MY": { name: "Malay" },
  "fil-PH": { name: "Filipino" },
  "km-KH": { name: "Khmer" },
  "lo-LA": { name: "Lao" },
  "my-MM": { name: "Burmese" },
  "jv-ID": { name: "Javanese" },
  "su-ID": { name: "Sundanese" },
  "ceb-PH": { name: "Cebuano" },
  // South Asian
  "hi-IN": { name: "Hindi" },
  "bn-BD": { name: "Bengali (Bangladesh)" },
  "bn-IN": { name: "Bengali (India)" },
  "ta-IN": { name: "Tamil" },
  "te-IN": { name: "Telugu" },
  "mr-IN": { name: "Marathi" },
  "gu-IN": { name: "Gujarati" },
  "kn-IN": { name: "Kannada" },
  "ml-IN": { name: "Malayalam" },
  "pa-Guru-IN": { name: "Punjabi" },
  "or-IN": { name: "Odia" },
  "as-IN": { name: "Assamese" },
  "ne-NP": { name: "Nepali" },
  "si-LK": { name: "Sinhala" },
  "ur-PK": { name: "Urdu" },
  // Middle East
  "ar-XA": { name: "Arabic" },
  "ar-EG": { name: "Arabic (Egypt)" },
  "ar-SA": { name: "Arabic (Saudi)" },
  "fa-IR": { name: "Persian" },
  "he-IL": { name: "Hebrew" },
  "tr-TR": { name: "Turkish" },
  // European
  "en-US": { name: "English (US)" },
  "en-GB": { name: "English (UK)" },
  "en-AU": { name: "English (Australia)" },
  "en-IN": { name: "English (India)" },
  "es-ES": { name: "Spanish (Spain)" },
  "es-MX": { name: "Spanish (Mexico)" },
  "es-US": { name: "Spanish (US)" },
  "fr-FR": { name: "French (France)" },
  "fr-CA": { name: "French (Canada)" },
  "de-DE": { name: "German" },
  "it-IT": { name: "Italian" },
  "pt-BR": { name: "Portuguese (Brazil)" },
  "pt-PT": { name: "Portuguese (Portugal)" },
  "nl-NL": { name: "Dutch" },
  "pl-PL": { name: "Polish" },
  "ru-RU": { name: "Russian" },
  "uk-UA": { name: "Ukrainian" },
  "cs-CZ": { name: "Czech" },
  "ro-RO": { name: "Romanian" },
  "hu-HU": { name: "Hungarian" },
  "el-GR": { name: "Greek" },
  "bg-BG": { name: "Bulgarian" },
  "hr-HR": { name: "Croatian" },
  "sk-SK": { name: "Slovak" },
  "sl-SI": { name: "Slovenian" },
  "sr-RS": { name: "Serbian" },
  "da-DK": { name: "Danish" },
  "fi-FI": { name: "Finnish" },
  "no-NO": { name: "Norwegian" },
  "sv-SE": { name: "Swedish" },
  "ca-ES": { name: "Catalan" },
  "gl-ES": { name: "Galician" },
  "eu-ES": { name: "Basque" },
  "ga-IE": { name: "Irish" },
  "cy-GB": { name: "Welsh" },
  "is-IS": { name: "Icelandic" },
  "lv-LV": { name: "Latvian" },
  "lt-LT": { name: "Lithuanian" },
  "et-EE": { name: "Estonian" },
  "mt-MT": { name: "Maltese" },
  "sq-AL": { name: "Albanian" },
  "mk-MK": { name: "Macedonian" },
  "bs-BA": { name: "Bosnian" },
  "ka-GE": { name: "Georgian" },
  "hy-AM": { name: "Armenian" },
  "az-AZ": { name: "Azerbaijani" },
  "kk-KZ": { name: "Kazakh" },
  "uz-UZ": { name: "Uzbek" },
  // African
  "af-ZA": { name: "Afrikaans" },
  "sw": { name: "Swahili" },
  "zu-ZA": { name: "Zulu" },
  "am-ET": { name: "Amharic" },
};

/**
 * Resolve language hint to Google Cloud STT code
 */
function resolveLanguageCode(hint: string): string | null {
  // Direct match (case-sensitive for BCP-47 codes)
  if (GOOGLE_STT_LANGUAGES[hint]) return hint;

  const normalized = hint.toLowerCase().trim();

  // Check case-insensitive match
  for (const code of Object.keys(GOOGLE_STT_LANGUAGES)) {
    if (code.toLowerCase() === normalized) return code;
  }

  // Common aliases
  const aliases: Record<string, string> = {
    // Chinese
    "cantonese": "yue-Hant-HK", "yue-hk": "yue-Hant-HK", "zh-hk": "yue-Hant-HK",
    "mandarin": "cmn-Hans-CN", "chinese": "cmn-Hans-CN", "zh-cn": "cmn-Hans-CN",
    "taiwanese": "cmn-Hant-TW", "zh-tw": "cmn-Hant-TW",
    // Asian
    "japanese": "ja-JP", "ja": "ja-JP",
    "korean": "ko-KR", "ko": "ko-KR",
    "vietnamese": "vi-VN", "vi": "vi-VN",
    "thai": "th-TH", "th": "th-TH",
    "indonesian": "id-ID", "id": "id-ID",
    "malay": "ms-MY", "ms": "ms-MY",
    "filipino": "fil-PH", "tagalog": "fil-PH", "fil": "fil-PH",
    "khmer": "km-KH", "cambodian": "km-KH",
    "hindi": "hi-IN", "hi": "hi-IN",
    "bengali": "bn-IN", "bn": "bn-IN",
    "tamil": "ta-IN", "ta": "ta-IN",
    "telugu": "te-IN", "te": "te-IN",
    "urdu": "ur-PK", "ur": "ur-PK",
    // Middle East
    "arabic": "ar-XA", "ar": "ar-XA",
    "persian": "fa-IR", "farsi": "fa-IR", "fa": "fa-IR",
    "hebrew": "he-IL", "he": "he-IL",
    "turkish": "tr-TR", "tr": "tr-TR",
    // European
    "english": "en-US", "en": "en-US",
    "spanish": "es-ES", "es": "es-ES",
    "french": "fr-FR", "fr": "fr-FR",
    "german": "de-DE", "de": "de-DE",
    "italian": "it-IT", "it": "it-IT",
    "portuguese": "pt-BR", "pt": "pt-BR",
    "dutch": "nl-NL", "nl": "nl-NL",
    "polish": "pl-PL", "pl": "pl-PL",
    "russian": "ru-RU", "ru": "ru-RU",
    "ukrainian": "uk-UA", "uk": "uk-UA",
    "greek": "el-GR", "el": "el-GR",
    "czech": "cs-CZ", "cs": "cs-CZ",
    "romanian": "ro-RO", "ro": "ro-RO",
    "hungarian": "hu-HU", "hu": "hu-HU",
    "swedish": "sv-SE", "sv": "sv-SE",
    "danish": "da-DK", "da": "da-DK",
    "norwegian": "no-NO", "no": "no-NO",
    "finnish": "fi-FI", "fi": "fi-FI",
    // African
    "afrikaans": "af-ZA", "af": "af-ZA",
    "swahili": "sw",
  };

  return aliases[normalized] || null;
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text
 */
async function transcribeWithGoogle(
  audioBuffer: Buffer,
  mimeType: string,
  languageCode: string
): Promise<{ text: string; language: string; duration: number }> {
  // Map MIME types to Google Cloud encoding
  const encodingMap: Record<string, protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding> = {
    "audio/webm": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,
    "audio/ogg": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.OGG_OPUS,
    "audio/flac": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.FLAC,
    "audio/wav": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
    "audio/mp3": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
    "audio/mpeg": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
    "audio/mp4": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
    "audio/m4a": protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
  };

  const encoding = encodingMap[mimeType] || protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED;

  // Get config for this language
  const langConfig = GOOGLE_STT_LANGUAGES[languageCode];
  const model = langConfig?.useDefaultModel ? "default" : "latest_long";

  const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
    config: {
      encoding,
      sampleRateHertz: 48000,
      languageCode,
      enableAutomaticPunctuation: true,
      model,
    },
    audio: {
      content: audioBuffer.toString("base64"),
    },
  };

  console.log(`[Transcribe API] Using Google Cloud Speech: ${languageCode}, model: ${model}`);

  const [response] = await speechClient.recognize(request);

  const transcription = response.results
    ?.map((result) => result.alternatives?.[0]?.transcript || "")
    .join(" ")
    .trim() || "";

  // Estimate duration from audio buffer size
  const estimatedDuration = audioBuffer.length / (48000 * 2);

  return {
    text: transcription,
    language: languageCode,
    duration: estimatedDuration,
  };
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

    // Get optional language hint from client
    // If provided, we'll use Google Cloud STT for that language
    // If not provided, Whisper auto-detects the language
    const languageHint = formData.get("languageHint") as string | null;

    console.log(
      `[Transcribe API] Processing: ${audioFile.name}, ${audioFile.size} bytes, hint: ${languageHint || "auto"}`
    );

    let transcribedText: string;
    let detectedLanguage: string;
    let duration: number;
    let estimatedCost: number;

    // Resolve language hint to Google Cloud code
    const googleLangCode = languageHint ? resolveLanguageCode(languageHint) : null;
    const googleLangConfig = googleLangCode ? GOOGLE_STT_LANGUAGES[googleLangCode] : null;
    const useGoogleCloud = googleLangCode && process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (useGoogleCloud && googleLangCode) {
      // Use Google Cloud for specified language
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const googleResult = await transcribeWithGoogle(audioBuffer, contentType, googleLangCode);

      transcribedText = googleResult.text;
      detectedLanguage = googleResult.language;
      duration = googleResult.duration;

      const durationMinutes = duration / 60;
      estimatedCost = durationMinutes * GOOGLE_SPEECH_PRICE_PER_MINUTE;

      const latencyMs = Date.now() - startTime;
      const model = googleLangConfig?.useDefaultModel ? "default" : "latest_long";
      console.log(
        `[Transcribe API] Google STT (${googleLangConfig?.name || googleLangCode}): "${transcribedText.substring(0, 50)}..." ` +
          `${duration.toFixed(1)}s, ${latencyMs}ms, $${estimatedCost.toFixed(4)}`
      );

      // Log usage (non-blocking)
      db.insert(voiceApiUsage).values({
        userId: user.id,
        apiType: "stt",
        provider: "google_stt",
        languageCode: detectedLanguage,
        durationMs: Math.round(duration * 1000),
        latencyMs,
        costUsd: estimatedCost.toFixed(6),
        model,
        success: 1,
      }).catch((err) => console.error("[Transcribe API] Failed to log usage:", err));
    } else {
      // Use OpenAI Whisper for auto-detection
      if (languageHint && !googleLangCode) {
        console.log(`[Transcribe API] Unknown hint "${languageHint}", using Whisper auto-detect`);
      } else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && googleLangCode) {
        console.log("[Transcribe API] Google credentials not set, using Whisper");
      }

      const transcription = await openaiClient.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
      });

      transcribedText = transcription.text;
      detectedLanguage = transcription.language || "en";
      duration = transcription.duration || 0;

      const durationMinutes = duration / 60;
      estimatedCost = durationMinutes * WHISPER_PRICE_PER_MINUTE;

      const latencyMs = Date.now() - startTime;
      console.log(
        `[Transcribe API] Whisper Success: ${transcribedText.substring(0, 50)}... ` +
          `Language: ${detectedLanguage}, Duration: ${duration}s, ` +
          `Latency: ${latencyMs}ms, Est. cost: $${estimatedCost.toFixed(4)}`
      );

      // Log usage to database (non-blocking)
      db.insert(voiceApiUsage).values({
        userId: user.id,
        apiType: "stt",
        provider: "openai_whisper",
        languageCode: detectedLanguage,
        durationMs: Math.round(duration * 1000),
        latencyMs,
        costUsd: estimatedCost.toFixed(6),
        model: "whisper-1",
        success: 1,
      }).catch((err) => console.error("[Transcribe API] Failed to log usage:", err));
    }

    return NextResponse.json({
      text: transcribedText,
      language: detectedLanguage,
      duration,
    });
  } catch (error) {
    console.error("[Transcribe API] Error:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    // Handle Google Cloud errors
    if (error instanceof Error && error.message.includes("google")) {
      return NextResponse.json(
        { error: `Google Cloud Speech error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
