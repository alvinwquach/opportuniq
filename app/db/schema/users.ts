/**
 * USERS SCHEMA - Core user profile and authentication extension
 *
 * RELATIONS:
 * - Users (1) → (Many) GroupMembers - One user can belong to many groups
 * - Users (1) → (Many) UserIncomeStreams - One user has many income sources (private)
 * - Users (1) → (Many) UserExpenses - One user has many expense records (private)
 * - Users (1) → (Many) UserBudgets - One user has many budget categories (private)
 * - Users (1) → (Many) Guides - One user can create many DIY guides
 *
 * SECURITY:
 * - Enable RLS (Row Level Security) - users can only see/update their own row
 * - ID syncs with auth.users via database trigger on signup
 * - Financial data (income/expenses/budgets) is PRIVATE to each user
 */

import { pgTable, uuid, text, timestamp, integer, real, jsonb, boolean } from "drizzle-orm/pg-core";

/**
 * USERS TABLE
 *
 * Extends Supabase auth.users with application-specific profile data.
 * Uses same UUID as auth.users for seamless joins.
 */
export const users = pgTable("users", {
  // Primary identifier - matches Supabase auth.users.id (not auto-generated here)
  // Relation: References auth.users(id) in Supabase's auth schema
  id: uuid("id").primaryKey(),

  // User's email address - duplicated from auth.users for convenience
  // Source of truth is still auth.users.email
  email: text("email").notNull().unique(),

  // Display name for the user - can be null if not provided during signup
  name: text("name"),

  // US ZIP code for proximity searches - stored as text to preserve leading zeros
  // Example: "94132" or "01234"
  zipCode: text("zip_code"),

  // Default radius in miles for searching contractors/vendors
  // User preference - can be overridden per search
  defaultSearchRadius: integer("default_search_radius").default(5),

  // Record creation timestamp - set once on signup, never updated
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Last profile modification timestamp - update on every change
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Geocoded coordinates from ZIP code - cached for performance
  // Eliminates need for real-time geocoding API calls
  latitude: real("latitude"),
  longitude: real("longitude"),

  // When geocoding was last performed - for cache invalidation
  geocodedAt: timestamp("geocoded_at"),

  // Phone number in E.164 format (+14155552671) - optional
  phoneNumber: text("phone_number"),

  // Whether phone number has been verified via SMS code
  phoneVerified: boolean("phone_verified").default(false).notNull(),

  // User preferences stored as flexible JSON
  // Includes: theme, language, notifications, unit system, currency
  preferences: jsonb("preferences").$type<{
    language?: string;
    theme?: 'light' | 'dark' | 'auto';
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    weeklyDigest?: boolean;
    unitSystem?: 'imperial' | 'metric';
    currency?: 'USD' | 'EUR' | 'GBP';
  }>(),

  // Last user activity timestamp - updated on meaningful interactions
  // Use throttling (only update if >5 min since last update) to avoid excessive writes
  lastSeenAt: timestamp("last_seen_at"),

  // Last successful authentication timestamp - updated on login only
  lastLoginAt: timestamp("last_login_at"),

  // Total successful logins count - incremented atomically on each login
  // Engagement metric and security signal
  loginCount: integer("login_count").default(0).notNull(),

  // Soft delete timestamp - marks account as deleted without removing data
  // Enables 30-day account recovery window
  deletedAt: timestamp("deleted_at"),
});

// Type exports for type-safe queries
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
