"use server";

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { geocodePostalCode } from "@/lib/geocoding";

export async function updateUserLocation(
  userId: string,
  data: {
    postalCode: string;
    country?: string;
  }
) {
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
        console.error("[Location Update] Geocoding error:", geocodeError);
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

    return { success: true };
  } catch (error) {
    console.error("[Location Update] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update location",
    };
  }
}
