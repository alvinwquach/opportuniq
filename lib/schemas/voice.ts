import { z } from "zod";

// Supported audio formats for transcription
export const SUPPORTED_AUDIO_FORMATS = [
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
] as const;

// OpenAI TTS voices
export const TTS_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
export type TTSVoice = (typeof TTS_VOICES)[number];

// Language codes (ISO 639-1) supported by Whisper
export const SUPPORTED_LANGUAGES = [
  "en", "vi", "es", "zh", "ko", "ja", "fr", "de", "it", "pt", "ru",
  "ar", "hi", "th", "id", "ms", "tl", "nl", "pl", "tr", "uk", "cs",
  "el", "he", "hu", "ro", "sv", "da", "fi", "no", "sk", "bg", "hr",
  "sl", "sr", "lt", "lv", "et", "ca", "eu", "gl", "cy", "mt", "is",
  "mk", "sq", "bs", "af", "sw", "yo", "zu", "xh", "am", "ne", "si",
  "bn", "gu", "kn", "ml", "mr", "pa", "ta", "te", "ur", "my", "km",
  "lo", "mn", "ka", "az", "kk", "uz", "ky", "tg", "tk", "ps", "sd",
  "fa", "yi", "hy", "be", "eo", "la", "jv", "su", "mg", "mi", "haw",
  "ln", "ha", "sn", "so", "tt", "ba", "lb", "oc", "br", "as", "nn",
  "fo",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Comprehensive language display names
export const LANGUAGE_NAMES: Record<string, string> = {
  // Major world languages
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  ja: "Japanese",
  ko: "Korean",

  // Chinese dialects/variants
  zh: "Chinese",
  "zh-CN": "Mandarin Chinese (Simplified)",
  "zh-TW": "Traditional Chinese (Taiwan)",
  "zh-HK": "Cantonese (Hong Kong)",
  yue: "Cantonese",
  wuu: "Shanghainese (Wu Chinese)",
  nan: "Hokkien/Taiwanese (Min Nan)",
  hak: "Hakka Chinese",
  cmn: "Mandarin Chinese",

  // Southeast Asian languages
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  ms: "Malay",
  tl: "Tagalog",
  fil: "Filipino",
  my: "Burmese",
  km: "Khmer",
  lo: "Lao",
  jv: "Javanese",
  su: "Sundanese",

  // South Asian languages
  bn: "Bengali",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  pa: "Punjabi",
  ta: "Tamil",
  te: "Telugu",
  ur: "Urdu",
  ne: "Nepali",
  si: "Sinhala",
  as: "Assamese",

  // European languages
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  uk: "Ukrainian",
  cs: "Czech",
  el: "Greek",
  he: "Hebrew",
  hu: "Hungarian",
  ro: "Romanian",
  sv: "Swedish",
  da: "Danish",
  fi: "Finnish",
  no: "Norwegian",
  nb: "Norwegian Bokmål",
  nn: "Norwegian Nynorsk",
  sk: "Slovak",
  bg: "Bulgarian",
  hr: "Croatian",
  sl: "Slovenian",
  sr: "Serbian",
  lt: "Lithuanian",
  lv: "Latvian",
  et: "Estonian",
  ca: "Catalan",
  eu: "Basque",
  gl: "Galician",
  cy: "Welsh",
  ga: "Irish",
  gd: "Scottish Gaelic",
  mt: "Maltese",
  is: "Icelandic",
  mk: "Macedonian",
  sq: "Albanian",
  bs: "Bosnian",
  lb: "Luxembourgish",
  oc: "Occitan",
  br: "Breton",
  fo: "Faroese",
  be: "Belarusian",
  hy: "Armenian",
  ka: "Georgian",

  // African languages
  af: "Afrikaans",
  sw: "Swahili",
  yo: "Yoruba",
  zu: "Zulu",
  xh: "Xhosa",
  am: "Amharic",
  ha: "Hausa",
  ig: "Igbo",
  sn: "Shona",
  so: "Somali",
  rw: "Kinyarwanda",
  mg: "Malagasy",
  ln: "Lingala",

  // Central Asian languages
  mn: "Mongolian",
  az: "Azerbaijani",
  kk: "Kazakh",
  uz: "Uzbek",
  ky: "Kyrgyz",
  tg: "Tajik",
  tk: "Turkmen",
  ps: "Pashto",
  sd: "Sindhi",
  fa: "Persian",
  ku: "Kurdish",

  // Pacific languages
  mi: "Māori",
  haw: "Hawaiian",
  sm: "Samoan",
  to: "Tongan",

  // Other languages
  yi: "Yiddish",
  eo: "Esperanto",
  la: "Latin",
  tt: "Tatar",
  ba: "Bashkir",
};

// Transcription request schema (for API route validation)
export const transcribeRequestSchema = z.object({
  // Audio is sent as FormData, validated separately
});

// Transcription response schema
export const transcribeResponseSchema = z.object({
  text: z.string(),
  language: z.string(),
  duration: z.number().optional(),
  confidence: z.number().optional(),
});

export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;

// Synthesize request schema
export const synthesizeRequestSchema = z.object({
  text: z.string().min(1).max(4096, "Text must be under 4096 characters"),
  language: z.string().default("en"),
  voice: z.enum(TTS_VOICES).default("nova"),
  speed: z.number().min(0.25).max(4.0).default(1.0),
});

export type SynthesizeRequest = z.infer<typeof synthesizeRequestSchema>;

// Transcription result (for hook return type)
export interface TranscriptionResult {
  text: string;
  language: string;
  duration?: number;
}

// Voice input hook state
export interface VoiceInputState {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  permissionStatus: PermissionState | "unknown";
  audioLevel: number;
  recordingDuration: number;
}

// TTS hook state
export interface TextToSpeechState {
  isPlaying: boolean;
  isLoading: boolean;
  currentPlayingId: string | null;
  error: string | null;
  volume: number;
  speed: number;
}

// Helper function to get language name
export function getLanguageName(code: string): string {
  // Direct match (e.g., "es" -> "Spanish")
  if (LANGUAGE_NAMES[code]) {
    return LANGUAGE_NAMES[code];
  }

  // Check if the code is already a language name (e.g., "spanish" from Whisper)
  const normalizedCode = code.toLowerCase();
  for (const [, name] of Object.entries(LANGUAGE_NAMES)) {
    if (name.toLowerCase() === normalizedCode) {
      return name; // Return properly capitalized name
    }
  }

  // Fallback: capitalize first letter (e.g., "spanish" -> "Spanish")
  return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
}

// Chinese dialect detection patterns
const CHINESE_DIALECT_PATTERNS: {
  dialect: string;
  code: string;
  patterns: RegExp[];
}[] = [
  {
    dialect: "Cantonese",
    code: "yue",
    patterns: [
      /[係唔嘅咗喺啲嚟佢哋冇]/,
      /[乜嘢點解幾時]/,
      /[咁樣嗰個]/,
    ],
  },
  {
    dialect: "Traditional Chinese (Taiwan)",
    code: "zh-TW",
    patterns: [/[臺灣國語體製發電腦網際網路]/],
  },
  {
    dialect: "Simplified Mandarin",
    code: "zh-CN",
    patterns: [/[这个那个什么怎么样]/],
  },
];

/**
 * Detect Chinese dialect from text
 * Returns the most likely dialect code based on character patterns
 */
export function detectChineseDialect(text: string): string {
  for (const { code, patterns } of CHINESE_DIALECT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return code;
      }
    }
  }
  // Default to Mandarin if no specific dialect detected
  return "zh-CN";
}

/**
 * Normalize language code for translation
 * Handles various formats and aliases
 */
export function normalizeLanguageCode(code: string): string {
  const normalized = code.toLowerCase().trim();

  const aliases: Record<string, string> = {
    chinese: "zh-CN",
    mandarin: "zh-CN",
    cantonese: "yue",
    "chinese-traditional": "zh-TW",
    "chinese-simplified": "zh-CN",
    tagalog: "tl",
    filipino: "fil",
    norwegian: "nb",
    hebrew: "he",
    iw: "he",
    persian: "fa",
    farsi: "fa",
  };

  return aliases[normalized] || normalized;
}

// Helper function to detect best audio format for browser
export function getBestAudioFormat(): string {
  if (typeof window === "undefined") return "audio/webm";

  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return "audio/webm"; // Fallback
}

// Max recording duration in milliseconds
export const MAX_RECORDING_DURATION = 60000; // 60 seconds

// Max audio file size for Whisper API (25MB)
export const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
