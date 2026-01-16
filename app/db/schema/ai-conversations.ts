/**
 * AI CONVERSATIONS SCHEMA
 *
 * Stores AI diagnosis conversations with E2E encryption.
 *
 * RELATIONS:
 * - AiConversations (Many) → (1) Users - Each conversation belongs to one user
 * - AiConversations (Many) → (1) Groups - Optional group association
 * - AiConversations (1) → (Many) AiMessages - One conversation has many messages
 * - AiConversations (1) → (Many) ConversationKeys - One key share per authorized user
 * - AiUsageStats (Many) → (1) Users - Daily stats per user
 *
 * ENCRYPTION MODEL:
 * - encryptionScope: "user" (per-conversation key) or "group" (shared key)
 * - "user" scope: Key stored in conversationKeys, wrapped to user's public key
 * - "group" scope: Uses group master key from memberKeyShares
 *
 * WHAT'S ENCRYPTED: title, summary, message content, attachments
 * WHAT'S PLAINTEXT: token counts, costs, categories, timestamps (for analytics)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { groups } from "./groups";

// ============================================
// ENUMS
// ============================================

export const conversationTypeEnum = pgEnum("conversation_type", [
  "diagnosis",
  "general",
  "followup",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

// Determines which key to use for decryption
export const encryptionScopeEnum = pgEnum("encryption_scope", [
  "user",  // Per-conversation key (from conversationKeys)
  "group", // Group master key (from memberKeyShares)
]);

// ============================================
// CONVERSATION KEYS - Per-Conversation Symmetric Key
// ============================================

/**
 * Stores per-conversation key wrapped to each authorized user's public key.
 * One row per (conversation, user) pair.
 */
export const conversationKeys = pgTable(
  "conversation_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => aiConversations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // Conversation key encrypted to this user's X25519 public key
    encryptedConversationKey: text("encrypted_conversation_key").notNull(),

    // Fingerprint of public key used (for verification)
    encryptedForPublicKeyFingerprint: text("encrypted_for_public_key_fingerprint").notNull(),

    // Key version (for rotation tracking)
    keyVersion: integer("key_version").default(1).notNull(),

    // Wrap algorithm (X25519-HKDF-SHA256-AES256GCM)
    wrapAlgorithm: text("wrap_algorithm").default("X25519-HKDF-SHA256-AES256GCM").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("conversation_keys_conversation_user_unique").on(
      table.conversationId,
      table.userId
    ),
    index("conversation_keys_user_id_idx").on(table.userId),
  ]
);

// ============================================
// AI CONVERSATIONS
// ============================================

/**
 * One record per conversation/chat session.
 * Title and summary are encrypted; analytics fields are plaintext.
 */
export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    groupId: uuid("group_id").references(() => groups.id, { onDelete: "set null" }),
    type: conversationTypeEnum("type").default("diagnosis").notNull(),

    // Encryption metadata
    encryptionScope: encryptionScopeEnum("encryption_scope").default("user").notNull(),
    keyVersion: integer("key_version").default(1).notNull(),
    algorithm: text("algorithm").default("AES-GCM-256").notNull(),

    // Encrypted title (ciphertext + IV)
    encryptedTitle: text("encrypted_title"),
    titleIv: text("title_iv"),

    // Encrypted summary (ciphertext + IV)
    encryptedSummary: text("encrypted_summary"),
    summaryIv: text("summary_iv"),

    // Legacy plaintext fields (for v1 migration only)
    title: text("title"),
    summary: text("summary"),
    isEncrypted: boolean("is_encrypted").default(true).notNull(),

    // Conversation state (plaintext for analytics)
    isResolved: boolean("is_resolved").default(false).notNull(),
    category: text("category"),
    severity: text("severity"),
    contractorType: text("contractor_type"),
    estimatedCost: jsonb("estimated_cost"),

    // Usage metrics (plaintext)
    totalInputTokens: integer("total_input_tokens").default(0).notNull(),
    totalOutputTokens: integer("total_output_tokens").default(0).notNull(),
    totalCostUsd: text("total_cost_usd").default("0"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  },
  (table) => [
    index("ai_conversations_user_id_idx").on(table.userId),
    index("ai_conversations_group_id_idx").on(table.groupId),
    index("ai_conversations_encryption_scope_idx").on(table.encryptionScope),
  ]
);

// ============================================
// AI MESSAGES
// ============================================

/**
 * Individual messages within a conversation.
 * Each message has its own encryption metadata (supports mixed encryption).
 */
export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => aiConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: messageRoleEnum("role").notNull(),

    // Encryption metadata
    encryptionScope: encryptionScopeEnum("encryption_scope").default("user").notNull(),
    keyVersion: integer("key_version").default(1).notNull(),
    algorithm: text("algorithm").default("AES-GCM-256").notNull(),
    isEncrypted: boolean("is_encrypted").default(true).notNull(),

    // Encrypted content (ciphertext + IV)
    encryptedContent: text("encrypted_content"),
    contentIv: text("content_iv"),

    // Legacy plaintext content (for v1 migration)
    content: text("content").notNull(),

    // Attachments with encryption metadata
    attachments: jsonb("attachments").$type<AttachmentMetadata[]>(),

    // AI response metadata (plaintext)
    model: text("model"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    costUsd: text("cost_usd"),
    latencyMs: integer("latency_ms"),
    finishReason: text("finish_reason"),
    toolCalls: jsonb("tool_calls"),
    metadata: jsonb("metadata"),
    debugInfo: jsonb("debug_info"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ai_messages_conversation_id_idx").on(table.conversationId),
    index("ai_messages_encryption_scope_idx").on(table.encryptionScope),
  ]
);

// ============================================
// AI USAGE STATS (Plaintext Analytics)
// ============================================

/**
 * Daily aggregated stats for admin dashboard.
 * All plaintext - no encrypted data.
 */
export const aiUsageStats = pgTable(
  "ai_usage_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: timestamp("date").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),

    conversationCount: integer("conversation_count").default(0).notNull(),
    messageCount: integer("message_count").default(0).notNull(),
    imageCount: integer("image_count").default(0).notNull(),
    totalInputTokens: integer("total_input_tokens").default(0).notNull(),
    totalOutputTokens: integer("total_output_tokens").default(0).notNull(),
    totalCostUsd: text("total_cost_usd").default("0"),
    avgLatencyMs: integer("avg_latency_ms"),
    categoryBreakdown: jsonb("category_breakdown"),
    severityBreakdown: jsonb("severity_breakdown"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("ai_usage_stats_date_idx").on(table.date),
    index("ai_usage_stats_user_id_idx").on(table.userId),
  ]
);

// ============================================
// TYPES
// ============================================

export interface AttachmentMetadata {
  type: "image" | "video" | "document";
  storageUrl: string;
  mediaType: string;
  fileName?: string;
  fileSize: number;
  encrypted: true;
  encryptionScope: "user" | "group";
  keyVersion: number;
  algorithm: string;
  iv: string;
}

export type ConversationKey = typeof conversationKeys.$inferSelect;
export type NewConversationKey = typeof conversationKeys.$inferInsert;
export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;
export type AiMessage = typeof aiMessages.$inferSelect;
export type NewAiMessage = typeof aiMessages.$inferInsert;
export type AiUsageStat = typeof aiUsageStats.$inferSelect;
export type NewAiUsageStat = typeof aiUsageStats.$inferInsert;
export type EncryptionScope = "user" | "group";
export type ConversationType = "diagnosis" | "general" | "followup";
export type MessageRole = "user" | "assistant" | "system";
