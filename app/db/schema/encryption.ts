/**
 * ENCRYPTION SCHEMA
 *
 * E2E encryption for household media (photos/videos of repairs).
 * Media encrypted client-side before upload - server never sees plaintext.
 *
 * ARCHITECTURE:
 * - householdKeys: One master key per group (encrypted with owner's password)
 * - memberKeyShares: Per-member copies of master key (re-encrypted for each member)
 *
 * ENCRYPTION FLOW:
 * 1. Owner creates group → generates AES-256 master key client-side
 * 2. Master key encrypted with owner's password → stored in householdKeys
 * 3. New member joins → existing member re-encrypts master key for them
 * 4. Upload media → client encrypts with master key, uploads encrypted blob
 * 5. View media → client decrypts master key with password, decrypts blob
 *
 * SECURITY MODEL:
 * - Zero-knowledge: Server cannot decrypt media (no plaintext keys stored)
 * - Password-based: Lost password = lost data (no recovery without escrow)
 * - Key derivation: PBKDF2 with 210k iterations + unique salt per member
 */

import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { groups, groupMembers } from "./groups";

// ============================================
// HOUSEHOLD KEYS - Master Key per Group
// ============================================

/**
 * Stores the group's master encryption key (encrypted with owner's password).
 * One key per group. Server never sees plaintext.
 */
export const householdKeys = pgTable("household_keys", {
  id: uuid("id").primaryKey().defaultRandom(),

  // One master key per group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" })
    .unique(),

  // Base64-encoded master key, encrypted with owner's password-derived key
  encryptedMasterKey: text("encrypted_master_key").notNull(),

  // Incremented on key rotation (for detecting rollback attacks)
  keyVersion: integer("key_version").default(1).notNull(),

  // Algorithm identifier (future-proofs for post-quantum migration)
  algorithm: text("algorithm").default("AES-GCM-256").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// MEMBER KEY SHARES - Per-Member Key Copies
// ============================================

/**
 * Each member gets master key re-encrypted with their password.
 * Allows each member to decrypt with their own password (not shared).
 * Cascade delete revokes access when member removed.
 */
export const memberKeyShares = pgTable("member_key_shares", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Which group this key share belongs to
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Cascade delete: removing member revokes their key access
  memberId: uuid("member_id")
    .notNull()
    .references(() => groupMembers.id, { onDelete: "cascade" }),

  // Master key encrypted with THIS member's password (not owner's)
  encryptedKey: text("encrypted_key").notNull(),

  // Unique salt for PBKDF2 key derivation (prevents rainbow tables)
  salt: text("salt").notNull(),

  // PBKDF2 iteration count (210k balances security vs mobile performance)
  iterations: integer("iterations").default(210000).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// TYPES
// ============================================

export type HouseholdKey = typeof householdKeys.$inferSelect;
export type NewHouseholdKey = typeof householdKeys.$inferInsert;
export type MemberKeyShare = typeof memberKeyShares.$inferSelect;
export type NewMemberKeyShare = typeof memberKeyShares.$inferInsert;
