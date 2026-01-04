/**
 * WAITLIST SCHEMA - Pre-launch email collection and conversion tracking
 *
 * PURPOSE:
 * Collects emails before launch and tracks conversion to actual users.
 * Enables admin metrics:
 * - Waitlist size over time
 * - Conversion rate (waitlist → signup)
 * - Source attribution (where signups come from)
 *
 * WORKFLOW:
 * 1. User submits email on landing page → waitlist row created
 * 2. User signs up with same email → convertedAt + convertedUserId set
 * 3. Admin dashboard queries conversion metrics
 */

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * WAITLIST TABLE
 *
 * Tracks pre-launch signups and their conversion to users.
 */
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Email address - unique to prevent duplicates
  email: text("email").notNull().unique(),

  // Which launch phase they joined
  // alpha: Direct signups (your friends/family who sign up themselves)
  // beta: Referred by alpha users (friends of friends via referral code)
  // public: Open waitlist signups (coming soon)
  phase: text("phase").$type<"alpha" | "beta" | "public">(),

  // Attribution source - where did they hear about us?
  // Examples: "landing", "twitter", "referral", "producthunt", "friend"
  source: text("source"),

  // Optional referral code if referred by existing waitlist member
  referralCode: text("referral_code"),

  // This user's unique referral code for sharing
  // Generated on signup: e.g., "abc123"
  myReferralCode: text("my_referral_code").unique(),

  // How many people this user referred (denormalized for quick display)
  referralCount: text("referral_count").default("0"),

  // When they joined the waitlist
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // When they converted to a real user (null if still waiting)
  convertedAt: timestamp("converted_at"),

  // Link to their user account after conversion
  // Relation: One waitlist entry → One user (optional)
  convertedUserId: uuid("converted_user_id").references(() => users.id),
});

// Type exports for type-safe queries
export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;
