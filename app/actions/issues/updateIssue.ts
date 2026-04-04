"use server";

/**
 * UPDATE ISSUE
 *
 * Updates an existing issue with encrypted or plaintext data.
 */

import { db } from "@/app/db/client";
import { issues } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  EncryptedIssueInput,
  PlaintextIssueFields,
  IssueActionResult,
} from "./types";

/** Encrypted field mapping: [encryptedKey, ivKey, plaintextKey] */
const ENCRYPTED_FIELD_MAP = [
  ["encryptedTitle", "titleIv", "title"],
  ["encryptedDescription", "descriptionIv", "description"],
  ["encryptedAssetName", "assetNameIv", "assetName"],
  ["encryptedAssetDetails", "assetDetailsIv", "assetDetails"],
  ["encryptedDiagnosis", "diagnosisIv", "diagnosis"],
  ["encryptedIgnoreRisk", "ignoreRiskIv", "ignoreRisk"],
  ["encryptedWarningSignsToWatch", "warningSignsToWatchIv", "warningSignsToWatch"],
  ["encryptedWhenToEscalate", "whenToEscalateIv", "whenToEscalate"],
  ["encryptedEmergencyInstructions", "emergencyInstructionsIv", "emergencyInstructions"],
  ["encryptedResolutionNotes", "resolutionNotesIv", "resolutionNotes"],
] as const;

/**
 * Update an issue with encrypted data
 */
export async function updateIssueEncrypted(
  issueId: string,
  groupId: string,
  encryptedData: Partial<EncryptedIssueInput>,
  plaintextData?: Partial<PlaintextIssueFields>
): Promise<IssueActionResult> {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Process encrypted fields
    let hasEncryptedFields = false;
    for (const [encryptedKey, ivKey, plaintextKey] of ENCRYPTED_FIELD_MAP) {
      const encryptedValue = encryptedData[encryptedKey as keyof EncryptedIssueInput];
      const ivValue = encryptedData[ivKey as keyof EncryptedIssueInput];
      if (encryptedValue && ivValue) {
        updateData[encryptedKey] = encryptedValue;
        updateData[ivKey] = ivValue;
        updateData[plaintextKey] = null; // Clear plaintext
        hasEncryptedFields = true;
      }
    }

    // Set encryption metadata if encrypted fields were provided
    if (hasEncryptedFields) {
      updateData.isEncrypted = true;
      updateData.keyVersion = encryptedData.keyVersion || 1;
      updateData.algorithm = "AES-GCM-256";
    }

    // Process plaintext fields
    if (plaintextData) {
      Object.assign(
        updateData,
        Object.fromEntries(
          Object.entries({
            category: plaintextData.category,
            subcategory: plaintextData.subcategory,
            status: plaintextData.status,
            priority: plaintextData.priority,
            confidenceLevel: plaintextData.confidenceLevel,
            severity: plaintextData.severity,
            urgency: plaintextData.urgency,
            isEmergency: plaintextData.isEmergency,
            emergencyType: plaintextData.emergencyType,
            resolutionType: plaintextData.resolutionType,
            resolvedAt: plaintextData.resolvedAt,
            resolvedBy: plaintextData.resolvedBy,
            completedAt: plaintextData.completedAt,
          }).filter(([, v]) => v !== undefined)
        )
      );
    }

    await db
      .update(issues)
      .set(updateData)
      .where(and(eq(issues.id, issueId), eq(issues.groupId, groupId)));

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${issueId}`);
    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, issueId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update issue",
    };
  }
}

/**
 * Update an issue with plaintext data (no encryption)
 */
export async function updateIssuePlaintext(
  issueId: string,
  groupId: string,
  data: Partial<{
    title: string;
    description: string;
    assetName: string;
    assetDetails: Record<string, unknown>;
    diagnosis: string;
    ignoreRisk: string;
    warningSignsToWatch: string[];
    whenToEscalate: string;
    emergencyInstructions: string;
    resolutionNotes: string;
  } & PlaintextIssueFields>
): Promise<IssueActionResult> {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      isEncrypted: false,
      ...Object.fromEntries(
        Object.entries({
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
          category: data.category,
          subcategory: data.subcategory,
          status: data.status,
          priority: data.priority,
          confidenceLevel: data.confidenceLevel,
          severity: data.severity,
          urgency: data.urgency,
          isEmergency: data.isEmergency,
          emergencyType: data.emergencyType,
          resolutionType: data.resolutionType,
          resolvedAt: data.resolvedAt,
          resolvedBy: data.resolvedBy,
          completedAt: data.completedAt,
        }).filter(([, v]) => v !== undefined)
      ),
    };

    await db
      .update(issues)
      .set(updateData)
      .where(and(eq(issues.id, issueId), eq(issues.groupId, groupId)));

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${issueId}`);
    revalidatePath(`/dashboard/groups/${groupId}`);

    return { success: true, issueId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update issue",
    };
  }
}
