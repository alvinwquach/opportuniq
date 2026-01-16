"use client";

/**
 * PROFILE ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for user profile data using AES-256-GCM.
 * This enables E2E encryption where the server never sees plaintext PII.
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
 * 1. User updates profile with plaintext values
 * 2. encryptProfileData() encrypts sensitive fields client-side
 * 3. Server receives and stores only ciphertext + IVs
 * 4. On fetch, decryptProfile() decrypts for display
 *
 * ENCRYPTED FIELDS:
 * - name, phoneNumber
 * - streetAddress, city, stateProvince, postalCode, formattedAddress
 * - monthlyBudget, emergencyBuffer
 */

import { useState, useCallback } from "react";
import { encryptText, decryptText } from "@/lib/encryption";
import { useEncryptionKey } from "./useEncryptionKey";
import type {
  EncryptedProfileInput,
  DecryptedProfile,
  RawProfile,
} from "./types";

export function useProfileEncryption() {
  // Loading states for UI feedback (spinners, disabled buttons, etc.)
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  // Error state for displaying encryption failures to the user
  const [error, setError] = useState<string | null>(null);
  // Get the user's encryption key (derived from their password or stored securely)
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt profile data before sending to server.
   *
   * ENCRYPTED FIELDS (PII):
   * - name, phoneNumber
   * - streetAddress, city, stateProvince, postalCode, formattedAddress
   * - monthlyBudget, emergencyBuffer
   *
   * PLAINTEXT FIELDS (needed for queries/display):
   * - email, avatarUrl, country, coordinates, preferences, timestamps
   *
   * useCallback ensures this function maintains the same reference across renders,
   * preventing unnecessary re-renders in components that depend on it.
   */
  const encryptProfileData = useCallback(
    async (data: {
      name?: string;
      phoneNumber?: string;
      streetAddress?: string;
      city?: string;
      stateProvince?: string;
      postalCode?: string;
      formattedAddress?: string;
      monthlyBudget?: number;
      emergencyBuffer?: number;
    }): Promise<EncryptedProfileInput> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const result: EncryptedProfileInput = { keyVersion: 1 };

        // Encrypt each field if provided
        if (data.name) {
          const encrypted = await encryptText(data.name, key);
          result.encryptedName = encrypted.ciphertext;
          result.nameIv = encrypted.iv;
        }

        if (data.phoneNumber) {
          const encrypted = await encryptText(data.phoneNumber, key);
          result.encryptedPhoneNumber = encrypted.ciphertext;
          result.phoneNumberIv = encrypted.iv;
        }

        if (data.streetAddress) {
          const encrypted = await encryptText(data.streetAddress, key);
          result.encryptedStreetAddress = encrypted.ciphertext;
          result.streetAddressIv = encrypted.iv;
        }

        if (data.city) {
          const encrypted = await encryptText(data.city, key);
          result.encryptedCity = encrypted.ciphertext;
          result.cityIv = encrypted.iv;
        }

        if (data.stateProvince) {
          const encrypted = await encryptText(data.stateProvince, key);
          result.encryptedStateProvince = encrypted.ciphertext;
          result.stateProvinceIv = encrypted.iv;
        }

        if (data.postalCode) {
          const encrypted = await encryptText(data.postalCode, key);
          result.encryptedPostalCode = encrypted.ciphertext;
          result.postalCodeIv = encrypted.iv;
        }

        if (data.formattedAddress) {
          const encrypted = await encryptText(data.formattedAddress, key);
          result.encryptedFormattedAddress = encrypted.ciphertext;
          result.formattedAddressIv = encrypted.iv;
        }

        if (data.monthlyBudget !== undefined) {
          const encrypted = await encryptText(data.monthlyBudget.toString(), key);
          result.encryptedMonthlyBudget = encrypted.ciphertext;
          result.monthlyBudgetIv = encrypted.iv;
        }

        if (data.emergencyBuffer !== undefined) {
          const encrypted = await encryptText(data.emergencyBuffer.toString(), key);
          result.encryptedEmergencyBuffer = encrypted.ciphertext;
          result.emergencyBufferIv = encrypted.iv;
        }

        return result;
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
   * Decrypt profile data for display.
   *
   * Handles both encrypted and unencrypted profiles.
   *
   * useCallback with [getEncryptionKey] dependency ensures stable reference.
   */
  const decryptProfile = useCallback(
    async (profile: RawProfile): Promise<DecryptedProfile> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        // If profile is encrypted, decrypt each field
        if (profile.isProfileEncrypted) {
          const decrypted: DecryptedProfile = {
            id: profile.id,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            name: null,
            phoneNumber: null,
            streetAddress: null,
            city: null,
            stateProvince: null,
            postalCode: null,
            formattedAddress: null,
            country: profile.country,
            monthlyBudget: null,
            emergencyBuffer: null,
          };

          // Decrypt name
          if (profile.encryptedName && profile.nameIv) {
            decrypted.name = await decryptText(
              { ciphertext: profile.encryptedName, iv: profile.nameIv },
              key
            );
          }

          // Decrypt phone number
          if (profile.encryptedPhoneNumber && profile.phoneNumberIv) {
            decrypted.phoneNumber = await decryptText(
              { ciphertext: profile.encryptedPhoneNumber, iv: profile.phoneNumberIv },
              key
            );
          }

          // Decrypt street address
          if (profile.encryptedStreetAddress && profile.streetAddressIv) {
            decrypted.streetAddress = await decryptText(
              { ciphertext: profile.encryptedStreetAddress, iv: profile.streetAddressIv },
              key
            );
          }

          // Decrypt city
          if (profile.encryptedCity && profile.cityIv) {
            decrypted.city = await decryptText(
              { ciphertext: profile.encryptedCity, iv: profile.cityIv },
              key
            );
          }

          // Decrypt state/province
          if (profile.encryptedStateProvince && profile.stateProvinceIv) {
            decrypted.stateProvince = await decryptText(
              { ciphertext: profile.encryptedStateProvince, iv: profile.stateProvinceIv },
              key
            );
          }

          // Decrypt postal code
          if (profile.encryptedPostalCode && profile.postalCodeIv) {
            decrypted.postalCode = await decryptText(
              { ciphertext: profile.encryptedPostalCode, iv: profile.postalCodeIv },
              key
            );
          }

          // Decrypt formatted address
          if (profile.encryptedFormattedAddress && profile.formattedAddressIv) {
            decrypted.formattedAddress = await decryptText(
              { ciphertext: profile.encryptedFormattedAddress, iv: profile.formattedAddressIv },
              key
            );
          }

          // Decrypt monthly budget
          if (profile.encryptedMonthlyBudget && profile.monthlyBudgetIv) {
            const value = await decryptText(
              { ciphertext: profile.encryptedMonthlyBudget, iv: profile.monthlyBudgetIv },
              key
            );
            decrypted.monthlyBudget = parseFloat(value);
          }

          // Decrypt emergency buffer
          if (profile.encryptedEmergencyBuffer && profile.emergencyBufferIv) {
            const value = await decryptText(
              { ciphertext: profile.encryptedEmergencyBuffer, iv: profile.emergencyBufferIv },
              key
            );
            decrypted.emergencyBuffer = parseFloat(value);
          }

          return decrypted;
        } else {
          // Unencrypted profile - use values as-is
          return {
            id: profile.id,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            name: profile.name,
            phoneNumber: profile.phoneNumber,
            streetAddress: profile.streetAddress,
            city: profile.city,
            stateProvince: profile.stateProvince,
            postalCode: profile.postalCode,
            formattedAddress: profile.formattedAddress,
            country: profile.country,
            monthlyBudget: profile.monthlyBudget ? parseFloat(profile.monthlyBudget) : null,
            emergencyBuffer: profile.emergencyBuffer ? parseFloat(profile.emergencyBuffer) : null,
          };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Decryption failed";
        setError(message);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    // Same dependency pattern as encryptProfileData
    [getEncryptionKey]
  );

  // Return memoized functions and reactive state values.
  // Components using this hook will re-render when loading/error states change,
  // but the function references remain stable across those re-renders.
  return {
    encryptProfileData,
    decryptProfile,
    isEncrypting,
    isDecrypting,
    error,
  };
}
