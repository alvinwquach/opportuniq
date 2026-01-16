/**
 * PROFILE ACTION TYPES
 *
 * Shared types for profile server actions with E2E encryption.
 *
 * ENCRYPTION MODEL:
 * - Client encrypts PII fields before sending
 * - Server stores encrypted ciphertext + IV, never sees plaintext
 * - Client decrypts after fetching using user's encryptionKey
 */

// ============================================
// INPUT TYPES (Client → Server)
// ============================================

/**
 * Encrypted profile data sent from client to server.
 * Each sensitive field has a ciphertext and IV pair.
 */
export interface EncryptedProfileInput {
  // Encrypted name
  encryptedName?: string;
  nameIv?: string;
  // Encrypted phone
  encryptedPhoneNumber?: string;
  phoneNumberIv?: string;
  // Encrypted address fields
  encryptedStreetAddress?: string;
  streetAddressIv?: string;
  encryptedCity?: string;
  cityIv?: string;
  encryptedStateProvince?: string;
  stateProvinceIv?: string;
  encryptedPostalCode?: string;
  postalCodeIv?: string;
  encryptedFormattedAddress?: string;
  formattedAddressIv?: string;
  // Encrypted financial
  encryptedMonthlyBudget?: string;
  monthlyBudgetIv?: string;
  encryptedEmergencyBuffer?: string;
  emergencyBufferIv?: string;
  // Metadata
  keyVersion?: number;
}

/**
 * Plaintext fields that can be updated alongside encrypted data.
 * These are needed for queries and don't contain PII.
 */
export interface PlaintextProfileFields {
  avatarUrl?: string;
  country?: string;
  defaultSearchRadius?: number;
  distanceUnit?: "miles" | "kilometers";
  latitude?: number | null;
  longitude?: number | null;
  geocodedAt?: Date | null;
  riskTolerance?: "none" | "very_low" | "low" | "moderate" | "high" | "very_high";
  preferences?: {
    language?: string;
    theme?: "light" | "dark" | "auto";
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    weeklyDigest?: boolean;
    unitSystem?: "imperial" | "metric";
    currency?: "USD" | "EUR" | "GBP";
  };
}

// ============================================
// RESPONSE TYPES (Server → Client)
// ============================================

/**
 * Profile record returned from the server.
 * Contains both encrypted fields and plaintext for unencrypted profiles.
 */
export interface ProfileResponse {
  id: string;
  email: string;
  avatarUrl: string | null;
  // Encryption metadata
  isProfileEncrypted: boolean;
  profileKeyVersion: number;
  profileAlgorithm: string;
  // Encrypted fields
  encryptedName: string | null;
  nameIv: string | null;
  encryptedPhoneNumber: string | null;
  phoneNumberIv: string | null;
  encryptedStreetAddress: string | null;
  streetAddressIv: string | null;
  encryptedCity: string | null;
  cityIv: string | null;
  encryptedStateProvince: string | null;
  stateProvinceIv: string | null;
  encryptedPostalCode: string | null;
  postalCodeIv: string | null;
  encryptedFormattedAddress: string | null;
  formattedAddressIv: string | null;
  encryptedMonthlyBudget: string | null;
  monthlyBudgetIv: string | null;
  encryptedEmergencyBuffer: string | null;
  emergencyBufferIv: string | null;
  // Plaintext fields (for unencrypted profiles)
  name: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
  monthlyBudget: string | null;
  emergencyBuffer: string | null;
  // Always plaintext
  country: string | null;
  defaultSearchRadius: number | null;
  distanceUnit: "miles" | "kilometers" | null;
  latitude: number | null;
  longitude: number | null;
  geocodedAt: Date | null;
  riskTolerance: string | null;
  preferences: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
