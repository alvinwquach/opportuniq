"use server";

/**
 * UPDATE LOCATION (PLAINTEXT)
 *
 * Server action for updating user location without encryption.
 * Use updateLocationEncrypted for encrypted data.
 */

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { geocodePostalCode } from "@/lib/geocoding";
import type { LocationUpdateResult } from "./types";

/**
 * Update user location without encryption (plaintext)
 */
export async function updateLocationPlaintext(
  userId: string,
  data: {
    postalCode: string;
    country?: string;
  }
): Promise<LocationUpdateResult> {
  const { postalCode, country = "US" } = data;

  if (!postalCode) {
    return { success: false, error: "Postal code is required" };
  }

  try {
    // Geocode the postal code
    let geocodingResult: Awaited<ReturnType<typeof geocodePostalCode>> = null;
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (mapboxToken) {
      try {
        const geocodePromise = geocodePostalCode(postalCode, country);
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 2000)
        );
        geocodingResult = await Promise.race([geocodePromise, timeoutPromise]);
      } catch (geocodeError) {
      }
    }

    // Countries that use miles
    const milesCountries = ["US", "GB", "MM", "LR"];
    const distanceUnit = milesCountries.includes(country) ? "miles" : "kilometers";

    await db
      .update(users)
      .set({
        postalCode,
        country,
        distanceUnit: distanceUnit as "miles" | "kilometers",
        latitude: geocodingResult?.latitude ?? null,
        longitude: geocodingResult?.longitude ?? null,
        formattedAddress: geocodingResult?.formattedAddress ?? null,
        geocodedAt: geocodingResult ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/location");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update location",
    };
  }
}
