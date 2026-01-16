"use server";

/**
 * UPDATE LOCATION (ENCRYPTED)
 *
 * Server action for updating user location with E2E encryption support.
 * Postal code and formatted address are encrypted; coordinates remain plaintext for queries.
 */

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  EncryptedLocationInput,
  PlaintextLocationData,
  LocationUpdateResult,
} from "./types";

/**
 * Update user location with encrypted data
 *
 * Client encrypts postal code before sending.
 * Geocoding is done server-side using the encrypted postal code.
 */
export async function updateLocationEncrypted(
  userId: string,
  encryptedData: EncryptedLocationInput,
  plaintextData: PlaintextLocationData
): Promise<LocationUpdateResult> {
  const { country = "US" } = plaintextData;

  try {
    // Countries that use miles
    const milesCountries = ["US", "GB", "MM", "LR"];
    const distanceUnit = milesCountries.includes(country) ? "miles" : "kilometers";

    await db
      .update(users)
      .set({
        // Encrypted fields
        encryptedPostalCode: encryptedData.encryptedPostalCode,
        postalCodeIv: encryptedData.postalCodeIv,
        postalCode: null, // Clear plaintext
        encryptedFormattedAddress: encryptedData.encryptedFormattedAddress || null,
        formattedAddressIv: encryptedData.formattedAddressIv || null,
        formattedAddress: null, // Clear plaintext
        // Encryption metadata
        isProfileEncrypted: true,
        profileKeyVersion: encryptedData.keyVersion || 1,
        profileAlgorithm: "AES-GCM-256",
        // Plaintext fields (for queries)
        country,
        distanceUnit: distanceUnit as "miles" | "kilometers",
        latitude: plaintextData.latitude ?? null,
        longitude: plaintextData.longitude ?? null,
        geocodedAt: plaintextData.geocodedAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/location");

    return { success: true };
  } catch (error) {
    console.error("[Location Update] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update location",
    };
  }
}
