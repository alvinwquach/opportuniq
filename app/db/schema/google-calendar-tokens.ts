/**
 * GOOGLE CALENDAR TOKENS SCHEMA - Stores OAuth tokens for Google Calendar API access
 *
 * SECURITY:
 * - Tokens are encrypted at rest by Supabase
 * - Access tokens expire after 1 hour, refresh tokens are long-lived
 * - Users can revoke access at any time
 * - Only calendar event management scopes are requested
 */

import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * GOOGLE CALENDAR TOKENS TABLE
 *
 * Stores OAuth tokens for managing calendar events via Google Calendar API.
 * One-to-one relationship with users (each user can have one Google Calendar connection).
 */
export const googleCalendarTokens = pgTable("google_calendar_tokens", {
  // Primary key - same as user ID for 1:1 relationship
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  // Google account email connected
  email: text("email").notNull(),

  // OAuth access token - expires after ~1 hour
  accessToken: text("access_token").notNull(),

  // OAuth refresh token - long-lived, used to get new access tokens
  refreshToken: text("refresh_token").notNull(),

  // When the access token expires (UTC)
  expiresAt: timestamp("expires_at").notNull(),

  // OAuth scopes granted by the user
  scopes: text("scopes").notNull(),

  // Whether the connection is active (user hasn't revoked)
  isActive: boolean("is_active").default(true).notNull(),

  // When the Google Calendar account was connected
  connectedAt: timestamp("connected_at").defaultNow().notNull(),

  // Last time tokens were refreshed
  lastRefreshedAt: timestamp("last_refreshed_at"),

  // Last time an event was created/updated via this connection
  lastUsedAt: timestamp("last_used_at"),
});

// Type exports
export type GoogleCalendarToken = typeof googleCalendarTokens.$inferSelect;
export type NewGoogleCalendarToken = typeof googleCalendarTokens.$inferInsert;
