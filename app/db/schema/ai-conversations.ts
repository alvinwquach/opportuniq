/**
 * AI CONVERSATIONS SCHEMA - Photo diagnosis and AI chat
 *
 * PURPOSE:
 * Stores AI-powered diagnosis conversations with message metadata
 * for admin dashboard tracking, analytics, and user conversation history.
 *
 * PRIVACY:
 * - Attachments are end-to-end encrypted using group's master key
 * - Server stores encrypted blobs in Supabase Storage
 * - Only group members with decryption key can view attachments
 * - Admin sees metadata only (file size, type, timestamp)
 *
 * WORKFLOW:
 * 1. User starts conversation → new conversation record created
 * 2. User sends message (text/photo) → photo encrypted client-side, stored in storage
 * 3. AI responds → response stored with token usage, model info
 * 4. User shares with group → conversation linked to groupId
 * 5. Group members can view → decrypt using group master key
 */

import { pgTable, uuid, text, timestamp, integer, jsonb, pgEnum, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { groups } from "./groups";

/**
 * CONVERSATION TYPE ENUM
 */
export const conversationTypeEnum = pgEnum("conversation_type", [
  "diagnosis", // Photo diagnosis (home/auto issues)
  "general",   // General questions
  "followup",  // Follow-up on previous issue
]);

/**
 * MESSAGE ROLE ENUM
 */
export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

/**
 * AI CONVERSATIONS TABLE
 *
 * One record per conversation/chat session.
 * Groups multiple messages together.
 *
 * SHARING:
 * - Initially owned by userId (private)
 * - Can be shared with a group via groupId
 * - When shared, all group members can view/decrypt attachments
 */
export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),

  // User who owns this conversation
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Optional: Group this conversation is shared with
  // When set, all group members can access this conversation
  // Attachments are encrypted with group's master key
  groupId: uuid("group_id")
    .references(() => groups.id, { onDelete: "set null" }),

  // Conversation type
  type: conversationTypeEnum("type").default("diagnosis").notNull(),

  // Title (auto-generated from first message or user-set)
  title: text("title"),

  // Summary of the conversation (for quick display)
  summary: text("summary"),

  // Whether conversation has been resolved/closed
  isResolved: boolean("is_resolved").default(false).notNull(),

  // Category detected from conversation (e.g., "plumbing", "electrical", "auto")
  category: text("category"),

  // Severity level detected (for prioritization)
  severity: text("severity"), // "minor" | "moderate" | "urgent"

  // Contractor type recommended
  contractorType: text("contractor_type"),

  // Estimated cost range (JSON: { min: number, max: number, currency: string })
  estimatedCost: jsonb("estimated_cost"),

  // Total tokens used in this conversation
  totalInputTokens: integer("total_input_tokens").default(0).notNull(),
  totalOutputTokens: integer("total_output_tokens").default(0).notNull(),

  // Total cost in USD (calculated from tokens)
  totalCostUsd: text("total_cost_usd").default("0"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
});

/**
 * AI MESSAGES TABLE
 *
 * Individual messages within a conversation.
 * Stores both user and assistant messages with full metadata.
 */
export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Which conversation this belongs to
  conversationId: uuid("conversation_id")
    .references(() => aiConversations.id, { onDelete: "cascade" })
    .notNull(),

  // Message role
  role: messageRoleEnum("role").notNull(),

  // Text content
  content: text("content").notNull(),

  // Attachments (images, etc.) - stored as JSON array
  // Format: [{ type: "image", url: string, mediaType: string, fileName?: string }]
  attachments: jsonb("attachments"),

  // Model used for this response (only for assistant messages)
  model: text("model"), // e.g., "gpt-4o", "claude-3-opus"

  // Token usage (only for assistant messages)
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),

  // Cost in USD (only for assistant messages)
  costUsd: text("cost_usd"),

  // Response latency in milliseconds (only for assistant messages)
  latencyMs: integer("latency_ms"),

  // Finish reason (only for assistant messages)
  finishReason: text("finish_reason"), // "stop", "length", "content_filter", etc.

  // Tool calls made during this response
  // Format: [{ name: string, args: object, result: object }]
  toolCalls: jsonb("tool_calls"),

  // Structured request metadata (for analytics and debugging)
  // Format: { structured: boolean, category?: string, location?: string, ... }
  metadata: jsonb("metadata"),

  // Raw request/response for debugging (only stored if errors occur)
  debugInfo: jsonb("debug_info"),

  // When message was created
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * AI USAGE STATS TABLE (Aggregated)
 *
 * Daily aggregated stats for admin dashboard.
 * Updated via trigger or cron job.
 */
export const aiUsageStats = pgTable("ai_usage_stats", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Date for this stat record
  date: timestamp("date").notNull(),

  // User (null for global stats)
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),

  // Counts
  conversationCount: integer("conversation_count").default(0).notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  imageCount: integer("image_count").default(0).notNull(),

  // Token usage
  totalInputTokens: integer("total_input_tokens").default(0).notNull(),
  totalOutputTokens: integer("total_output_tokens").default(0).notNull(),

  // Cost
  totalCostUsd: text("total_cost_usd").default("0"),

  // Average latency
  avgLatencyMs: integer("avg_latency_ms"),

  // Categories breakdown (JSON: { "plumbing": 5, "electrical": 3, ... })
  categoryBreakdown: jsonb("category_breakdown"),

  // Severity breakdown (JSON: { "minor": 10, "moderate": 5, "urgent": 2 })
  severityBreakdown: jsonb("severity_breakdown"),

  // Created/updated timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
