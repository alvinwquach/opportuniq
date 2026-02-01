/**
 * Admin Audit Log Schema
 *
 * Tracks all admin actions for accountability and compliance.
 */

import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const adminAuditLog = pgTable("admin_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Who performed the action
  adminId: uuid("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),

  // What action was performed
  action: text("action").notNull(), // e.g., "user.ban", "invite.create", "waitlist.delete"

  // What type of entity was affected
  targetType: text("target_type").notNull(), // e.g., "user", "invite", "waitlist", "referral"

  // ID of the affected entity (optional - some actions don't target a specific entity)
  targetId: uuid("target_id"),

  // Additional details about the action (JSON)
  details: jsonb("details"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Type for inserting
export type AdminAuditLogInsert = typeof adminAuditLog.$inferInsert;
export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
