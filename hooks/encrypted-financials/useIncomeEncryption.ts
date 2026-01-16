"use client";

/**
 * INCOME ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for income stream data using AES-256-GCM.
 * This enables E2E encryption where the server never sees plaintext financial data.
 *
 * REACT PATTERNS USED:
 *
 * 1. useState for loading/error states:
 *    - isEncrypting/isDecrypting: Track async operation progress for UI feedback
 *    - error: Store error messages to display to the user
 *
 * 2. useCallback with dependency array:
 *    - Memoizes functions so they maintain referential equality across re-renders
 *    - Without useCallback, these functions would be recreated on every render,
 *      causing unnecessary re-renders in child components that receive them as props
 *    - Dependency array [getEncryptionKey] means the callback is only recreated
 *      when getEncryptionKey changes (which is stable from useEncryptionKey)
 *    - If the array were empty [], the callback would capture stale closure values
 *
 * ENCRYPTION FLOW:
 * 1. User submits income form with plaintext values
 * 2. encryptIncomeData() encrypts sensitive fields client-side
 * 3. Server receives and stores only ciphertext + IVs
 * 4. On fetch, decryptIncomeStreams() decrypts for display
 */

import { useState, useCallback } from "react";
import { encryptText, decryptText, type EncryptedText } from "@/lib/encryption";
import { useEncryptionKey } from "./useEncryptionKey";
import type {
  EncryptedIncomeInput,
  DecryptedIncomeStream,
  RawIncomeStream,
} from "./types";

export function useIncomeEncryption() {
  // Loading states for UI feedback (spinners, disabled buttons, etc.)
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  // Error state for displaying encryption failures to the user
  const [error, setError] = useState<string | null>(null);
  // Get the user's encryption key (derived from their password or stored securely)
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt income data before sending to server.
   *
   * ENCRYPTED FIELDS (sensitive financial data):
   * - source, amount, description
   *
   * PLAINTEXT FIELDS (needed for server-side queries/sorting):
   * - frequency, startDate, endDate, isActive
   *
   * useCallback ensures this function maintains the same reference across renders,
   * preventing unnecessary re-renders in components that depend on it.
   */
  const encryptIncomeData = useCallback(
    async (data: {
      source: string;
      amount: number;
      description?: string;
      frequency: string;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
    }): Promise<EncryptedIncomeInput> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Encrypt each sensitive field with unique IV
        const encryptedSource = await encryptText(data.source, key);
        const encryptedAmount = await encryptText(data.amount.toString(), key);

        // Only encrypt description if provided
        let encryptedDescription: EncryptedText | null = null;
        if (data.description) {
          encryptedDescription = await encryptText(data.description, key);
        }

        return {
          encryptedSource: encryptedSource.ciphertext,
          sourceIv: encryptedSource.iv,
          encryptedAmount: encryptedAmount.ciphertext,
          amountIv: encryptedAmount.iv,
          encryptedDescription: encryptedDescription?.ciphertext,
          descriptionIv: encryptedDescription?.iv,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
          keyVersion: 1,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Encryption failed";
        setError(message);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    // Dependency array: only recreate this callback when getEncryptionKey changes.
    // getEncryptionKey is stable (memoized in useEncryptionKey), so this callback
    // effectively has a stable reference for the lifetime of the component.
    [getEncryptionKey]
  );

  /**
   * Decrypt income streams for display.
   *
   * Handles both encrypted and unencrypted rows.
   * Processes streams sequentially (not in parallel) to avoid overwhelming
   * the encryption API with concurrent operations.
   *
   * useCallback with [getEncryptionKey] dependency ensures stable reference.
   */
  const decryptIncomeStreams = useCallback(
    async (streams: RawIncomeStream[]): Promise<DecryptedIncomeStream[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Initialize empty array to collect decrypted results.
        // We iterate sequentially rather than using Promise.all() to:
        // 1. Avoid overwhelming the Web Crypto API with concurrent operations
        // 2. Provide predictable memory usage for large datasets
        // 3. Allow early termination on error without partial results
        const decrypted: DecryptedIncomeStream[] = [];

        for (const stream of streams) {
          // Check if this row is encrypted
          if (stream.isEncrypted && stream.encryptedSource && stream.sourceIv) {
            // Decrypt each field using its IV
            const source = await decryptText(
              { ciphertext: stream.encryptedSource, iv: stream.sourceIv },
              key
            );

            const amount =
              stream.encryptedAmount && stream.amountIv
                ? parseFloat(
                    await decryptText(
                      { ciphertext: stream.encryptedAmount, iv: stream.amountIv },
                      key
                    )
                  )
                : 0;

            const description =
              stream.encryptedDescription && stream.descriptionIv
                ? await decryptText(
                    { ciphertext: stream.encryptedDescription, iv: stream.descriptionIv },
                    key
                  )
                : null;

            decrypted.push({
              id: stream.id,
              source,
              amount,
              description,
              frequency: stream.frequency,
              isActive: stream.isActive,
              startDate: stream.startDate,
              endDate: stream.endDate,
              createdAt: stream.createdAt,
              updatedAt: stream.updatedAt,
            });
          } else {
            // Unencrypted row - use values as-is
            decrypted.push({
              id: stream.id,
              source: stream.source || "",
              amount: parseFloat(stream.amount || "0"),
              description: stream.description,
              frequency: stream.frequency,
              isActive: stream.isActive,
              startDate: stream.startDate,
              endDate: stream.endDate,
              createdAt: stream.createdAt,
              updatedAt: stream.updatedAt,
            });
          }
        }

        // Return the fully populated array after all items are processed
        return decrypted;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Decryption failed";
        setError(message);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    // Same dependency pattern as encryptIncomeData
    [getEncryptionKey]
  );

  // Return memoized functions and reactive state values.
  // Components using this hook will re-render when loading/error states change,
  // but the function references remain stable across those re-renders.
  return {
    encryptIncomeData,
    decryptIncomeStreams,
    isEncrypting,
    isDecrypting,
    error,
  };
}
