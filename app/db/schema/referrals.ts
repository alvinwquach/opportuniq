/**
 * REFERRALS SCHEMA - Referral tracking and analytics
 *
 * PURPOSE:
 * Tracks the full referral chain from alpha → beta users.
 * Enables admin metrics:
 * - Referrals sent vs accepted
 * - Conversion rate (referral → signup)
 * - Top referrers leaderboard
 * - Referral chain depth (A → B → C)
 * - Viral coefficient calculation
 *
 * WORKFLOW:
 * 1. Alpha user generates referral code (or uses their unique code)
 * 2. Alpha shares code with friends → referral row created (status: pending)
 * 3. Friend signs up with code → referral converted (status: converted)
 * 4. Friend becomes beta user and can refer others
 */

import { pgTable, uuid, text, timestamp, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * ACCESS TIER ENUM
 *
 * Controls who can access the platform:
 * - johatsu: Pre-alpha exclusive group (closest collaborators)
 * - alpha: Direct invites from admin (you send the app to them)
 * - beta: Referred by alpha users (friends/family via referral code)
 * - public: Open access (future)
 */
export const accessTierEnum = pgEnum("access_tier", ["johatsu", "alpha", "beta", "public"]);

/**
 * REFERRAL STATUS ENUM
 */
export const referralStatusEnum = pgEnum("referral_status", [
  "pending",    // Code shared but not yet used
  "clicked",    // Referral link clicked
  "converted",  // Successfully signed up
  "expired",    // Code expired without conversion
]);

/**
 * REFERRAL CODES TABLE
 *
 * Each user gets a unique referral code they can share.
 * Tracks usage and limits.
 */
export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").primaryKey().defaultRandom(),

  // The unique referral code (e.g., "ALVIN2024", "abc123xy")
  code: text("code").notNull().unique(),

  // Who owns this referral code
  // Relation: One user → One referral code
  ownerId: uuid("owner_id").references(() => users.id).notNull(),

  // How many times this code can be used (null = unlimited)
  maxUses: integer("max_uses"),

  // How many times this code has been used
  useCount: integer("use_count").default(0).notNull(),

  // Is this code currently active?
  isActive: text("is_active").$type<"true" | "false">().default("true").notNull(),

  // When this code expires (null = never)
  expiresAt: timestamp("expires_at"),

  // When the code was created
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * REFERRALS TABLE
 *
 * Tracks each individual referral event.
 * Links referrer → referee with full conversion tracking.
 */
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),

  // The referral code used
  referralCodeId: uuid("referral_code_id").references(() => referralCodes.id).notNull(),

  // Who sent the referral (the referrer)
  // Relation: One user → Many referrals sent
  referrerId: uuid("referrer_id").references(() => users.id).notNull(),

  // Email of the person being referred (before they sign up)
  refereeEmail: text("referee_email").notNull(),

  // Who received the referral (after signup)
  // Null until they actually sign up
  // Relation: One user → One referral received
  refereeId: uuid("referee_id").references(() => users.id),

  // Current status of this referral
  status: referralStatusEnum("status").default("pending").notNull(),

  // Depth in the referral chain (1 = direct from alpha, 2 = referred by beta, etc.)
  chainDepth: integer("chain_depth").default(1).notNull(),

  // Source/context of the referral (e.g., "email", "sms", "social", "direct")
  source: text("source"),

  // When the referral was created (code shared)
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // When the referral link was first clicked
  clickedAt: timestamp("clicked_at"),

  // When the referee signed up (conversion)
  convertedAt: timestamp("converted_at"),

  // Time to convert in hours (denormalized for quick queries)
  hoursToConvert: integer("hours_to_convert"),
});

/**
 * INVITE TIER ENUM
 *
 * Controls which access tier the invite grants:
 * - johatsu: Pre-alpha exclusive group (closest collaborators)
 * - alpha: Direct invites from admin (seed users, limited features testing)
 * - beta: Broader access (more features, referred users)
 * - public: Open access (full launch)
 */
export const inviteTierEnum = pgEnum("invite_tier", ["johatsu", "alpha", "beta", "public"]);

/**
 * INVITES TABLE
 *
 * Unified invite system supporting all access tiers.
 * Replaces the previous alpha-only invite system.
 * Admins can send alpha, beta, or public invites.
 */
export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Email to invite
  email: text("email").notNull().unique(),

  // Unique invite token
  token: text("token").notNull().unique(),

  // What access tier this invite grants
  tier: inviteTierEnum("tier").default("alpha").notNull(),

  // Who sent the invite (admin or authorized user)
  invitedBy: uuid("invited_by").references(() => users.id).notNull(),

  // Has the invite been accepted?
  acceptedAt: timestamp("accepted_at"),

  // The user account created when accepting
  userId: uuid("user_id").references(() => users.id),

  // When the invite expires
  expiresAt: timestamp("expires_at").notNull(),

  // When the invite was created
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Optional note/message for the invite
  note: text("note"),

  // Whether the invite email was actually sent (vs just link copied)
  emailSent: boolean("email_sent").default(false).notNull(),
});

/**
 * ALPHA INVITES TABLE (Legacy - kept for backward compatibility)
 *
 * @deprecated Use `invites` table instead
 * Tracks direct alpha invitations from admin.
 * These are the seed users who can then refer beta users.
 */
export const alphaInvites = pgTable("alpha_invites", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Email to invite
  email: text("email").notNull().unique(),

  // Unique invite token for this alpha user
  token: text("token").notNull().unique(),

  // Who sent the invite (admin user)
  invitedBy: uuid("invited_by").references(() => users.id).notNull(),

  // Has the invite been accepted?
  acceptedAt: timestamp("accepted_at"),

  // The user account created when accepting
  userId: uuid("user_id").references(() => users.id),

  // When the invite expires
  expiresAt: timestamp("expires_at").notNull(),

  // When the invite was created
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for type-safe queries
export type ReferralCode = typeof referralCodes.$inferSelect;
export type NewReferralCode = typeof referralCodes.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
/** @deprecated Use Invite instead */
export type AlphaInvite = typeof alphaInvites.$inferSelect;
/** @deprecated Use NewInvite instead */
export type NewAlphaInvite = typeof alphaInvites.$inferInsert;
