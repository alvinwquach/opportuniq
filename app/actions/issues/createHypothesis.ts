"use server";

/**
 * CREATE HYPOTHESIS
 *
 * Creates a new AI-generated hypothesis for an issue.
 */

import { db } from "@/app/db/client";
import { issueHypotheses } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import type {
  EncryptedHypothesisInput,
  PlaintextHypothesisFields,
  HypothesisActionResult,
} from "./types";

/**
 * Create hypothesis with encrypted data
 */
export async function createHypothesisEncrypted(
  issueId: string,
  encryptedData: EncryptedHypothesisInput,
  plaintextData: PlaintextHypothesisFields
): Promise<HypothesisActionResult> {
  try {
    const [hypothesis] = await db
      .insert(issueHypotheses)
      .values({
        issueId,
        isEncrypted: true,
        keyVersion: encryptedData.keyVersion || 1,
        algorithm: "AES-GCM-256",
        // Encrypted fields
        encryptedHypothesis: encryptedData.encryptedHypothesis,
        hypothesisIv: encryptedData.hypothesisIv,
        encryptedReasoningChain: encryptedData.encryptedReasoningChain || null,
        reasoningChainIv: encryptedData.reasoningChainIv || null,
        // Plaintext fields
        confidence: plaintextData.confidence,
        evidenceUsed: plaintextData.evidenceUsed,
      })
      .returning({ id: issueHypotheses.id });

    revalidatePath(`/dashboard/projects/${issueId}`);

    return { success: true, hypothesisId: hypothesis.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create hypothesis",
    };
  }
}

/**
 * Create hypothesis with plaintext data (no encryption)
 */
export async function createHypothesisPlaintext(
  issueId: string,
  data: {
    hypothesis: string;
    reasoningChain?: Record<string, unknown>;
  } & PlaintextHypothesisFields
): Promise<HypothesisActionResult> {
  try {
    const [hypothesis] = await db
      .insert(issueHypotheses)
      .values({
        issueId,
        isEncrypted: false,
        // Plaintext fields
        hypothesis: data.hypothesis,
        confidence: data.confidence,
        evidenceUsed: data.evidenceUsed,
        reasoningChain: data.reasoningChain,
      })
      .returning({ id: issueHypotheses.id });

    revalidatePath(`/dashboard/projects/${issueId}`);

    return { success: true, hypothesisId: hypothesis.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create hypothesis",
    };
  }
}
