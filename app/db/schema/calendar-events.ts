/**
 * CALENDAR EVENTS SCHEMA
 *
 * Stores scheduled events for DIY tasks, contractor visits, reminders, and user blocks.
 * Supports both issue-related events and standalone calendar entries.
 *
 * RELATIONS:
 * - CalendarEvents (Many) → (1) Users (creator)
 * - CalendarEvents (Many) → (1) Groups (optional, for shared events)
 * - CalendarEvents (Many) → (1) Issues (optional, linked issue)
 * - CalendarEvents (Many) → (1) VendorContacts (optional, for contractor visits)
 *
 * EVENT TYPES:
 * - contractor: Scheduled visit from a professional
 * - diy: Planned DIY task/project time
 * - reminder: Follow-up or check-in reminder
 * - maintenance: Recurring maintenance task
 * - away: User unavailable (blocks scheduling)
 * - other: General calendar event
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { groups } from "./groups";
import { issues } from "./issues";

// ============================================
// ENUMS
// ============================================

export const calendarEventTypeEnum = pgEnum("calendar_event_type", [
  "contractor",  // Professional visit scheduled
  "diy",         // DIY project time blocked
  "reminder",    // Follow-up reminder
  "maintenance", // Recurring maintenance
  "away",        // User unavailable
  "other",       // General event
]);

export const calendarEventStatusEnum = pgEnum("calendar_event_status", [
  "scheduled",   // Event is planned
  "confirmed",   // Confirmed (e.g., contractor confirmed)
  "in_progress", // Currently happening
  "completed",   // Event finished
  "cancelled",   // Event was cancelled
  "rescheduled", // Event was moved (new event created)
]);

export const recurrenceFrequencyEnum = pgEnum("recurrence_frequency", [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
]);

// ============================================
// CALENDAR EVENTS TABLE
// ============================================

export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Event details
  title: text("title").notNull(),
  description: text("description"),
  type: calendarEventTypeEnum("type").notNull().default("other"),
  status: calendarEventStatusEnum("status").notNull().default("scheduled"),

  // Timing
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isAllDay: boolean("is_all_day").default(false).notNull(),
  timezone: text("timezone").default("America/Los_Angeles"),

  // Recurrence (for maintenance reminders, etc.)
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurrenceFrequency: recurrenceFrequencyEnum("recurrence_frequency"),
  recurrenceEndDate: timestamp("recurrence_end_date"),
  recurrenceCount: integer("recurrence_count"), // Number of occurrences
  parentEventId: uuid("parent_event_id"), // Links recurring instances to parent

  // Location (for contractor visits)
  location: text("location"),

  // Relationships
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  issueId: uuid("issue_id").references(() => issues.id, { onDelete: "set null" }),
  vendorContactId: uuid("vendor_contact_id"), // References vendorContacts if contractor

  // Notification settings
  reminderMinutes: integer("reminder_minutes").default(60), // Minutes before event
  notificationSent: boolean("notification_sent").default(false).notNull(),

  // Metadata
  metadata: jsonb("metadata").$type<{
    color?: string;
    notes?: string;
    contactName?: string;
    contactPhone?: string;
    estimatedDuration?: number; // minutes
    actualDuration?: number; // minutes (filled after completion)
    cost?: number;
    source?: "manual" | "ai_suggested" | "vendor" | "google_calendar";
    externalId?: string; // For synced events (Google Calendar ID)
  }>(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
});

// ============================================
// TYPES
// ============================================

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
