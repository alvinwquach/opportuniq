"use server";

/**
 * UPDATE INCOME STREAM
 *
 * Updates an existing income stream with encrypted data.
 * Supports partial updates - only provided fields are updated.
 */

import { db } from "@/app/db/client";
import { userIncomeStreams } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { EncryptedIncomeInput, IncomeFrequency } from "./types";

/**
 * Update an existing income stream with encrypted data
 *
 * PSEUDOCODE:
 * 1. Receive encrypted fields from client
 * 2. Build update object with provided fields
 * 3. Update ciphertext + IV for each encrypted field
 * 4. Verify ownership via userId check
 * 5. Return updated stream
 */
export async function updateIncomeStream(
  streamId: string,
  userId: string,
  data: Partial<EncryptedIncomeInput> & {
    // Allow updating plaintext fields independently
    frequency?: IncomeFrequency;
    startDate?: Date | null;
    endDate?: Date | null;
    isActive?: boolean;
  }
) {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Encrypted fields (must provide both ciphertext and IV)
  if (data.encryptedSource && data.sourceIv) {
    updateData.encryptedSource = data.encryptedSource;
    updateData.sourceIv = data.sourceIv;
    updateData.source = null; // Clear legacy plaintext
    updateData.isEncrypted = true;
  }
  if (data.encryptedAmount && data.amountIv) {
    updateData.encryptedAmount = data.encryptedAmount;
    updateData.amountIv = data.amountIv;
    updateData.amount = null; // Clear legacy plaintext
    updateData.isEncrypted = true;
  }
  if (data.encryptedDescription !== undefined) {
    updateData.encryptedDescription = data.encryptedDescription || null;
    updateData.descriptionIv = data.descriptionIv || null;
    updateData.description = null; // Clear legacy plaintext
  }

  // Key version update
  if (data.keyVersion !== undefined) {
    updateData.keyVersion = data.keyVersion;
  }

  // Plaintext fields
  if (data.frequency !== undefined) {
    updateData.frequency = data.frequency;
  }
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate;
  }
  if (data.endDate !== undefined) {
    updateData.endDate = data.endDate;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  const [stream] = await db
    .update(userIncomeStreams)
    .set(updateData)
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
