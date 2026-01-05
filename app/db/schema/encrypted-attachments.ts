/**
 * ENCRYPTED ATTACHMENTS SCHEMA - E2EE Media Storage
 *
 * PURPOSE:
 * Stores metadata for end-to-end encrypted attachments (photos, videos, audio).
 * The actual encrypted blobs are stored in Supabase Storage.
 * This table stores only metadata - admin cannot see content.
 *
 * ENCRYPTION FLOW:
 * 1. Client generates random IV (initialization vector)
 * 2. Client encrypts file with group's master key (AES-GCM-256)
 * 3. Encrypted blob uploaded to Supabase Storage
 * 4. This table stores: storage path, IV, file metadata
 * 5. To decrypt: fetch blob, use master key + IV to decrypt
 *
 * PRIVACY GUARANTEES:
 * - encryptedBlob: Stored in Supabase Storage, opaque to server
 * - iv: Random per-file, required for decryption (safe to store)
 * - Server sees: file size, type, timestamp, who uploaded
 * - Server CANNOT see: actual image/video content
 *
 * KEY MANAGEMENT:
 * - Uses group's master key from householdKeys table
 * - Same key used for all group attachments
 * - Key rotation requires re-encrypting all attachments
 */

import { pgTable, uuid, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { groups } from "./groups";
import { aiMessages } from "./ai-conversations";

/**
 * ATTACHMENT TYPE ENUM
 */
export const attachmentTypeEnum = pgEnum("attachment_type", [
  "image",
  "video",
  "audio",
  "document",
]);

/**
 * ENCRYPTION STATUS ENUM
 */
export const encryptionStatusEnum = pgEnum("encryption_status", [
  "pending",    // Upload in progress
  "encrypted",  // Successfully encrypted and stored
  "failed",     // Encryption/upload failed
  "migrating",  // Being re-encrypted (key rotation)
]);

/**
 * ENCRYPTED ATTACHMENTS TABLE
 *
 * Metadata for encrypted files stored in Supabase Storage.
 * The actual encrypted content is NOT in the database.
 */
export const encryptedAttachments = pgTable("encrypted_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Who uploaded this attachment
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Which group's key was used to encrypt (for decryption lookup)
  // If null, encrypted with user's personal key (before joining group)
  groupId: uuid("group_id")
    .references(() => groups.id, { onDelete: "set null" }),

  // Which message this attachment belongs to (optional)
  // Allows cascade delete when message is deleted
  messageId: uuid("message_id")
    .references(() => aiMessages.id, { onDelete: "cascade" }),

  // ============================================
  // STORAGE LOCATION
  // ============================================

  // Path in Supabase Storage bucket
  // Format: "attachments/{userId}/{uuid}.enc"
  storagePath: text("storage_path").notNull(),

  // Storage bucket name (for multi-bucket support)
  storageBucket: text("storage_bucket").default("encrypted-attachments").notNull(),

  // ============================================
  // ENCRYPTION METADATA (safe to store)
  // ============================================

  // Initialization Vector (IV) - random per file, required for decryption
  // 12 bytes for AES-GCM, stored as base64 (16 chars)
  iv: text("iv").notNull(),

  // Key version used for encryption (from householdKeys.keyVersion)
  // Needed to handle key rotation - use correct key version to decrypt
  keyVersion: integer("key_version").default(1).notNull(),

  // Encryption algorithm used
  algorithm: text("algorithm").default("AES-GCM-256").notNull(),

  // Encryption status
  status: encryptionStatusEnum("status").default("pending").notNull(),

  // ============================================
  // FILE METADATA (visible to admin)
  // ============================================

  // Original filename (before encryption)
  fileName: text("file_name"),

  // MIME type of original file
  mimeType: text("mime_type").notNull(),

  // Attachment type category
  type: attachmentTypeEnum("type").notNull(),

  // Original file size in bytes (before encryption)
  // Encrypted size will be slightly larger due to auth tag
  fileSizeBytes: integer("file_size_bytes").notNull(),

  // Encrypted file size in bytes
  encryptedSizeBytes: integer("encrypted_size_bytes"),

  // Image/video dimensions (if applicable)
  width: integer("width"),
  height: integer("height"),

  // Video/audio duration in seconds (if applicable)
  durationSeconds: integer("duration_seconds"),

  // ============================================
  // TIMESTAMPS
  // ============================================

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// TYPES
// ============================================

export type EncryptedAttachment = typeof encryptedAttachments.$inferSelect;
export type NewEncryptedAttachment = typeof encryptedAttachments.$inferInsert;
