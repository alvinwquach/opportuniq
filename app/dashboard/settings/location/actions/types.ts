/**
 * Type definitions for location actions
 */

/**
 * Encrypted location input from client
 */
export interface EncryptedLocationInput {
  encryptedPostalCode: string;
  postalCodeIv: string;
  encryptedFormattedAddress?: string;
  formattedAddressIv?: string;
  keyVersion?: number;
}

/**
 * Plaintext location data (coordinates remain unencrypted for queries)
 */
export interface PlaintextLocationData {
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  geocodedAt?: Date | null;
}

/**
 * Location update result
 */
export interface LocationUpdateResult {
  success: boolean;
  error?: string;
}
