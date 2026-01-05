/**
 * Encryption Key API
 *
 * GET: Fetch user's encryption key (generates one if not exists)
 *
 * The key is stored server-side in the users table, encrypted at rest by Supabase.
 * This allows cross-device access while maintaining E2E encryption for attachments.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Generate a new AES-256 encryption key (server-side)
 * Returns base64-encoded 32-byte key
 */
function generateEncryptionKey(): string {
  const keyBytes = randomBytes(32); // 256 bits
  return keyBytes.toString("base64");
}

export async function GET() {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's encryption key
    const [userData] = await db
      .select({ encryptionKey: users.encryptionKey })
      .from(users)
      .where(eq(users.id, user.id));

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If key exists, return it
    if (userData.encryptionKey) {
      return NextResponse.json({ key: userData.encryptionKey });
    }

    // Generate new key if none exists
    const newKey = generateEncryptionKey();

    // Store in database
    await db
      .update(users)
      .set({
        encryptionKey: newKey,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log("[Encryption API] Generated new encryption key for user:", user.id);

    return NextResponse.json({ key: newKey });
  } catch (error) {
    console.error("[Encryption API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch encryption key" },
      { status: 500 }
    );
  }
}
