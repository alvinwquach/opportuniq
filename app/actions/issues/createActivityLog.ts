"use server";

/**
 * CREATE ACTIVITY LOG
 *
 * Creates a new activity log entry for an issue.
 */

import { db } from "@/app/db/client";
import { issueActivityLog } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type {
  EncryptedActivityLogInput,
  PlaintextActivityLogFields,
  ActivityLogActionResult,
} from "./types";

/**
 * Create activity log with encrypted data
 */
export async function createActivityLogEncrypted(
  issueId: string,
  performedBy: string | null,
  encryptedData: EncryptedActivityLogInput,
  plaintextData: PlaintextActivityLogFields
): Promise<ActivityLogActionResult> {
  try {
    const [log] = await db
      .insert(issueActivityLog)
      .values({
        issueId,
        performedBy,
        isEncrypted: true,
        keyVersion: encryptedData.keyVersion || 1,
        algorithm: "AES-GCM-256",
        // Encrypted fields
        encryptedTitle: encryptedData.encryptedTitle,
        titleIv: encryptedData.titleIv,
        encryptedDescription: encryptedData.encryptedDescription || null,
        descriptionIv: encryptedData.descriptionIv || null,
        encryptedMetadata: encryptedData.encryptedMetadata || null,
        metadataIv: encryptedData.metadataIv || null,
        // Plaintext fields
        activityType: plaintextData.activityType,
        oldValue: plaintextData.oldValue,
        newValue: plaintextData.newValue,
        relatedEntityType: plaintextData.relatedEntityType,
        relatedEntityId: plaintextData.relatedEntityId,
      })
      .returning({ id: issueActivityLog.id });

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, logId: log.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create activity log",
    };
  }
}

/**
 * Create activity log with plaintext data (no encryption)
 */
export async function createActivityLogPlaintext(
  issueId: string,
  performedBy: string | null,
  data: {
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  } & PlaintextActivityLogFields
): Promise<ActivityLogActionResult> {
  try {
    const [log] = await db
      .insert(issueActivityLog)
      .values({
        issueId,
        performedBy,
        isEncrypted: false,
        // Plaintext fields
        activityType: data.activityType,
        title: data.title,
        description: data.description,
        oldValue: data.oldValue,
        newValue: data.newValue,
        metadata: data.metadata,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
      })
      .returning({ id: issueActivityLog.id });

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, logId: log.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create activity log",
    };
  }
}
