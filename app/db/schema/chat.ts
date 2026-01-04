/**
 * CHAT SCHEMA - Live chat support system
 *
 * PURPOSE:
 * Enables real-time chat between users and support team (Kevin and admin).
 * Available to admin and beta users during launch weekend, then with set hours.
 *
 * WORKFLOW:
 * 1. User sends message → stored in chat_messages
 * 2. Support team (admin/Kevin) receives notification
 * 3. Support responds → message stored and sent via realtime
 * 4. Availability checked before allowing new messages (post-launch weekend)
 */

import { pgTable, uuid, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * MESSAGE STATUS ENUM
 */
export const messageStatusEnum = pgEnum("message_status", [
  "sent",      // Message sent by user
  "delivered", // Message delivered to support
  "read",      // Message read by support
  "archived",  // Message archived
]);

/**
 * CHAT MESSAGES TABLE
 *
 * Stores all chat messages between users and support team.
 * Uses Supabase Realtime for instant delivery.
 */
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Who sent the message (user or support)
  // Relation: Many messages → One user
  senderId: uuid("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Who receives the message (support or user)
  // For user messages: null (goes to support queue)
  // For support messages: specific user ID
  recipientId: uuid("recipient_id")
    .references(() => users.id, { onDelete: "cascade" }),

  // Message content
  content: text("content").notNull(),

  // Message status
  status: messageStatusEnum("status").default("sent").notNull(),

  // Is this from support team? (admin or Kevin)
  isFromSupport: boolean("is_from_support").default(false).notNull(),

  // Support team member name (if from support)
  supportName: text("support_name"), // "Kevin" or "Alvin"

  // When message was sent
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // When message was read (null if unread)
  readAt: timestamp("read_at"),

  // Launch weekend flag - messages during launch weekend persist
  isLaunchWeekend: boolean("is_launch_weekend").default(false).notNull(),

  // Should this message go to inbox after weekend? (for chatbot transition)
  shouldRouteToInbox: boolean("should_route_to_inbox").default(false).notNull(),
});

/**
 * CHAT SESSIONS TABLE
 *
 * Tracks active chat sessions and availability.
 * One session per user (or support can have multiple active sessions).
 */
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // User who started the session
  // Relation: Many sessions → One user
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(), // One active session per user

  // Is session currently active?
  isActive: boolean("is_active").default(true).notNull(),

  // When session started
  startedAt: timestamp("started_at").defaultNow().notNull(),

  // When session ended (null if still active)
  endedAt: timestamp("ended_at"),

  // Last message timestamp (for sorting)
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),

  // Launch weekend flag - messages during launch weekend persist
  isLaunchWeekend: boolean("is_launch_weekend").default(false).notNull(),
});

