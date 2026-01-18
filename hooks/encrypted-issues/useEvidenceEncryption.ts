"use client";

/**
 * EVIDENCE ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for issue evidence data.
 *
 * APPROACH: Data-Driven Field Processing
 *
 * Instead of writing repetitive if statements for each field:
 *   if (data.fileName) { encrypted.encryptedFileName = ...; }
 *   if (data.content) { encrypted.encryptedContent = ...; }
 *   // ... repeated for each field
 *
 * We use a field mapping array + loop:
 *   1. Define field configs: [inputKey, encryptedKey, ivKey, isJson]
 *   2. Loop through configs, encrypt each field if present
 *   3. Build result object dynamically
 *
 * BENEFITS:
 * - Single source of truth for field relationships
 * - Adding new encrypted fields = add one line to ENCRYPTED_FIELDS
 * - Consistent error handling across all fields
 * - Easier to test and maintain
 */

import { useState, useCallback } from "react";
import { encryptText, decryptText } from "@/lib/encryption";
import { useEncryptionKey } from "@/hooks/encrypted-financials/useEncryptionKey";
import type {
  EncryptedEvidenceInput,
  DecryptedEvidence,
  RawEvidence,
} from "./types";

/**
 * Field mapping for encryption: [inputKey, encryptedKey, ivKey, isJson]
 */
const ENCRYPTED_FIELDS: readonly [string, string, string, boolean][] = [
  ["fileName", "encryptedFileName", "fileNameIv", false],
  ["content", "encryptedContent", "contentIv", false],
  ["extractedInfo", "encryptedExtractedInfo", "extractedInfoIv", true],
];

export function useEvidenceEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt evidence data before sending to server
   *
   * PSEUDOCODE:
   * 1. Get encryption key
   * 2. For each field in ENCRYPTED_FIELDS:
   *    a. Check if input has this field
   *    b. If yes: encrypt value (JSON.stringify if isJson flag set)
   *    c. Store ciphertext and IV in result object
   * 3. Return result with keyVersion
   */
  const encryptEvidenceData = useCallback(
    async (data: {
      fileName?: string;
      content?: string;
      extractedInfo?: Record<string, unknown>;
    }): Promise<EncryptedEvidenceInput> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const result: Record<string, string | number> = {};

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
        return result as unknown as EncryptedEvidenceInput;
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
   * Decrypt evidence for display
   *
   * PSEUDOCODE:
   * 1. Start with plaintext fields (evidenceType, storageUrl, etc.)
   * 2. If evidence.isEncrypted:
   *    a. For each field in ENCRYPTED_FIELDS:
   *       - Check if encrypted value and IV exist
   *       - If yes: decrypt and parse (JSON.parse if isJson flag set)
   *       - Store in result object
   * 3. If not encrypted: use plaintext values directly
   */
  const decryptEvidence = useCallback(
    async (evidence: RawEvidence): Promise<DecryptedEvidence> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Base object with plaintext fields (always unencrypted)
        const base: DecryptedEvidence = {
          id: evidence.id,
          issueId: evidence.issueId,
          evidenceType: evidence.evidenceType,
          storageUrl: evidence.storageUrl,
          encryptionIv: evidence.encryptionIv,
          fileSize: evidence.fileSize,
          mimeType: evidence.mimeType,
          uploadedBy: evidence.uploadedBy,
          createdAt: evidence.createdAt,
          // Encrypted fields - will be populated below
          fileName: null,
          content: null,
          extractedInfo: null,
        };

        if (evidence.isEncrypted) {
          for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
            const ciphertext = evidence[encryptedKey as keyof RawEvidence] as string | null;
            const iv = evidence[ivKey as keyof RawEvidence] as string | null;

            if (ciphertext && iv) {
              const decrypted = await decryptText({ ciphertext, iv }, key);
              (base as unknown as Record<string, unknown>)[inputKey] = isJson
                ? JSON.parse(decrypted)
                : decrypted;
            }
          }
        } else {
          Object.assign(base, {
            fileName: evidence.fileName,
            content: evidence.content,
            extractedInfo: evidence.extractedInfo,
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
   * Decrypt multiple evidence items
   *
   * Processes sequentially to avoid overwhelming Web Crypto API.
   */
  const decryptEvidenceList = useCallback(
    async (evidenceList: RawEvidence[]): Promise<DecryptedEvidence[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const results: DecryptedEvidence[] = [];

        for (const evidence of evidenceList) {
          const base: DecryptedEvidence = {
            id: evidence.id,
            issueId: evidence.issueId,
            evidenceType: evidence.evidenceType,
            storageUrl: evidence.storageUrl,
            encryptionIv: evidence.encryptionIv,
            fileSize: evidence.fileSize,
            mimeType: evidence.mimeType,
            uploadedBy: evidence.uploadedBy,
            createdAt: evidence.createdAt,
            fileName: null,
            content: null,
            extractedInfo: null,
          };

          if (evidence.isEncrypted) {
            for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
              const ciphertext = evidence[encryptedKey as keyof RawEvidence] as string | null;
              const iv = evidence[ivKey as keyof RawEvidence] as string | null;

              if (ciphertext && iv) {
                const decrypted = await decryptText({ ciphertext, iv }, key);
                (base as unknown as Record<string, unknown>)[inputKey] = isJson
                  ? JSON.parse(decrypted)
                  : decrypted;
              }
            }
          } else {
            Object.assign(base, {
              fileName: evidence.fileName,
              content: evidence.content,
              extractedInfo: evidence.extractedInfo,
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
    encryptEvidenceData,
    decryptEvidence,
    decryptEvidenceList,
    isEncrypting,
    isDecrypting,
    error,
  };
}
