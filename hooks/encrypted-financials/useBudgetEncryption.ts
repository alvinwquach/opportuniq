"use client";

/**
 * BUDGET ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for budget data using AES-256-GCM.
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
 * 1. User submits budget form with plaintext values
 * 2. encryptBudgetData() encrypts sensitive fields client-side
 * 3. Server receives and stores only ciphertext + IVs
 * 4. On fetch, decryptBudgets() decrypts for display
 *
 * UNENCRYPTED SUPPORT:
 * Handles both encrypted rows (isEncrypted=true) and unencrypted rows
 * for flexibility in data storage.
 */

import { useState, useCallback } from "react";
import { encryptText, decryptText, type EncryptedText } from "@/lib/encryption";
import { useEncryptionKey } from "./useEncryptionKey";
import type {
  EncryptedBudgetInput,
  DecryptedBudget,
  RawBudget,
} from "./types";

export function useBudgetEncryption() {
  // Loading states for UI feedback (spinners, disabled buttons, etc.)
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  // Error state for displaying encryption failures to the user
  const [error, setError] = useState<string | null>(null);
  // Get the user's encryption key (derived from their password or stored securely)
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt budget data before sending to server.
   *
   * ENCRYPTED FIELDS (sensitive financial data):
   * - category, monthlyLimit, currentSpend
   *
   * PLAINTEXT FIELDS (needed for server-side queries/sorting):
   * - updatedAt
   *
   * useCallback ensures this function maintains the same reference across renders,
   * preventing unnecessary re-renders in components that depend on it.
   */
  const encryptBudgetData = useCallback(
    async (data: {
      category: string;
      monthlyLimit: number;
      currentSpend?: number;
    }): Promise<EncryptedBudgetInput> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Encrypt each sensitive field with unique IV
        const encryptedCategory = await encryptText(data.category, key);
        const encryptedMonthlyLimit = await encryptText(data.monthlyLimit.toString(), key);

        // Only encrypt currentSpend if provided
        let encryptedCurrentSpend: EncryptedText | null = null;
        if (data.currentSpend !== undefined) {
          encryptedCurrentSpend = await encryptText(data.currentSpend.toString(), key);
        }

        return {
          encryptedCategory: encryptedCategory.ciphertext,
          categoryIv: encryptedCategory.iv,
          encryptedMonthlyLimit: encryptedMonthlyLimit.ciphertext,
          monthlyLimitIv: encryptedMonthlyLimit.iv,
          encryptedCurrentSpend: encryptedCurrentSpend?.ciphertext,
          currentSpendIv: encryptedCurrentSpend?.iv,
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
   * Decrypt budgets for display.
   *
   * Handles both encrypted and unencrypted rows.
   * Processes budgets sequentially (not in parallel) to avoid overwhelming
   * the encryption API with concurrent operations.
   *
   * useCallback with [getEncryptionKey] dependency ensures stable reference.
   */
  const decryptBudgets = useCallback(
    async (budgets: RawBudget[]): Promise<DecryptedBudget[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Initialize empty array to collect decrypted results.
        // We iterate sequentially rather than using Promise.all() to:
        // 1. Avoid overwhelming the Web Crypto API with concurrent operations
        // 2. Provide predictable memory usage for large datasets
        // 3. Allow early termination on error without partial results
        const decrypted: DecryptedBudget[] = [];

        for (const budget of budgets) {
          // Check if this row is encrypted
          if (budget.isEncrypted && budget.encryptedCategory && budget.categoryIv) {
            // Decrypt each field using its IV
            const category = await decryptText(
              { ciphertext: budget.encryptedCategory, iv: budget.categoryIv },
              key
            );

            const monthlyLimit =
              budget.encryptedMonthlyLimit && budget.monthlyLimitIv
                ? parseFloat(
                    await decryptText(
                      { ciphertext: budget.encryptedMonthlyLimit, iv: budget.monthlyLimitIv },
                      key
                    )
                  )
                : 0;

            const currentSpend =
              budget.encryptedCurrentSpend && budget.currentSpendIv
                ? parseFloat(
                    await decryptText(
                      { ciphertext: budget.encryptedCurrentSpend, iv: budget.currentSpendIv },
                      key
                    )
                  )
                : 0;

            decrypted.push({
              id: budget.id,
              category,
              monthlyLimit,
              currentSpend,
              updatedAt: budget.updatedAt,
            });
          } else {
            // Unencrypted row - use values as-is
            decrypted.push({
              id: budget.id,
              category: budget.category || "",
              monthlyLimit: parseFloat(budget.monthlyLimit || "0"),
              currentSpend: parseFloat(budget.currentSpend || "0"),
              updatedAt: budget.updatedAt,
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
    // Same dependency pattern as encryptBudgetData
    [getEncryptionKey]
  );

  // Return memoized functions and reactive state values.
  // Components using this hook will re-render when loading/error states change,
  // but the function references remain stable across those re-renders.
  return {
    encryptBudgetData,
    decryptBudgets,
    isEncrypting,
    isDecrypting,
    error,
  };
}
