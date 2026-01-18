"use client";

/**
 * HYPOTHESIS ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for AI-generated hypotheses.
 *
 * APPROACH: Data-Driven Field Processing
 *
 * Instead of writing repetitive if statements for each field:
 *   if (data.hypothesis) { encrypted.encryptedHypothesis = ...; }
 *   if (data.reasoningChain) { encrypted.encryptedReasoningChain = ...; }
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
  EncryptedHypothesisInput,
  DecryptedHypothesis,
  RawHypothesis,
} from "./types";

/**
 * Field mapping for encryption: [inputKey, encryptedKey, ivKey, isJson]
 */
const ENCRYPTED_FIELDS: readonly [string, string, string, boolean][] = [
  ["hypothesis", "encryptedHypothesis", "hypothesisIv", false],
  ["reasoningChain", "encryptedReasoningChain", "reasoningChainIv", true],
];

export function useHypothesisEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt hypothesis data before sending to server
   *
   * PSEUDOCODE:
   * 1. Get encryption key
   * 2. For each field in ENCRYPTED_FIELDS:
   *    a. Check if input has this field
   *    b. If yes: encrypt value (JSON.stringify if isJson flag set)
   *    c. Store ciphertext and IV in result object
   * 3. Return result with keyVersion
   */
  const encryptHypothesisData = useCallback(
    async (data: {
      hypothesis: string;
      reasoningChain?: Record<string, unknown>;
    }): Promise<EncryptedHypothesisInput> => {
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
        return result as unknown as EncryptedHypothesisInput;
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
   * Decrypt hypothesis for display
   *
   * PSEUDOCODE:
   * 1. Start with plaintext fields (confidence, evidenceUsed, etc.)
   * 2. If hypothesis.isEncrypted:
   *    a. For each field in ENCRYPTED_FIELDS:
   *       - Check if encrypted value and IV exist
   *       - If yes: decrypt and parse (JSON.parse if isJson flag set)
   *       - Store in result object
   * 3. If not encrypted: use plaintext values directly
   */
  const decryptHypothesis = useCallback(
    async (hypothesis: RawHypothesis): Promise<DecryptedHypothesis> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Base object with plaintext fields (always unencrypted)
        const base: DecryptedHypothesis = {
          id: hypothesis.id,
          issueId: hypothesis.issueId,
          confidence: hypothesis.confidence,
          evidenceUsed: hypothesis.evidenceUsed,
          createdAt: hypothesis.createdAt,
          // Encrypted fields - will be populated below
          hypothesis: "",
          reasoningChain: null,
        };

        if (hypothesis.isEncrypted) {
          for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
            const ciphertext = hypothesis[encryptedKey as keyof RawHypothesis] as string | null;
            const iv = hypothesis[ivKey as keyof RawHypothesis] as string | null;

            if (ciphertext && iv) {
              const decrypted = await decryptText({ ciphertext, iv }, key);
              (base as unknown as Record<string, unknown>)[inputKey] = isJson
                ? JSON.parse(decrypted)
                : decrypted;
            }
          }
        } else {
          Object.assign(base, {
            hypothesis: hypothesis.hypothesis || "",
            reasoningChain: hypothesis.reasoningChain,
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
   * Decrypt multiple hypotheses
   *
   * Processes sequentially to avoid overwhelming Web Crypto API.
   */
  const decryptHypotheses = useCallback(
    async (hypotheses: RawHypothesis[]): Promise<DecryptedHypothesis[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const results: DecryptedHypothesis[] = [];

        for (const hypothesis of hypotheses) {
          const base: DecryptedHypothesis = {
            id: hypothesis.id,
            issueId: hypothesis.issueId,
            confidence: hypothesis.confidence,
            evidenceUsed: hypothesis.evidenceUsed,
            createdAt: hypothesis.createdAt,
            hypothesis: "",
            reasoningChain: null,
          };

          if (hypothesis.isEncrypted) {
            for (const [inputKey, encryptedKey, ivKey, isJson] of ENCRYPTED_FIELDS) {
              const ciphertext = hypothesis[encryptedKey as keyof RawHypothesis] as string | null;
              const iv = hypothesis[ivKey as keyof RawHypothesis] as string | null;

              if (ciphertext && iv) {
                const decrypted = await decryptText({ ciphertext, iv }, key);
                (base as unknown as Record<string, unknown>)[inputKey] = isJson
                  ? JSON.parse(decrypted)
                  : decrypted;
              }
            }
          } else {
            Object.assign(base, {
              hypothesis: hypothesis.hypothesis || "",
              reasoningChain: hypothesis.reasoningChain,
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
    encryptHypothesisData,
    decryptHypothesis,
    decryptHypotheses,
    isEncrypting,
    isDecrypting,
    error,
  };
}
