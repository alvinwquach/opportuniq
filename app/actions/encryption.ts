"use server";

/**
 * Encryption Server Actions
 *
 * Server actions for managing E2E encryption keys.
 * These replace the API routes in /api/encryption.
 *
 * Two types of keys are managed:
 * 1. Symmetric Key (encryptionKey): AES-256 key for encrypting attachments/messages
 * 2. Public Key (publicKey): For v2 E2EE key exchange (currently unused)
 */

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema/users";
import { encryptedAttachments } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

// ============================================
// TYPES
// ============================================

export interface PublicKeyInfo {
  hasPublicKey: boolean;
  publicKey: string | null;
  keyVersion: number;
  createdAt: string | null;
}

export interface RegisterPublicKeyResult {
  success: boolean;
  publicKey: string;
  keyVersion: number;
}

export interface EncryptionKeyResult {
  key: string;
}

export interface AttachmentMetadata {
  id: string;
  iv: string;
  mimeType: string;
  fileName: string | null;
  originalSize: number;
  keyVersion: number;
  downloadUrl: string;
}

// ============================================
// GET PUBLIC KEY INFO
// ============================================

/**
 * Get user's public key info
 */
export async function getPublicKeyInfo(): Promise<PublicKeyInfo | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const [userData] = await db
      .select({
        publicKey: users.publicKey,
        publicKeyVersion: users.publicKeyVersion,
        publicKeyCreatedAt: users.publicKeyCreatedAt,
      })
      .from(users)
      .where(eq(users.id, user.id));

    if (!userData) {
      return { error: "User not found" };
    }

    return {
      hasPublicKey: !!userData.publicKey,
      publicKey: userData.publicKey,
      keyVersion: userData.publicKeyVersion || 1,
      createdAt: userData.publicKeyCreatedAt?.toISOString() || null,
    };
  } catch (error) {
    return { error: "Internal Server Error" };
  }
}

// ============================================
// REGISTER PUBLIC KEY
// ============================================

/**
 * Register a new public key
 *
 * Called when:
 * 1. User sets up encryption for the first time
 * 2. User rotates their key pair
 */
export async function registerPublicKey(
  publicKey: string,
  keyVersion: number = 1
): Promise<RegisterPublicKeyResult | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    if (!publicKey) {
      return { error: "Missing publicKey" };
    }

    // Validate public key format (should be 32 bytes base64-encoded)
    try {
      const keyBytes = Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0));
      if (keyBytes.length !== 32) {
        return { error: "Invalid public key length" };
      }
    } catch {
      return { error: "Invalid public key format" };
    }

    // Update user's public key
    const result = await db
      .update(users)
      .set({
        publicKey,
        publicKeyVersion: keyVersion,
        publicKeyCreatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        publicKey: users.publicKey,
        publicKeyVersion: users.publicKeyVersion,
      });

    if (result.length === 0) {
      return { error: "User not found" };
    }

    return {
      success: true,
      publicKey: result[0].publicKey!,
      keyVersion: result[0].publicKeyVersion!,
    };
  } catch (error) {
    return { error: "Internal Server Error" };
  }
}

// ============================================
// GET SYMMETRIC ENCRYPTION KEY
// ============================================

/**
 * Generate a new AES-256 encryption key (server-side)
 *
 * PSEUDOCODE:
 * 1. Generate 32 random bytes using crypto.randomBytes
 * 2. Convert bytes to base64 string for storage/transport
 * 3. Return base64-encoded key
 *
 * NOTE: 32 bytes = 256 bits for AES-256 encryption
 */
function generateEncryptionKey(): string {
  const keyBytes = randomBytes(32);
  return keyBytes.toString("base64");
}

/**
 * Get user's symmetric encryption key for attachments/messages
 * Creates a new key if one doesn't exist
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Fetch user's encryptionKey from database
 * 4. If key exists, return it
 * 5. If no key exists:
 *    a. Generate new 256-bit key
 *    b. Store in database
 *    c. Return new key
 *
 * NOTE: Key is stored server-side (encrypted at rest by Supabase)
 * USE CASE: Cross-device access while maintaining E2E encryption
 */
export async function getEncryptionKey(): Promise<EncryptionKeyResult | { error: string }> {
  try {
    // Step 1: Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Step 2: Check authentication
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Step 3: Fetch user's encryption key from database
    const [userData] = await db
      .select({ encryptionKey: users.encryptionKey })
      .from(users)
      .where(eq(users.id, user.id));

    if (!userData) {
      return { error: "User not found" };
    }

    // Step 4: If key exists, return it
    if (userData.encryptionKey) {
      return { key: userData.encryptionKey };
    }

    // Step 5: Generate new key if none exists
    const newKey = generateEncryptionKey();

    // Store in database
    await db
      .update(users)
      .set({
        encryptionKey: newKey,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));


    return { key: newKey };
  } catch (error) {
    return { error: "Failed to fetch encryption key" };
  }
}

// ============================================
// GET ATTACHMENT METADATA
// ============================================

/**
 * Get attachment metadata and signed download URL
 *
 * PSEUDOCODE:
 * 1. Authenticate user via Supabase auth
 * 2. If not authenticated, return error
 * 3. Validate attachmentId is provided
 * 4. Fetch attachment record from database
 * 5. Verify user has access (must own the attachment)
 * 6. Generate signed URL for download (expires in 1 hour)
 * 7. Return metadata with download URL
 *
 * NOTE: Does NOT return the file itself - just metadata
 * USE CASE: Client needs IV and mimeType to decrypt the file
 */
export async function getAttachmentMetadata(
  attachmentId: string
): Promise<{ attachment: AttachmentMetadata } | { error: string }> {
  try {
    // Step 1: Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Step 2: Check authentication
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Step 3: Validate input
    if (!attachmentId) {
      return { error: "Missing attachment ID" };
    }

    // Step 4: Fetch attachment from database
    const [attachment] = await db
      .select()
      .from(encryptedAttachments)
      .where(eq(encryptedAttachments.id, attachmentId));

    if (!attachment) {
      return { error: "Attachment not found" };
    }

    // Step 5: Verify access (user must own the attachment)
    // TODO: Add group membership check when groups are implemented
    if (attachment.userId !== user.id) {
      return { error: "Access denied" };
    }

    // Step 6: Generate signed URL for download (expires in 1 hour)
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from(attachment.storageBucket)
      .createSignedUrl(attachment.storagePath, 3600);

    if (signedUrlError) {
      return { error: "Failed to generate download URL" };
    }

    // Step 7: Return metadata
    return {
      attachment: {
        id: attachment.id,
        iv: attachment.iv,
        mimeType: attachment.mimeType,
        fileName: attachment.fileName,
        originalSize: attachment.fileSizeBytes,
        keyVersion: attachment.keyVersion,
        downloadUrl: signedUrl.signedUrl,
      },
    };
  } catch (error) {
    return { error: "Internal server error" };
  }
}
