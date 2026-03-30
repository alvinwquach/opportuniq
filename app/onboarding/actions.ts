"use server";

import { getCurrentUser } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { users, invites, referralCodes, referrals } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/resend";
import { geocodePostalCode } from "@/lib/geocoding";
import { generateReferralCode } from "@/lib/referral";
import { cookies } from "next/headers";
import type { RiskTolerance } from "./types";

// Type for pending user data stored in cookie
interface PendingUserData {
  accessTier: "johatsu" | "alpha" | "beta" | "public";
  referredBy: string | null;
  inviteId: string | null;
  referralCodeId: string | null;
  isAdmin: boolean;
}

export type { RiskTolerance };

export async function completeOnboarding(data: {
  // Required fields
  country: string;
  postalCode: string;
  searchRadius: number;
  // Optional fields
  theme?: "light" | "dark" | "auto";
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  phoneNumber?: string;
  // New optional fields
  riskTolerance?: RiskTolerance;
  primaryUseCase?: string;
  hourlyRate?: number;
}) {
  console.log("[Onboarding Action] Starting completeOnboarding", {
    hasPostalCode: !!data.postalCode,
    country: data.country,
    searchRadius: data.searchRadius,
    riskTolerance: data.riskTolerance,
    primaryUseCase: data.primaryUseCase,
  });

  const user = await getCurrentUser();

  if (!user) {
    console.error("[Onboarding Action] Auth error: No user");
    return { success: false as const, error: "Unauthorized - please sign in again" };
  }

  console.log("[Onboarding Action] User authenticated:", user.id);

  const {
    country,
    postalCode,
    searchRadius,
    theme,
    streetAddress,
    city,
    stateProvince,
    phoneNumber,
    riskTolerance,
    primaryUseCase,
    hourlyRate,
  } = data;

  if (!country || !postalCode || !searchRadius) {
    return { success: false as const, error: "Country, postal code, and search radius are required" };
  }

  // Countries that use miles
  const milesCountries = ["US", "GB", "MM", "LR"];
  const distanceUnit = milesCountries.includes(country) ? "miles" : "kilometers";

  // Set unit system based on country
  const imperialCountries = ["US", "LR", "MM"];
  const unitSystem = imperialCountries.includes(country) ? "imperial" : "metric";

  try {
    console.log("[Onboarding] Starting onboarding for user:", user.id);

    // Check for pending_user cookie
    let cookieStore;
    let pendingUserData: PendingUserData | null = null;
    let isNewUser = false;

    try {
      cookieStore = await cookies();
      const pendingUserCookie = cookieStore.get("pending_user");

      if (pendingUserCookie) {
        try {
          pendingUserData = JSON.parse(pendingUserCookie.value) as PendingUserData;
          isNewUser = true;
          console.log("[Onboarding] Found pending user data:", {
            accessTier: pendingUserData.accessTier,
            hasReferredBy: !!pendingUserData.referredBy,
            hasInviteId: !!pendingUserData.inviteId,
            hasReferralCodeId: !!pendingUserData.referralCodeId,
            isAdmin: pendingUserData.isAdmin,
          });
        } catch (parseError) {
          console.error("[Onboarding] Failed to parse pending_user cookie:", parseError);
        }
      }
    } catch (cookieError) {
      console.error("[Onboarding] Cookie access error:", cookieError);
    }

    // Geocode the postal code
    let geocodingResult: Awaited<ReturnType<typeof geocodePostalCode>> = null;
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const hasMapboxToken = !!mapboxToken;

    if (hasMapboxToken) {
      try {
        console.log("[Onboarding] Starting geocoding for:", postalCode, country);
        const geocodePromise = geocodePostalCode(postalCode, country);
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn("[Onboarding] Geocoding timeout after 2 seconds");
            resolve(null);
          }, 2000)
        );

        geocodingResult = await Promise.race([geocodePromise, timeoutPromise]);
        console.log("[Onboarding] Geocoding completed:", geocodingResult ? "success" : "failed/null");
      } catch (geocodeError) {
        console.error("[Onboarding] Geocoding error (non-blocking):", geocodeError);
      }
    }

    let userData: { role: "admin" | "user"; name?: string | null; id: string; email: string };

    // Check if user already exists
    console.log("[Onboarding] Checking if user exists in DB...");
    let existingUser;
    try {
      const selectPromise = db.select().from(users).where(eq(users.id, user.id));
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB query timeout")), 5000)
      );
      const result = await Promise.race([selectPromise, timeoutPromise]);
      [existingUser] = result;
      console.log("[Onboarding] DB check completed, user exists:", !!existingUser);
    } catch (dbError: unknown) {
      console.error("[Onboarding] DB check failed:", (dbError as Error)?.message);
      existingUser = null;
    }

    // Build preferences object with new fields
    const preferences = {
      unitSystem,
      theme: theme || "auto",
      ...(primaryUseCase && { primaryUseCase }),
      ...(hourlyRate && { hourlyRate }),
    } as Record<string, unknown>;

    if (existingUser) {
      // User already exists - update
      console.log("[Onboarding] User already exists in DB, updating onboarding data");

      const updateData = {
        country,
        postalCode,
        streetAddress: streetAddress || null,
        city: city || null,
        stateProvince: stateProvince || null,
        phoneNumber: phoneNumber || null,
        defaultSearchRadius: searchRadius,
        distanceUnit: distanceUnit as "miles" | "kilometers",
        preferences,
        latitude: geocodingResult?.latitude ?? null,
        longitude: geocodingResult?.longitude ?? null,
        formattedAddress: geocodingResult?.formattedAddress ?? null,
        geocodedAt: geocodingResult ? new Date() : null,
        updatedAt: new Date(),
        ...(riskTolerance && { riskTolerance }),
      };

      await db.update(users).set(updateData).where(eq(users.id, user.id));
      console.log("[Onboarding] Existing user updated with onboarding data");

      // Clear pending_user cookie
      try {
        if (cookieStore) {
          cookieStore.set("pending_user", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
          });
        }
      } catch (e) {
        // Ignore cookie errors
      }

      userData = {
        role: existingUser.role as "admin" | "user",
        name: existingUser.name,
        id: existingUser.id,
        email: existingUser.email,
      };
    } else if (isNewUser && pendingUserData) {
      // NEW USER: Create user record
      console.log("[Onboarding] Creating new user record");

      const newUserReferralCode = generateReferralCode();
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      try {
        await db.insert(users).values({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || null,
          avatarUrl,
          role: pendingUserData.isAdmin ? "admin" : "user",
          accessTier: pendingUserData.accessTier,
          referredBy: pendingUserData.referredBy,
          referralCode: newUserReferralCode,
          country,
          postalCode,
          streetAddress: streetAddress || null,
          city: city || null,
          stateProvince: stateProvince || null,
          phoneNumber: phoneNumber || null,
          defaultSearchRadius: searchRadius,
          distanceUnit: distanceUnit as "miles" | "kilometers",
          preferences,
          latitude: geocodingResult?.latitude ?? null,
          longitude: geocodingResult?.longitude ?? null,
          formattedAddress: geocodingResult?.formattedAddress ?? null,
          geocodedAt: geocodingResult ? new Date() : null,
          riskTolerance: riskTolerance || "moderate",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log("[Onboarding] User record created successfully");

        // Create referral code entry
        await db.insert(referralCodes).values({
          code: newUserReferralCode,
          ownerId: user.id,
          maxUses: null,
        });

        // Mark invite as accepted if applicable
        if (pendingUserData.inviteId) {
          await db
            .update(invites)
            .set({ acceptedAt: new Date(), userId: user.id })
            .where(eq(invites.id, pendingUserData.inviteId));
        }

        // Handle referral tracking
        if (pendingUserData.referralCodeId) {
          const [refCode] = await db
            .select()
            .from(referralCodes)
            .where(eq(referralCodes.id, pendingUserData.referralCodeId));

          if (refCode) {
            await db
              .update(referralCodes)
              .set({ useCount: refCode.useCount + 1 })
              .where(eq(referralCodes.id, refCode.id));

            await db.insert(referrals).values({
              referralCodeId: refCode.id,
              referrerId: refCode.ownerId,
              refereeEmail: user.email!,
              refereeId: user.id,
              status: "converted",
              chainDepth: 1,
              convertedAt: new Date(),
            });

            await db
              .update(users)
              .set({ referralCount: sql`${users.referralCount} + 1` })
              .where(eq(users.id, refCode.ownerId));
          }
        }

        // Clear the pending_user cookie
        try {
          if (cookieStore) {
            cookieStore.set("pending_user", "", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 0,
            });
          }
        } catch (clearCookieError) {
          console.error("[Onboarding] Failed to clear cookie:", clearCookieError);
        }

        userData = {
          role: pendingUserData.isAdmin ? "admin" : "user",
          name: user.user_metadata?.full_name || null,
          id: user.id,
          email: user.email!,
        };
      } catch (createError: unknown) {
        console.error("[Onboarding] Failed to create user:", createError);
        const createErr = createError as { code?: string; message?: string };
        if (
          createErr?.code === "23505" ||
          createErr?.message?.includes("duplicate") ||
          createErr?.message?.includes("unique")
        ) {
          const [raceUser] = await db.select().from(users).where(eq(users.id, user.id));
          if (raceUser) {
            userData = {
              role: raceUser.role as "admin" | "user",
              name: raceUser.name,
              id: raceUser.id,
              email: raceUser.email,
            };
          } else {
            return { success: false as const, error: "Failed to create user account. Please try again." };
          }
        } else {
          return { success: false as const, error: "Failed to create user account. Please try again." };
        }
      }
    } else {
      // Edge case: No user in DB and no pending cookie
      console.error("[Onboarding] No user in DB and no pending cookie - invalid state");

      const isAdminEmail =
        user.email === "alvinwquach@gmail.com" || user.email === "binarydecisions1111@gmail.com";
      const fallbackReferralCode = generateReferralCode();
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      try {
        await db.insert(users).values({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || null,
          avatarUrl,
          role: isAdminEmail ? "admin" : "user",
          accessTier: isAdminEmail ? "johatsu" : "alpha",
          referralCode: fallbackReferralCode,
          country,
          postalCode,
          streetAddress: streetAddress || null,
          city: city || null,
          stateProvince: stateProvince || null,
          phoneNumber: phoneNumber || null,
          defaultSearchRadius: searchRadius,
          distanceUnit: distanceUnit as "miles" | "kilometers",
          preferences,
          latitude: geocodingResult?.latitude ?? null,
          longitude: geocodingResult?.longitude ?? null,
          formattedAddress: geocodingResult?.formattedAddress ?? null,
          geocodedAt: geocodingResult ? new Date() : null,
          riskTolerance: riskTolerance || "moderate",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await db.insert(referralCodes).values({
          code: fallbackReferralCode,
          ownerId: user.id,
          maxUses: null,
        });

        userData = {
          role: isAdminEmail ? "admin" : "user",
          name: user.user_metadata?.full_name || null,
          id: user.id,
          email: user.email!,
        };
      } catch (fallbackError: unknown) {
        console.error("[Onboarding] Fallback user creation failed:", fallbackError);
        return { success: false as const, error: "Unable to complete onboarding. Please try signing in again." };
      }
    }

    // Send welcome email asynchronously
    sendWelcomeEmail({
      email: user.email!,
      name: userData.name ?? null,
      postalCode,
      searchRadius,
    }).catch((emailError) => {
      console.error("[Onboarding] Failed to send welcome email:", emailError);
    });

    const redirectTo = userData.role === "admin" ? "/admin" : "/dashboard";
    console.log("[Onboarding] Onboarding complete, redirecting to:", redirectTo);

    return {
      success: true as const,
      role: userData.role,
      redirectTo,
    };
  } catch (error) {
    console.error("[Onboarding] Onboarding error:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to complete onboarding",
    };
  }
}
