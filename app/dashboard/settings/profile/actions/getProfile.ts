"use server";

/**
 * GET PROFILE
 *
 * Fetches user profile data (encrypted or plaintext).
 * Client handles decryption after fetching.
 */

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import type { ProfileResponse } from "./types";

/**
 * Get user profile by ID
 *
 * Returns the raw profile with encrypted fields.
 * Client should use useProfileEncryption hook to decrypt.
 */
export async function getProfile(userId: string): Promise<ProfileResponse | null> {
  const [profile] = await db
    .select({
      id: users.id,
      email: users.email,
      avatarUrl: users.avatarUrl,
      // Encryption metadata
      isProfileEncrypted: users.isProfileEncrypted,
      profileKeyVersion: users.profileKeyVersion,
      profileAlgorithm: users.profileAlgorithm,
      // Encrypted fields
      encryptedName: users.encryptedName,
      nameIv: users.nameIv,
      encryptedPhoneNumber: users.encryptedPhoneNumber,
      phoneNumberIv: users.phoneNumberIv,
      encryptedStreetAddress: users.encryptedStreetAddress,
      streetAddressIv: users.streetAddressIv,
      encryptedCity: users.encryptedCity,
      cityIv: users.cityIv,
      encryptedStateProvince: users.encryptedStateProvince,
      stateProvinceIv: users.stateProvinceIv,
      encryptedPostalCode: users.encryptedPostalCode,
      postalCodeIv: users.postalCodeIv,
      encryptedFormattedAddress: users.encryptedFormattedAddress,
      formattedAddressIv: users.formattedAddressIv,
      encryptedMonthlyBudget: users.encryptedMonthlyBudget,
      monthlyBudgetIv: users.monthlyBudgetIv,
      encryptedEmergencyBuffer: users.encryptedEmergencyBuffer,
      emergencyBufferIv: users.emergencyBufferIv,
      // Plaintext fields
      name: users.name,
      phoneNumber: users.phoneNumber,
      streetAddress: users.streetAddress,
      city: users.city,
      stateProvince: users.stateProvince,
      postalCode: users.postalCode,
      formattedAddress: users.formattedAddress,
      monthlyBudget: users.monthlyBudget,
      emergencyBuffer: users.emergencyBuffer,
      // Always plaintext
      country: users.country,
      defaultSearchRadius: users.defaultSearchRadius,
      distanceUnit: users.distanceUnit,
      latitude: users.latitude,
      longitude: users.longitude,
      geocodedAt: users.geocodedAt,
      riskTolerance: users.riskTolerance,
      preferences: users.preferences,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!profile) return null;

  return profile as ProfileResponse;
}
