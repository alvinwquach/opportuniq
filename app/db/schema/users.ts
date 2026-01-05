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

import { pgTable, uuid, text, timestamp, integer, real, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";

/**
 * PLATFORM ROLES ENUM
 *
 * - admin: Platform administrator (alvinwquach@gmail.com) - full platform control
 * - moderator: Platform moderator - can moderate content, help users, manage reports
 * - user: Standard user - regular platform access
 * - banned: Banned user - no platform access (abuse, ToS violations)
 */
export const userRoleEnum = pgEnum("user_role", ["admin", "moderator", "user", "banned"]);

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

  // Avatar URL from OAuth provider (Google, etc.) - cached for performance
  avatarUrl: text("avatar_url"),

  // Platform role - determines platform-wide permissions (not group permissions)
  // admin: Full platform control (alvinwquach@gmail.com) - can manage everything
  // moderator: Platform moderator - can moderate content, help users
  // user: Standard user (default) - regular platform access
  role: userRoleEnum("role").default("user").notNull(),

  // Access tier - controls platform access during launch phases
  // johatsu: Pre-alpha exclusive group (closest collaborators)
  // alpha: Direct invites from admin (seed users)
  // beta: Referred by alpha users via referral code
  // public: Open access (future)
  accessTier: text("access_tier").$type<"johatsu" | "alpha" | "beta" | "public">().default("alpha"),

  // Who referred this user (null for alpha/admin users)
  referredBy: uuid("referred_by"),

  // This user's referral code for sharing
  referralCode: text("referral_code").unique(),

  // How many successful referrals this user has made
  referralCount: integer("referral_count").default(0).notNull(),

  // User-provided street address (optional)
  // More precise than postal code for local service recommendations
  // Examples: "123 Main St", "456 Oak Avenue, Apt 2B"
  streetAddress: text("street_address"),

  // City name (optional) - helps with more accurate geocoding
  city: text("city"),

  // State/Province/Region code (optional)
  // Examples: "CA" (California), "ON" (Ontario), "NSW" (New South Wales)
  stateProvince: text("state_province"),

  // Postal code for proximity searches - international support
  // Stored as text to preserve leading zeros and support various formats
  // Examples: "94132" (US ZIP), "SW1A 1AA" (UK), "100-0001" (Japan), "75001" (France)
  postalCode: text("postal_code"),

  // ISO 3166-1 alpha-2 country code (US, GB, CA, JP, FR, etc.)
  // Required for proper postal code validation and geocoding
  country: text("country").default("US"),

  // Default search radius with unit (stored in user's preferred unit system)
  // For imperial: miles, for metric: kilometers
  defaultSearchRadius: integer("default_search_radius").default(5),

  // User's preferred distance unit (for displaying search results)
  distanceUnit: text("distance_unit").$type<'miles' | 'kilometers'>().default("miles"),

  // Record creation timestamp - set once on signup, never updated
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Last profile modification timestamp - update on every change
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Geocoded coordinates from postal code - cached for performance
  // Eliminates need for real-time geocoding API calls
  // Used for proximity searches and vendor recommendations
  latitude: real("latitude"),
  longitude: real("longitude"),

  // When geocoding was last performed - for cache invalidation
  // Revalidate if postal code or country changed since last geocoding
  geocodedAt: timestamp("geocoded_at"),

  // Full formatted address from geocoding service (optional)
  // Helps users confirm their location is correct
  // Example: "123 Main St, San Francisco, CA 94132, USA"
  formattedAddress: text("formatted_address"),

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

  // Server-stored encryption key for E2E encrypted attachments
  // Base64-encoded AES-256 key, generated on first login
  // Stored encrypted at rest by Supabase, fetched on login and cached client-side
  encryptionKey: text("encryption_key"),
});

// Type exports for type-safe queries
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
