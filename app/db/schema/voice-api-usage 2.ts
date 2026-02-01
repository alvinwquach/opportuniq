/**
 * VOICE API USAGE SCHEMA
 *
 * Tracks usage of voice APIs (Speech-to-Text and Text-to-Speech)
 * across different providers (OpenAI Whisper, Google Cloud STT/TTS).
 *
 * Used for monitoring, billing, and analytics in the admin dashboard.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ============================================
// ENUMS
// ============================================

export const voiceApiTypeEnum = pgEnum("voice_api_type", [
  "stt", // Speech-to-Text (transcription)
  "tts", // Text-to-Speech (synthesis)
]);

export const voiceApiProviderEnum = pgEnum("voice_api_provider", [
  "openai_whisper",     // OpenAI Whisper for STT
  "openai_tts",         // OpenAI TTS
  "google_stt",         // Google Cloud Speech-to-Text
  "google_tts",         // Google Cloud Text-to-Speech
]);

// ============================================
// VOICE API USAGE TABLE
// ============================================

/**
 * Logs each voice API call with provider, duration, cost, and metadata.
 */
export const voiceApiUsage = pgTable(
  "voice_api_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // API type and provider
    apiType: voiceApiTypeEnum("api_type").notNull(),
    provider: voiceApiProviderEnum("provider").notNull(),

    // Language/locale used
    languageCode: text("language_code"), // e.g., "en-US", "yue-HK", "zh-CN"

    // Usage metrics
    durationMs: integer("duration_ms"), // Audio duration for STT
    characterCount: integer("character_count"), // Character count for TTS
    latencyMs: integer("latency_ms"), // API response time

    // Cost tracking
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),

    // Model/voice info
    model: text("model"), // e.g., "whisper-1", "default", "tts-1"
    voiceName: text("voice_name"), // e.g., "nova", "yue-HK-Standard-A"

    // Request metadata
    conversationId: uuid("conversation_id"), // Optional: link to conversation
    messageId: uuid("message_id"), // Optional: link to message
    metadata: text("metadata"), // JSON string for additional data

    // Status
    success: integer("success").default(1).notNull(), // 1 = success, 0 = error
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("voice_api_usage_user_id_idx").on(table.userId),
    index("voice_api_usage_api_type_idx").on(table.apiType),
    index("voice_api_usage_provider_idx").on(table.provider),
    index("voice_api_usage_created_at_idx").on(table.createdAt),
    index("voice_api_usage_language_code_idx").on(table.languageCode),
  ]
);

// ============================================
// TYPES
// ============================================

export type VoiceApiUsage = typeof voiceApiUsage.$inferSelect;
export type NewVoiceApiUsage = typeof voiceApiUsage.$inferInsert;
export type VoiceApiType = "stt" | "tts";
export type VoiceApiProvider = "openai_whisper" | "openai_tts" | "google_stt" | "google_tts";
