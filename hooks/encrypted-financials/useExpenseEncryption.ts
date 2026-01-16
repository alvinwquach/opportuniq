"use client";

/**
 * EXPENSE ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for expense data using AES-256-GCM.
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
 * 1. User submits expense form with plaintext values
 * 2. encryptExpenseData() encrypts sensitive fields client-side
 * 3. Server receives and stores only ciphertext + IVs
 * 4. On fetch, decryptExpenses() decrypts for display
 *
 * UNENCRYPTED SUPPORT:
 * Handles both encrypted rows (isEncrypted=true) and unencrypted rows
 * for flexibility in data storage.
 */

import { useState, useCallback } from "react";
import { encryptText, decryptText, type EncryptedText } from "@/lib/encryption";
import { useEncryptionKey } from "./useEncryptionKey";
import type {
  EncryptedExpenseInput,
  DecryptedExpense,
  RawExpense,
} from "./types";
import type { ExpenseFrequency } from "@/app/dashboard/settings/expenses/schemas";

export function useExpenseEncryption() {
  // Loading states for UI feedback (spinners, disabled buttons, etc.)
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  // Error state for displaying encryption failures to the user
  const [error, setError] = useState<string | null>(null);
  // Get the user's encryption key (derived from their password or stored securely)
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt expense data before sending to server.
   *
   * ENCRYPTED FIELDS (sensitive financial data):
   * - category, amount, description
   *
   * PLAINTEXT FIELDS (needed for server-side queries/sorting):
   * - date, frequency, issueId
   *
   * useCallback ensures this function maintains the same reference across renders,
   * preventing unnecessary re-renders in components that depend on it.
   */
  const encryptExpenseData = useCallback(
    async (data: {
      category: string;
      amount: number;
      description?: string;
      date: Date;
      frequency: ExpenseFrequency;
      issueId?: string;
    }): Promise<EncryptedExpenseInput> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Encrypt each sensitive field with unique IV
        const encryptedCategory = await encryptText(data.category, key);
        const encryptedAmount = await encryptText(data.amount.toString(), key);

        // Only encrypt description if provided
        let encryptedDescription: EncryptedText | null = null;
        if (data.description) {
          encryptedDescription = await encryptText(data.description, key);
        }

        return {
          encryptedCategory: encryptedCategory.ciphertext,
          categoryIv: encryptedCategory.iv,
          encryptedAmount: encryptedAmount.ciphertext,
          amountIv: encryptedAmount.iv,
          encryptedDescription: encryptedDescription?.ciphertext,
          descriptionIv: encryptedDescription?.iv,
          date: data.date,
          frequency: data.frequency,
          issueId: data.issueId,
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
   * Decrypt expenses for display.
   *
   * Handles both encrypted and unencrypted rows.
   * Processes expenses sequentially (not in parallel) to avoid overwhelming
   * the encryption API with concurrent operations.
   *
   * useCallback with [getEncryptionKey] dependency ensures stable reference.
   */
  const decryptExpenses = useCallback(
    async (expenses: RawExpense[]): Promise<DecryptedExpense[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // Initialize empty array to collect decrypted results.
        // We iterate sequentially rather than using Promise.all() to:
        // 1. Avoid overwhelming the Web Crypto API with concurrent operations
        // 2. Provide predictable memory usage for large datasets
        // 3. Allow early termination on error without partial results
        const decrypted: DecryptedExpense[] = [];

        for (const expense of expenses) {
          // Check if this row is encrypted
          if (expense.isEncrypted && expense.encryptedCategory && expense.categoryIv) {
            // Decrypt each field using its IV
            const category = await decryptText(
              { ciphertext: expense.encryptedCategory, iv: expense.categoryIv },
              key
            );

            const amount =
              expense.encryptedAmount && expense.amountIv
                ? parseFloat(
                    await decryptText(
                      { ciphertext: expense.encryptedAmount, iv: expense.amountIv },
                      key
                    )
                  )
                : 0;

            const description =
              expense.encryptedDescription && expense.descriptionIv
                ? await decryptText(
                    { ciphertext: expense.encryptedDescription, iv: expense.descriptionIv },
                    key
                  )
                : null;

            decrypted.push({
              id: expense.id,
              category,
              amount,
              description,
              date: expense.date,
              isRecurring: expense.isRecurring,
              recurringFrequency: expense.recurringFrequency,
              nextDueDate: expense.nextDueDate,
              issueId: expense.issueId,
              createdAt: expense.createdAt,
            });
          } else {
            // Unencrypted row - use values as-is
            decrypted.push({
              id: expense.id,
              category: expense.category || "",
              amount: parseFloat(expense.amount || "0"),
              description: expense.description,
              date: expense.date,
              isRecurring: expense.isRecurring,
              recurringFrequency: expense.recurringFrequency,
              nextDueDate: expense.nextDueDate,
              issueId: expense.issueId,
              createdAt: expense.createdAt,
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
    // Same dependency pattern as encryptExpenseData
    [getEncryptionKey]
  );

  // Return memoized functions and reactive state values.
  // Components using this hook will re-render when loading/error states change,
  // but the function references remain stable across those re-renders.
  return {
    encryptExpenseData,
    decryptExpenses,
    isEncrypting,
    isDecrypting,
    error,
  };
}
