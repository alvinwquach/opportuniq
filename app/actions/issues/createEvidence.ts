"use server";

/**
 * CREATE EVIDENCE
 *
 * Creates new evidence for an issue with encrypted or plaintext data.
 */

import { db } from "@/app/db/client";
import { issueEvidence } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type {
  EncryptedEvidenceInput,
  PlaintextEvidenceFields,
  EvidenceActionResult,
} from "./types";

/**
 * Create evidence with encrypted data
 */
export async function createEvidenceEncrypted(
  issueId: string,
  uploadedBy: string,
  encryptedData: EncryptedEvidenceInput,
  plaintextData: PlaintextEvidenceFields
): Promise<EvidenceActionResult> {
  try {
    const [evidence] = await db
      .insert(issueEvidence)
      .values({
        issueId,
        uploadedBy,
        isEncrypted: true,
        keyVersion: encryptedData.keyVersion || 1,
        algorithm: "AES-GCM-256",
        // Encrypted fields
        encryptedFileName: encryptedData.encryptedFileName || null,
        fileNameIv: encryptedData.fileNameIv || null,
        encryptedContent: encryptedData.encryptedContent || null,
        contentIv: encryptedData.contentIv || null,
        encryptedExtractedInfo: encryptedData.encryptedExtractedInfo || null,
        extractedInfoIv: encryptedData.extractedInfoIv || null,
        // Plaintext fields
        evidenceType: plaintextData.evidenceType,
        storageUrl: plaintextData.storageUrl,
        encryptionIv: plaintextData.encryptionIv, // IV for the encrypted file
        fileSize: plaintextData.fileSize,
        mimeType: plaintextData.mimeType,
      })
      .returning({ id: issueEvidence.id });

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, evidenceId: evidence.id };
  } catch (error) {
    console.error("[Create Evidence] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create evidence",
    };
  }
}

/**
 * Create evidence with plaintext data (no encryption)
 */
export async function createEvidencePlaintext(
  issueId: string,
  uploadedBy: string,
  data: {
    fileName?: string;
    content?: string;
    extractedInfo?: Record<string, unknown>;
  } & PlaintextEvidenceFields
): Promise<EvidenceActionResult> {
  try {
    const [evidence] = await db
      .insert(issueEvidence)
      .values({
        issueId,
        uploadedBy,
        isEncrypted: false,
        // Plaintext fields
        evidenceType: data.evidenceType,
        storageUrl: data.storageUrl,
        encryptionIv: data.encryptionIv,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        content: data.content,
        extractedInfo: data.extractedInfo,
      })
      .returning({ id: issueEvidence.id });

    revalidatePath(`/dashboard/issues/${issueId}`);

    return { success: true, evidenceId: evidence.id };
  } catch (error) {
    console.error("[Create Evidence] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create evidence",
    };
  }
}
