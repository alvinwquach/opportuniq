/**
 * USERS SCHEMA
 *
 * Extends Supabase auth.users with application-specific profile data.
 * UUID syncs with auth.users via database trigger on signup.
 *
 * RELATIONS:
 * - Users (1) → (Many) GroupMembers
 * - Users (1) → (Many) UserIncomeStreams (private)
 * - Users (1) → (Many) UserExpenses (private)
 * - Users (1) → (Many) UserBudgets (private)
 * - Users (1) → (Many) Guides
 *
 * SECURITY:
 * - RLS enabled: users can only see/update their own row
 * - Financial data (income/expenses/budgets) is private to each user
 *
 * ENCRYPTION:
 * - encryptionKey: Legacy v1 symmetric key (AES-256, server-stored)
 * - publicKey: v2 X25519 for wrapped conversation keys (client-generated)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  real,
  jsonb,
  boolean,
  pgEnum,
  decimal,
} from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

// Platform-wide permissions (not group permissions)
export const userRoleEnum = pgEnum("user_role", [
  "admin",     // Full platform control
  "moderator", // Content moderation
  "user",      // Standard access
  "banned",    // No access
]);

// DIY vs professional recommendation threshold
export const userRiskToleranceEnum = pgEnum("user_risk_tolerance", [
  "none",      // Always hire professionals
  "very_low",  // Professionals for most tasks
  "low",       // Professionals beyond basic repairs
  "moderate",  // Comfortable with common DIY
  "high",      // DIY most tasks
  "very_high", // DIY almost everything
]);

// ============================================
// USERS TABLE
// ============================================

export const users = pgTable("users", {
  // Core identity (matches Supabase auth.users.id)
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),

  // Platform access
  role: userRoleEnum("role").default("user").notNull(),
  accessTier: text("access_tier")
    .$type<"johatsu" | "alpha" | "beta" | "public">()
    .default("alpha"),

  // Referral system
  referredBy: uuid("referred_by"),
  referralCode: text("referral_code").unique(),
  referralCount: integer("referral_count").default(0).notNull(),

  // Location (for service recommendations)
  streetAddress: text("street_address"),
  city: text("city"),
  stateProvince: text("state_province"),
  postalCode: text("postal_code"),
  country: text("country").default("US"),
  defaultSearchRadius: integer("default_search_radius").default(5),
  distanceUnit: text("distance_unit")
    .$type<"miles" | "kilometers">()
    .default("miles"),

  // Geocoded coordinates (cached for performance)
  latitude: real("latitude"),
  longitude: real("longitude"),
  geocodedAt: timestamp("geocoded_at"),
  formattedAddress: text("formatted_address"),

  // Contact
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").default(false).notNull(),

  // Preferences (flexible JSON)
  preferences: jsonb("preferences").$type<{
    language?: string;
    theme?: "light" | "dark" | "auto";
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    weeklyDigest?: boolean;
    unitSystem?: "imperial" | "metric";
    currency?: "USD" | "EUR" | "GBP";
  }>(),

  // Budget settings
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }),
  emergencyBuffer: decimal("emergency_buffer", { precision: 10, scale: 2 }),
  riskTolerance: userRiskToleranceEnum("risk_tolerance").default("moderate"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at"),
  lastLoginAt: timestamp("last_login_at"),
  loginCount: integer("login_count").default(0).notNull(),
  deletedAt: timestamp("deleted_at"),

  // Legacy encryption (v1) - Server-stored AES-256 key
  encryptionKey: text("encryption_key"),

  // Public-key encryption (v2) - X25519 for wrapped keys
  publicKey: text("public_key"),
  publicKeyVersion: integer("public_key_version").default(1),
  publicKeyCreatedAt: timestamp("public_key_created_at"),
  encryptedPrivateKeyBackup: text("encrypted_private_key_backup"),
  privateKeyBackupParams: jsonb("private_key_backup_params").$type<{
    algorithm: "Argon2id";
    memoryCost: number;
    timeCost: number;
    parallelism: number;
    saltLength: number;
  }>(),
});

// ============================================
// TYPES
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
