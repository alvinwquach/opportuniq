"use server";

/**
 * UPDATE PROFILE (ENCRYPTED)
 *
 * Updates user profile with encrypted PII data.
 * Client encrypts before sending, server stores ciphertext.
 */

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { EncryptedProfileInput, PlaintextProfileFields } from "./types";

/** Encrypted field mapping: [encryptedKey, ivKey, plaintextKey] */
const ENCRYPTED_FIELD_MAP = [
  ["encryptedName", "nameIv", "name"],
  ["encryptedPhoneNumber", "phoneNumberIv", "phoneNumber"],
  ["encryptedStreetAddress", "streetAddressIv", "streetAddress"],
  ["encryptedCity", "cityIv", "city"],
  ["encryptedStateProvince", "stateProvinceIv", "stateProvince"],
  ["encryptedPostalCode", "postalCodeIv", "postalCode"],
  ["encryptedFormattedAddress", "formattedAddressIv", "formattedAddress"],
  ["encryptedMonthlyBudget", "monthlyBudgetIv", "monthlyBudget"],
  ["encryptedEmergencyBuffer", "emergencyBufferIv", "emergencyBuffer"],
] as const;

/**
 * Update user profile with encrypted data
 *
 * Accepts encrypted PII fields and optional plaintext fields.
 * Sets isProfileEncrypted = true when encrypted fields are provided.
 */
export async function updateProfileEncrypted(
  userId: string,
  encryptedData: EncryptedProfileInput,
  plaintextData?: PlaintextProfileFields
) {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Process all encrypted fields
  let hasEncryptedFields = false;
  for (const [encryptedKey, ivKey, plaintextKey] of ENCRYPTED_FIELD_MAP) {
    const encryptedValue = encryptedData[encryptedKey as keyof EncryptedProfileInput];
    const ivValue = encryptedData[ivKey as keyof EncryptedProfileInput];
    if (encryptedValue && ivValue) {
      updateData[encryptedKey] = encryptedValue;
      updateData[ivKey] = ivValue;
      updateData[plaintextKey] = null;
      hasEncryptedFields = true;
    }
  }

  // Set encryption metadata if encrypted fields were provided
  if (hasEncryptedFields) {
    updateData.isProfileEncrypted = true;
    updateData.profileKeyVersion = encryptedData.keyVersion || 1;
    updateData.profileAlgorithm = "AES-GCM-256";
  }

  // Plaintext fields (for queries, not PII) - spread only defined values
  if (plaintextData) {
    Object.assign(
      updateData,
      Object.fromEntries(
        Object.entries({
          avatarUrl: plaintextData.avatarUrl,
          country: plaintextData.country,
          defaultSearchRadius: plaintextData.defaultSearchRadius,
          distanceUnit: plaintextData.distanceUnit,
          latitude: plaintextData.latitude,
          longitude: plaintextData.longitude,
          geocodedAt: plaintextData.geocodedAt,
          riskTolerance: plaintextData.riskTolerance,
          preferences: plaintextData.preferences,
        }).filter(([, v]) => v !== undefined)
      )
    );
  }

  const [profile] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/profile");

  return profile;
}
