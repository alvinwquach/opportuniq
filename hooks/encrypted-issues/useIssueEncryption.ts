"use client";

/**
 * ISSUE ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for issue data using AES-256-GCM.
 * Server never sees plaintext issue content.
 *
 * APPROACH: Data-Driven Field Processing
 *
 * Instead of writing repetitive if statements for each field:
 *   if (data.title) { encrypted.encryptedTitle = ...; encrypted.titleIv = ...; }
 *   if (data.description) { encrypted.encryptedDescription = ...; }
 *   // ... 10 more times
 *
 * We use a field mapping array + loop:
 *   1. Define field configs: [inputKey, encryptedKey, ivKey, isJson]
 *   2. Loop through configs, encrypt each field if present
 *   3. Build result object dynamically
 *
 * BENEFITS:
 * - Single source of truth for field relationships
 * - Adding new encrypted fields = add one line to ENCRYPTED_FIELDS
 * - Reduces ~100 lines of if statements to ~20 lines of loop logic
 * - Consistent error handling across all fields
 * - Easier to test and maintain
 */

import { useState, useCallback } from "react";
import { encryptText, decryptText } from "@/lib/encryption";
import { useEncryptionKey } from "@/hooks/encrypted-financials/useEncryptionKey";
import type {
  EncryptedIssueInput,
  DecryptedIssue,
  RawIssue,
} from "./types";

/**
 * Field mapping for encryption: [inputKey, encryptedKey, ivKey, isJson]
 *
 * - inputKey: Property name in plaintext input data
 * - encryptedKey: Property name for ciphertext in encrypted output
 * - ivKey: Property name for initialization vector
 * - isJson: Whether to JSON.stringify before encrypting (for objects/arrays)
 */
const ENCRYPTED_FIELDS: readonly [string, string, string, boolean][] = [
  ["title", "encryptedTitle", "titleIv", false],
  ["description", "encryptedDescription", "descriptionIv", false],
  ["assetName", "encryptedAssetName", "assetNameIv", false],
  ["assetDetails", "encryptedAssetDetails", "assetDetailsIv", true],
  ["diagnosis", "encryptedDiagnosis", "diagnosisIv", false],
  ["ignoreRisk", "encryptedIgnoreRisk", "ignoreRiskIv", false],
  ["warningSignsToWatch", "encryptedWarningSignsToWatch", "warningSignsToWatchIv", true],
  ["whenToEscalate", "encryptedWhenToEscalate", "whenToEscalateIv", false],
  ["emergencyInstructions", "encryptedEmergencyInstructions", "emergencyInstructionsIv", false],
  ["resolutionNotes", "encryptedResolutionNotes", "resolutionNotesIv", false],
];

export function useIssueEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt issue data before sending to server
   *
   * PSEUDOCODE:
   * 1. Get encryption key
   * 2. For each field in ENCRYPTED_FIELDS:
   *    a. Check if input has this field
   *    b. If yes: encrypt value (JSON.stringify if isJson flag set)
   *    c. Store ciphertext and IV in result object
   * 3. Return result with keyVersion
   */
  const encryptIssueData = useCallback(
    async (data: {
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
    }): Promise<EncryptedIssueInput> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const result: Record<string, string | number> = {};

        // Process all fields using the mapping
        for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
          const value = data[inputKey as keyof typeof data];
          if (value !== undefined && value !== null) {
            const textToEncrypt = isJson ? JSON.stringify(value) : String(value);
            const encrypted = await encryptText(textToEncrypt, key);
            result[encryptedKey] = encrypted.ciphertext;
            result[ivKey] = encrypted.iv;
          }
        }

        result.keyVersion = 1;
        return result as unknown as EncryptedIssueInput;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Encryption failed";
        setError(message);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [getEncryptionKey]
  );

  /**
   * Decrypt a single issue for display
   *
   * PSEUDOCODE:
   * 1. Start with plaintext fields (status, priority, etc.)
   * 2. If issue.isEncrypted:
   *    a. For each field in ENCRYPTED_FIELDS:
   *       - Check if encrypted value and IV exist
   *       - If yes: decrypt and parse (JSON.parse if isJson flag set)
   *       - Store in result object
   * 3. If not encrypted: use plaintext values directly
   */
  const decryptIssue = useCallback(
    async (issue: RawIssue): Promise<DecryptedIssue> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Base object with plaintext fields (always unencrypted)
        const base: DecryptedIssue = {
          id: issue.id,
          groupId: issue.groupId,
          category: issue.category,
          subcategory: issue.subcategory,
          status: issue.status,
          priority: issue.priority,
          confidenceLevel: issue.confidenceLevel,
          severity: issue.severity,
          urgency: issue.urgency,
          isEmergency: issue.isEmergency,
          emergencyType: issue.emergencyType,
          resolutionType: issue.resolutionType,
          resolvedAt: issue.resolvedAt,
          resolvedBy: issue.resolvedBy,
          createdBy: issue.createdBy,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          completedAt: issue.completedAt,
          // Encrypted fields - will be populated below
          title: "",
          description: null,
          assetName: null,
          assetDetails: null,
          diagnosis: null,
          ignoreRisk: null,
          warningSignsToWatch: null,
          whenToEscalate: null,
          emergencyInstructions: null,
          resolutionNotes: null,
        };

        if (issue.isEncrypted) {
          // Decrypt each field using the mapping
          for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
            const ciphertext = issue[encryptedKey as keyof RawIssue] as string | null;
            const iv = issue[ivKey as keyof RawIssue] as string | null;

            if (ciphertext && iv) {
              const decrypted = await decryptText({ ciphertext, iv }, key);
              (base as unknown as Record<string, unknown>)[inputKey] = isJson
                ? JSON.parse(decrypted)
                : decrypted;
            }
          }
        } else {
          // Use plaintext values directly
          Object.assign(base, {
            title: issue.title || "",
            description: issue.description,
            assetName: issue.assetName,
            assetDetails: issue.assetDetails,
            diagnosis: issue.diagnosis,
            ignoreRisk: issue.ignoreRisk,
            warningSignsToWatch: issue.warningSignsToWatch,
            whenToEscalate: issue.whenToEscalate,
            emergencyInstructions: issue.emergencyInstructions,
            resolutionNotes: issue.resolutionNotes,
          });
        }

        return base;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Decryption failed";
        setError(message);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [getEncryptionKey]
  );

  /**
   * Decrypt multiple issues for display
   *
   * Processes sequentially to avoid overwhelming Web Crypto API.
   * Reuses decryption logic from decryptIssue but without state updates per item.
   */
  const decryptIssues = useCallback(
    async (issues: RawIssue[]): Promise<DecryptedIssue[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const results: DecryptedIssue[] = [];

        for (const issue of issues) {
          const base: DecryptedIssue = {
            id: issue.id,
            groupId: issue.groupId,
            category: issue.category,
            subcategory: issue.subcategory,
            status: issue.status,
            priority: issue.priority,
            confidenceLevel: issue.confidenceLevel,
            severity: issue.severity,
            urgency: issue.urgency,
            isEmergency: issue.isEmergency,
            emergencyType: issue.emergencyType,
            resolutionType: issue.resolutionType,
            resolvedAt: issue.resolvedAt,
            resolvedBy: issue.resolvedBy,
            createdBy: issue.createdBy,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            completedAt: issue.completedAt,
            title: "",
            description: null,
            assetName: null,
            assetDetails: null,
            diagnosis: null,
            ignoreRisk: null,
            warningSignsToWatch: null,
            whenToEscalate: null,
            emergencyInstructions: null,
            resolutionNotes: null,
          };

          if (issue.isEncrypted) {
            for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
              const ciphertext = issue[encryptedKey as keyof RawIssue] as string | null;
              const iv = issue[ivKey as keyof RawIssue] as string | null;

              if (ciphertext && iv) {
                const decrypted = await decryptText({ ciphertext, iv }, key);
                (base as unknown as Record<string, unknown>)[inputKey] = isJson
                  ? JSON.parse(decrypted)
                  : decrypted;
              }
            }
          } else {
            Object.assign(base, {
              title: issue.title || "",
              description: issue.description,
              assetName: issue.assetName,
              assetDetails: issue.assetDetails,
              diagnosis: issue.diagnosis,
              ignoreRisk: issue.ignoreRisk,
              warningSignsToWatch: issue.warningSignsToWatch,
              whenToEscalate: issue.whenToEscalate,
              emergencyInstructions: issue.emergencyInstructions,
              resolutionNotes: issue.resolutionNotes,
            });
          }

          results.push(base);
        }

        return results;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Decryption failed";
        setError(message);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [getEncryptionKey]
  );

  return {
    encryptIssueData,
    decryptIssue,
    decryptIssues,
    isEncrypting,
    isDecrypting,
    error,
  };
}
