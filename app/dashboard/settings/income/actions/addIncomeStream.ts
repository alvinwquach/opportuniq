"use server";

/**
 * ADD INCOME STREAM
 *
 * Creates a new income stream with encrypted data.
 * Client encrypts before sending, server stores ciphertext.
 */

import { db } from "@/app/db/client";
import { userIncomeStreams } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type { EncryptedIncomeInput, IncomeFrequency } from "./types";

/**
 * Add a new encrypted income stream
 *
 * PSEUDOCODE:
 * 1. Receive encrypted fields from client
 * 2. Store ciphertext + IV for each encrypted field
 * 3. Set isEncrypted = true
 * 4. Store plaintext fields (frequency, dates, isActive)
 * 5. Return the new stream record
 */
export async function addIncomeStream(
  userId: string,
  data: EncryptedIncomeInput
) {
  const [stream] = await db
    .insert(userIncomeStreams)
    .values({
      userId,
      isEncrypted: true,
      keyVersion: data.keyVersion || 1,
      algorithm: "AES-GCM-256",
      // Encrypted fields
      encryptedSource: data.encryptedSource,
      sourceIv: data.sourceIv,
      encryptedAmount: data.encryptedAmount,
      amountIv: data.amountIv,
      encryptedDescription: data.encryptedDescription || null,
      descriptionIv: data.descriptionIv || null,
      // Plaintext fields (for queries/calculations)
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
    })
    .returning();

  revalidatePath("/settings/income");
  revalidatePath("/dashboard");

  return stream;
}

/**
 * Add income stream without encryption (legacy support)
 * Use addIncomeStream for new encrypted data
 */
export async function addIncomeStreamPlaintext(
  userId: string,
  data: {
    source: string;
    amount: number;
    frequency: IncomeFrequency;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }
) {
  const [stream] = await db
    .insert(userIncomeStreams)
    .values({
      userId,
      isEncrypted: false,
      source: data.source,
      amount: data.amount.toString(),
      frequency: data.frequency,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
    })
    .returning();

  revalidatePath("/settings/income");
  revalidatePath("/dashboard");

  return stream;
}
