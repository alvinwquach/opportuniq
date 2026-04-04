"use server";

/**
 * CREATE ISSUE
 *
 * Creates a new issue with encrypted or plaintext data.
 */

import { db } from "@/app/db/client";
import { issues } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type {
  EncryptedIssueInput,
  PlaintextIssueFields,
  IssueActionResult,
} from "./types";

/**
 * Create a new issue with encrypted data
 */
export async function createIssueEncrypted(
  groupId: string,
  createdBy: string,
  encryptedData: EncryptedIssueInput,
  plaintextData?: PlaintextIssueFields
): Promise<IssueActionResult> {
  try {
    const [issue] = await db
      .insert(issues)
      .values({
        groupId,
        createdBy,
        isEncrypted: true,
        keyVersion: encryptedData.keyVersion || 1,
        algorithm: "AES-GCM-256",
        // Encrypted fields
        encryptedTitle: encryptedData.encryptedTitle,
        titleIv: encryptedData.titleIv,
        encryptedDescription: encryptedData.encryptedDescription || null,
        descriptionIv: encryptedData.descriptionIv || null,
        encryptedAssetName: encryptedData.encryptedAssetName || null,
        assetNameIv: encryptedData.assetNameIv || null,
        encryptedAssetDetails: encryptedData.encryptedAssetDetails || null,
        assetDetailsIv: encryptedData.assetDetailsIv || null,
        encryptedDiagnosis: encryptedData.encryptedDiagnosis || null,
        diagnosisIv: encryptedData.diagnosisIv || null,
        encryptedIgnoreRisk: encryptedData.encryptedIgnoreRisk || null,
        ignoreRiskIv: encryptedData.ignoreRiskIv || null,
        encryptedWarningSignsToWatch: encryptedData.encryptedWarningSignsToWatch || null,
        warningSignsToWatchIv: encryptedData.warningSignsToWatchIv || null,
        encryptedWhenToEscalate: encryptedData.encryptedWhenToEscalate || null,
        whenToEscalateIv: encryptedData.whenToEscalateIv || null,
        encryptedEmergencyInstructions: encryptedData.encryptedEmergencyInstructions || null,
        emergencyInstructionsIv: encryptedData.emergencyInstructionsIv || null,
        encryptedResolutionNotes: encryptedData.encryptedResolutionNotes || null,
        resolutionNotesIv: encryptedData.resolutionNotesIv || null,
        // Plaintext fields
        category: plaintextData?.category,
        subcategory: plaintextData?.subcategory,
        status: plaintextData?.status || "open",
        priority: plaintextData?.priority || "medium",
        confidenceLevel: plaintextData?.confidenceLevel,
        severity: plaintextData?.severity,
        urgency: plaintextData?.urgency,
        isEmergency: plaintextData?.isEmergency || false,
        emergencyType: plaintextData?.emergencyType,
        resolutionType: plaintextData?.resolutionType,
      })
      .returning({ id: issues.id });

    revalidatePath("/dashboard/issues");
    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, issueId: issue.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create issue",
    };
  }
}

/**
 * Create a new issue with plaintext data (no encryption)
 */
export async function createIssuePlaintext(
  groupId: string,
  createdBy: string,
  data: {
    title: string;
    description?: string;
    assetName?: string;
    assetDetails?: Record<string, unknown>;
    diagnosis?: string;
    ignoreRisk?: string;
    warningSignsToWatch?: string[];
    whenToEscalate?: string;
    emergencyInstructions?: string;
    resolutionNotes?: string;
  } & PlaintextIssueFields
): Promise<IssueActionResult> {
  try {
    const [issue] = await db
      .insert(issues)
      .values({
        groupId,
        createdBy,
        isEncrypted: false,
        // Plaintext PII fields
        title: data.title,
        description: data.description,
        assetName: data.assetName,
        assetDetails: data.assetDetails,
        diagnosis: data.diagnosis,
        ignoreRisk: data.ignoreRisk,
        warningSignsToWatch: data.warningSignsToWatch,
        whenToEscalate: data.whenToEscalate,
        emergencyInstructions: data.emergencyInstructions,
        resolutionNotes: data.resolutionNotes,
        // Non-PII fields
        category: data.category,
        subcategory: data.subcategory,
        status: data.status || "open",
        priority: data.priority || "medium",
        confidenceLevel: data.confidenceLevel,
        severity: data.severity,
        urgency: data.urgency,
        isEmergency: data.isEmergency || false,
        emergencyType: data.emergencyType,
        resolutionType: data.resolutionType,
      })
      .returning({ id: issues.id });

    revalidatePath("/dashboard/issues");
    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, issueId: issue.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create issue",
    };
  }
}
