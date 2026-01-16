"use server";

/**
 * ENCRYPT INCOME STREAM
 *
 * Encrypts an existing plaintext income stream.
 * Used for migrating legacy data to encrypted format.
 */

import { db } from "@/app/db/client";
import { userIncomeStreams } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Encrypt an existing plaintext income stream
 *
 * PSEUDOCODE:
 * 1. Client fetches plaintext stream
 * 2. Client encrypts source, amount, description
 * 3. Client calls this action with encrypted data
 * 4. Server stores encrypted fields and clears plaintext
 * 5. Sets isEncrypted = true
 */
export async function encryptIncomeStream(
  streamId: string,
  userId: string,
  data: {
    encryptedSource: string;
    sourceIv: string;
    encryptedAmount: string;
    amountIv: string;
    encryptedDescription?: string;
    descriptionIv?: string;
    keyVersion?: number;
  }
) {
  const [stream] = await db
    .update(userIncomeStreams)
    .set({
      isEncrypted: true,
      keyVersion: data.keyVersion || 1,
      algorithm: "AES-GCM-256",
      encryptedSource: data.encryptedSource,
      sourceIv: data.sourceIv,
      encryptedAmount: data.encryptedAmount,
      amountIv: data.amountIv,
      encryptedDescription: data.encryptedDescription || null,
      descriptionIv: data.descriptionIv || null,
      // Clear plaintext
      source: null,
      amount: null,
      description: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userIncomeStreams.id, streamId),
        eq(userIncomeStreams.userId, userId)
      )
    )
    .returning();

  revalidatePath("/settings/income");
  revalidatePath("/dashboard");

  return stream;
}
