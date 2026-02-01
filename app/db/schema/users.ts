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
 * ENCRYPTION (E2E with AES-256-GCM):
 * - Encrypted: name, phoneNumber, streetAddress, city, stateProvince,
 *   postalCode, formattedAddress, monthlyBudget, emergencyBuffer
 * - Plaintext: email (auth), role, coordinates (derived), preferences, timestamps
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
  avatarUrl: text("avatar_url"),

  // Encryption metadata
  isProfileEncrypted: boolean("is_profile_encrypted").default(false).notNull(),
  profileKeyVersion: integer("profile_key_version").default(1).notNull(),
  profileAlgorithm: text("profile_algorithm").default("AES-GCM-256").notNull(),

  // Encrypted name (ciphertext + IV)
  encryptedName: text("encrypted_name"),
  nameIv: text("name_iv"),
  name: text("name"), // Plaintext fallback

  // Platform access
  role: userRoleEnum("role").default("user").notNull(),
  accessTier: text("access_tier")
    .$type<"johatsu" | "alpha" | "beta" | "public">()
    .default("alpha"),

  // Referral system
  referredBy: uuid("referred_by"),
  referralCode: text("referral_code").unique(),
  referralCount: integer("referral_count").default(0).notNull(),

  // Admin notes (internal use only)
  notes: text("notes"),

  // Encrypted location fields (ciphertext + IV pairs)
  encryptedStreetAddress: text("encrypted_street_address"),
  streetAddressIv: text("street_address_iv"),
  streetAddress: text("street_address"), // Plaintext fallback

  encryptedCity: text("encrypted_city"),
  cityIv: text("city_iv"),
  city: text("city"), // Plaintext fallback

  encryptedStateProvince: text("encrypted_state_province"),
  stateProvinceIv: text("state_province_iv"),
  stateProvince: text("state_province"), // Plaintext fallback

  encryptedPostalCode: text("encrypted_postal_code"),
  postalCodeIv: text("postal_code_iv"),
  postalCode: text("postal_code"), // Plaintext fallback

  encryptedFormattedAddress: text("encrypted_formatted_address"),
  formattedAddressIv: text("formatted_address_iv"),
  formattedAddress: text("formatted_address"), // Plaintext fallback

  // Plaintext location (needed for queries)
  country: text("country").default("US"),
  defaultSearchRadius: integer("default_search_radius").default(5),
  distanceUnit: text("distance_unit")
    .$type<"miles" | "kilometers">()
    .default("miles"),

  // Geocoded coordinates (cached for performance, derived from address)
  latitude: real("latitude"),
  longitude: real("longitude"),
  geocodedAt: timestamp("geocoded_at"),

  // Encrypted contact (ciphertext + IV)
  encryptedPhoneNumber: text("encrypted_phone_number"),
  phoneNumberIv: text("phone_number_iv"),
  phoneNumber: text("phone_number"), // Plaintext fallback
  phoneVerified: boolean("phone_verified").default(false).notNull(),

  // Preferences (flexible JSON) - not encrypted, no PII
  preferences: jsonb("preferences").$type<{
    language?: string;
    theme?: "light" | "dark" | "auto";
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    weeklyDigest?: boolean;
    unitSystem?: "imperial" | "metric";
    currency?: "USD" | "EUR" | "GBP";
  }>(),

  // Encrypted budget settings (ciphertext + IV pairs)
  encryptedMonthlyBudget: text("encrypted_monthly_budget"),
  monthlyBudgetIv: text("monthly_budget_iv"),
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }), // Plaintext fallback

  encryptedEmergencyBuffer: text("encrypted_emergency_buffer"),
  emergencyBufferIv: text("emergency_buffer_iv"),
  emergencyBuffer: decimal("emergency_buffer", { precision: 10, scale: 2 }), // Plaintext fallback

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
