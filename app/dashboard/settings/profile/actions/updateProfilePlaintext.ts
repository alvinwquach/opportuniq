"use server";

/**
 * UPDATE PROFILE (PLAINTEXT)
 *
 * Updates user profile without encryption.
 * Use updateProfileEncrypted for encrypted data.
 */

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { PlaintextProfileFields } from "./types";

/**
 * Update profile without encryption
 *
 * For profiles that don't use E2E encryption.
 */
export async function updateProfilePlaintext(
  userId: string,
  data: {
    name?: string;
    phoneNumber?: string;
    streetAddress?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    formattedAddress?: string;
    monthlyBudget?: number;
    emergencyBuffer?: number;
  } & PlaintextProfileFields
) {
  // Build update object with only defined values
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    isProfileEncrypted: false,
    ...Object.fromEntries(
      Object.entries({
        // PII fields
        name: data.name,
        phoneNumber: data.phoneNumber,
        streetAddress: data.streetAddress,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        formattedAddress: data.formattedAddress,
        monthlyBudget: data.monthlyBudget?.toString(),
        emergencyBuffer: data.emergencyBuffer?.toString(),
        // Non-PII fields
        avatarUrl: data.avatarUrl,
        country: data.country,
        defaultSearchRadius: data.defaultSearchRadius,
        distanceUnit: data.distanceUnit,
        latitude: data.latitude,
        longitude: data.longitude,
        geocodedAt: data.geocodedAt,
        riskTolerance: data.riskTolerance,
        preferences: data.preferences,
      }).filter(([, v]) => v !== undefined)
    ),
  };

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
