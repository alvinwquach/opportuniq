"use client";

/**
 * ACTIVITY LOG ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for issue activity log entries.
 *
 * APPROACH: Data-Driven Field Processing
 *
 * Instead of writing repetitive if statements for each field:
 *   if (data.title) { encrypted.encryptedTitle = ...; }
 *   if (data.description) { encrypted.encryptedDescription = ...; }
 *   if (data.metadata) { encrypted.encryptedMetadata = ...; }
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
  EncryptedActivityLogInput,
  DecryptedActivityLog,
  RawActivityLog,
} from "./types";

/**
 * Field mapping for encryption: [inputKey, encryptedKey, ivKey, isJson]
 */
const ENCRYPTED_FIELDS: readonly [string, string, string, boolean][] = [
  ["title", "encryptedTitle", "titleIv", false],
  ["description", "encryptedDescription", "descriptionIv", false],
  ["metadata", "encryptedMetadata", "metadataIv", true],
];

export function useActivityLogEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt activity log data before sending to server
   *
   * PSEUDOCODE:
   * 1. Get encryption key
   * 2. For each field in ENCRYPTED_FIELDS:
   *    a. Check if input has this field
   *    b. If yes: encrypt value (JSON.stringify if isJson flag set)
   *    c. Store ciphertext and IV in result object
   * 3. Return result with keyVersion
   */
  const encryptActivityLogData = useCallback(
    async (data: {
      title: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }): Promise<EncryptedActivityLogInput> => {
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
        return result as unknown as EncryptedActivityLogInput;
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
   * Decrypt activity log entry for display
   *
   * PSEUDOCODE:
   * 1. Start with plaintext fields (activityType, performedBy, etc.)
   * 2. If log.isEncrypted:
   *    a. For each field in ENCRYPTED_FIELDS:
   *       - Check if encrypted value and IV exist
   *       - If yes: decrypt and parse (JSON.parse if isJson flag set)
   *       - Store in result object
   * 3. If not encrypted: use plaintext values directly
   */
  const decryptActivityLog = useCallback(
    async (log: RawActivityLog): Promise<DecryptedActivityLog> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Base object with plaintext fields (always unencrypted)
        const base: DecryptedActivityLog = {
          id: log.id,
          issueId: log.issueId,
          activityType: log.activityType,
          performedBy: log.performedBy,
          oldValue: log.oldValue,
          newValue: log.newValue,
          relatedEntityType: log.relatedEntityType,
          relatedEntityId: log.relatedEntityId,
          createdAt: log.createdAt,
          // Encrypted fields - will be populated below
          title: "",
          description: null,
          metadata: null,
        };

        if (log.isEncrypted) {
          for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
            const ciphertext = log[encryptedKey as keyof RawActivityLog] as string | null;
            const iv = log[ivKey as keyof RawActivityLog] as string | null;

            if (ciphertext && iv) {
              const decrypted = await decryptText({ ciphertext, iv }, key);
              (base as unknown as Record<string, unknown>)[inputKey] = isJson
                ? JSON.parse(decrypted)
                : decrypted;
            }
          }
        } else {
          Object.assign(base, {
            title: log.title || "",
            description: log.description,
            metadata: log.metadata,
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
   * Decrypt multiple activity log entries
   *
   * Processes sequentially to avoid overwhelming Web Crypto API.
   */
  const decryptActivityLogs = useCallback(
    async (logs: RawActivityLog[]): Promise<DecryptedActivityLog[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const results: DecryptedActivityLog[] = [];

        for (const log of logs) {
          const base: DecryptedActivityLog = {
            id: log.id,
            issueId: log.issueId,
            activityType: log.activityType,
            performedBy: log.performedBy,
            oldValue: log.oldValue,
            newValue: log.newValue,
            relatedEntityType: log.relatedEntityType,
            relatedEntityId: log.relatedEntityId,
            createdAt: log.createdAt,
            title: "",
            description: null,
            metadata: null,
          };

          if (log.isEncrypted) {
            for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
              const ciphertext = log[encryptedKey as keyof RawActivityLog] as string | null;
              const iv = log[ivKey as keyof RawActivityLog] as string | null;

              if (ciphertext && iv) {
                const decrypted = await decryptText({ ciphertext, iv }, key);
                (base as unknown as Record<string, unknown>)[inputKey] = isJson
                  ? JSON.parse(decrypted)
                  : decrypted;
              }
            }
          } else {
            Object.assign(base, {
              title: log.title || "",
              description: log.description,
              metadata: log.metadata,
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
    encryptActivityLogData,
    decryptActivityLog,
    decryptActivityLogs,
    isEncrypting,
    isDecrypting,
    error,
  };
}
