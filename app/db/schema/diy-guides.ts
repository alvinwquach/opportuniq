/**
 * DIY GUIDES SCHEMA
 *
 * Stores DIY guide recommendations extracted from Reddit, forums, and other sources.
 * These are linked to AI conversations for reference and analytics.
 *
 * PURPOSE:
 * - Track which guides users are being recommended
 * - Allow guides to persist with conversations
 * - Enable analytics on most helpful sources
 * - Let users bookmark/save helpful guides
 */

import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { aiConversations } from "./ai-conversations";
import { users } from "./users";

/**
 * DIY GUIDE SOURCE ENUM
 */
export const diyGuideSourceEnum = pgEnum("diy_guide_source", [
  "reddit",
  "diy_stackexchange",
  "instructables",
  "family_handyman",
  "this_old_house",
  "bob_vila",
  "doityourself",
  "hometalk",
  "diy_chatroom",
  "ifixit",
  "youtube",
  "other",
]);

/**
 * DIY GUIDES TABLE
 *
 * Each record represents a guide/resource recommended to a user
 * during an AI diagnosis conversation.
 */
export const diyGuides = pgTable("diy_guides", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Which conversation this guide was recommended in
  conversationId: uuid("conversation_id")
    .references(() => aiConversations.id, { onDelete: "cascade" })
    .notNull(),

  // User who received this recommendation
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Guide details
  title: text("title").notNull(),
  url: text("url").notNull(),
  source: diyGuideSourceEnum("source").notNull(),

  // Reddit-specific metadata
  subreddit: text("subreddit"), // e.g., "HomeImprovement", "DIY"
  upvotes: integer("upvotes"),
  commentCount: integer("comment_count"),
  postAge: text("post_age"), // e.g., "2 years ago"

  // Content preview
  excerpt: text("excerpt"), // First 200-300 chars of the post

  // Relevance to the user's issue
  relevanceScore: integer("relevance_score"), // 1-10, calculated by AI
  focusArea: text("focus_area"), // "cost", "diy_difficulty", "contractor_experience", "general"

  // User interaction
  wasClicked: boolean("was_clicked").default(false).notNull(),
  wasBookmarked: boolean("was_bookmarked").default(false).notNull(),
  wasHelpful: boolean("was_helpful"), // User feedback: null = not rated

  // Search context (what query led to this guide)
  searchQuery: text("search_query"),
  issueCategory: text("issue_category"), // e.g., "plumbing", "electrical"

  // Step-by-step guide content
  steps: integer("steps"), // Total number of steps
  stepContent: jsonb("step_content"), // Array of { stepNumber, title, description }
  toolsNeeded: text("tools_needed").array(), // Array of tool names needed
  duration: text("duration"), // Estimated time e.g., "15-20 min"

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  clickedAt: timestamp("clicked_at"),
});

/**
 * TYPE EXPORTS for TypeScript
 */
export type DIYGuide = typeof diyGuides.$inferSelect;
export type NewDIYGuide = typeof diyGuides.$inferInsert;
