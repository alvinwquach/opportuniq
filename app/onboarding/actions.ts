
"use server";

import { getCurrentUser } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { users, invites, referralCodes, referrals } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/resend";
import { geocodePostalCode } from "@/lib/geocoding";
import { generateReferralCode } from "@/lib/referral";
import { cookies } from "next/headers";

// Type for pending user data stored in cookie
interface PendingUserData {
  accessTier: "johatsu" | "alpha" | "beta" | "public";
  referredBy: string | null;
  inviteId: string | null;
  referralCodeId: string | null;
  isAdmin: boolean;
}

export async function completeOnboarding(data: {
  country: string;
  postalCode: string;
  searchRadius: number;
  theme?: "light" | "dark" | "auto";
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  phoneNumber?: string;
}) {
  console.log("[Onboarding Action] Starting completeOnboarding", { 
    hasPostalCode: !!data.postalCode, 
    country: data.country,
    searchRadius: data.searchRadius 
  });

  // Use cached getUser() to prevent duplicate API calls
  const user = await getCurrentUser();

  if (!user) {
    console.error("[Onboarding Action] Auth error: No user");
    return { success: false as const, error: "Unauthorized - please sign in again" };
  }

  console.log("[Onboarding Action] User authenticated:", user.id);

  const { country, postalCode, searchRadius, theme, streetAddress, city, stateProvince, phoneNumber } = data;

  if (!country || !postalCode || !searchRadius) {
    return { success: false as const, error: "Country, postal code, and search radius are required" };
  }

  // Countries that use miles (US, UK, and a few others)
  const milesCountries = ["US", "GB", "MM", "LR"];
  const distanceUnit = milesCountries.includes(country) ? "miles" : "kilometers";

  // Set unit system based on country (US, LR, MM use imperial)
  const imperialCountries = ["US", "LR", "MM"];
  const unitSystem = imperialCountries.includes(country) ? "imperial" : "metric";

  try {
    console.log("[Onboarding] Starting onboarding for user:", user.id);

    // Check for pending_user cookie (set during auth callback for new users)
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
          // Continue as existing user update
        }
      }
    } catch (cookieError) {
      console.error("[Onboarding] Cookie access error:", cookieError);
      // Continue without cookie - treat as existing user
    }

    // Geocode the postal code with timeout (don't block onboarding if it fails)
    let geocodingResult: Awaited<ReturnType<typeof geocodePostalCode>> = null;
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const hasMapboxToken = !!mapboxToken;

    if (hasMapboxToken) {
      try {
        console.log("[Onboarding] Starting geocoding for:", postalCode, country);
        // Run geocoding with a 2-second timeout
        const geocodePromise = geocodePostalCode(postalCode, country);
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn("[Onboarding] Geocoding timeout after 2 seconds - continuing without coordinates");
            resolve(null);
          }, 2000)
        );

        geocodingResult = await Promise.race([geocodePromise, timeoutPromise]);
        console.log("[Onboarding] Geocoding completed:", geocodingResult ? "success" : "failed/null");
      } catch (geocodeError) {
        console.error("[Onboarding] Geocoding error (non-blocking):", geocodeError);
        // Continue without geocoding - user can still use the app
      }
    } else {
      console.log("[Onboarding] Mapbox token not configured - skipping geocoding");
    }

    let userData: { role: "admin" | "user"; name?: string | null; id: string; email: string };

    // First, check if user already exists in DB (handles retry/refresh scenarios)
    const [existingUser] = await db.select().from(users).where(eq(users.id, user.id));

    if (existingUser) {
      // User already exists - this is a retry or refresh, just update and redirect
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
        preferences: {
          unitSystem,
          theme: theme || "auto",
        } as any,
        latitude: geocodingResult?.latitude ?? null,
        longitude: geocodingResult?.longitude ?? null,
        formattedAddress: geocodingResult?.formattedAddress ?? null,
        geocodedAt: geocodingResult ? new Date() : null,
        updatedAt: new Date(),
      };

      await db.update(users).set(updateData).where(eq(users.id, user.id));
      console.log("[Onboarding] Existing user updated with onboarding data");

      // Clear pending_user cookie if it exists
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
      // NEW USER: Create user record with all data
      console.log("[Onboarding] Creating new user record");

      const newUserReferralCode = generateReferralCode();
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      try {
        // Create user record
        await db.insert(users).values({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || null,
          avatarUrl,
          role: pendingUserData.isAdmin ? "admin" : "user",
          accessTier: pendingUserData.accessTier,
          referredBy: pendingUserData.referredBy,
          referralCode: newUserReferralCode,
          // Onboarding data
          country,
          postalCode,
          streetAddress: streetAddress || null,
          city: city || null,
          stateProvince: stateProvince || null,
          phoneNumber: phoneNumber || null,
          defaultSearchRadius: searchRadius,
          distanceUnit: distanceUnit as "miles" | "kilometers",
          preferences: {
            unitSystem,
            theme: theme || "auto",
          } as any,
          latitude: geocodingResult?.latitude ?? null,
          longitude: geocodingResult?.longitude ?? null,
          formattedAddress: geocodingResult?.formattedAddress ?? null,
          geocodedAt: geocodingResult ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log("[Onboarding] User record created successfully");

        // Create referral code entry for the new user
        await db.insert(referralCodes).values({
          code: newUserReferralCode,
          ownerId: user.id,
          maxUses: null, // Unlimited by default
        });

        console.log("[Onboarding] Referral code created:", newUserReferralCode);

        // Mark invite as accepted if applicable
        if (pendingUserData.inviteId) {
          await db
            .update(invites)
            .set({ acceptedAt: new Date(), userId: user.id })
            .where(eq(invites.id, pendingUserData.inviteId));
          console.log("[Onboarding] Invite marked as accepted:", pendingUserData.inviteId);
        }

        // Handle referral tracking if applicable
        if (pendingUserData.referralCodeId) {
          // Get the referral code details
          const [refCode] = await db
            .select()
            .from(referralCodes)
            .where(eq(referralCodes.id, pendingUserData.referralCodeId));

          if (refCode) {
            // Increment referral code usage
            await db
              .update(referralCodes)
              .set({ useCount: refCode.useCount + 1 })
              .where(eq(referralCodes.id, refCode.id));

            // Create referral record
            await db.insert(referrals).values({
              referralCodeId: refCode.id,
              referrerId: refCode.ownerId,
              refereeEmail: user.email!,
              refereeId: user.id,
              status: "converted",
              chainDepth: 1,
              convertedAt: new Date(),
            });

            // Increment referrer's referral count
            await db
              .update(users)
              .set({ referralCount: sql`${users.referralCount} + 1` })
              .where(eq(users.id, refCode.ownerId));

            console.log("[Onboarding] Referral tracking completed for code:", refCode.code);
          }
        }

        // Clear the pending_user cookie by setting it to expire immediately
        try {
          if (cookieStore) {
            cookieStore.set("pending_user", "", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 0, // Expire immediately
            });
            console.log("[Onboarding] Cleared pending_user cookie");
          }
        } catch (clearCookieError) {
          console.error("[Onboarding] Failed to clear cookie (non-blocking):", clearCookieError);
          // Continue anyway - cookie will expire naturally
        }

        userData = {
          role: pendingUserData.isAdmin ? "admin" : "user",
          name: user.user_metadata?.full_name || null,
          id: user.id,
          email: user.email!,
        };

      } catch (createError: any) {
        console.error("[Onboarding] Failed to create user:", createError);
        // Check if it's a duplicate key error (user was created in a race condition)
        if (createError?.code === '23505' || createError?.message?.includes('duplicate') || createError?.message?.includes('unique')) {
          console.log("[Onboarding] User was created in parallel request, fetching existing user");
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
      // This shouldn't happen in normal flow - user should have cookie from auth callback
      console.error("[Onboarding] No user in DB and no pending cookie - invalid state");

      // Try to create user with fallback data (using email to determine admin status)
      const isAdminEmail = user.email === "alvinwquach@gmail.com" || user.email === "binarydecisions1111@gmail.com";
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
          preferences: {
            unitSystem,
            theme: theme || "auto",
          } as any,
          latitude: geocodingResult?.latitude ?? null,
          longitude: geocodingResult?.longitude ?? null,
          formattedAddress: geocodingResult?.formattedAddress ?? null,
          geocodedAt: geocodingResult ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await db.insert(referralCodes).values({
          code: fallbackReferralCode,
          ownerId: user.id,
          maxUses: null,
        });

        console.log("[Onboarding] Created user with fallback data");

        userData = {
          role: isAdminEmail ? "admin" : "user",
          name: user.user_metadata?.full_name || null,
          id: user.id,
          email: user.email!,
        };
      } catch (fallbackError: any) {
        console.error("[Onboarding] Fallback user creation failed:", fallbackError);
        return { success: false as const, error: "Unable to complete onboarding. Please try signing in again." };
      }
    }

    console.log("[Onboarding] User role:", userData.role);

    // Send welcome email asynchronously (don't block onboarding)
    sendWelcomeEmail({
      email: user.email!,
      name: userData.name ?? null,
      postalCode,
      searchRadius,
    }).catch((emailError) => {
      console.error("[Onboarding] Failed to send welcome email (non-blocking):", emailError);
      // Don't fail the request if email fails - onboarding still succeeded
    });

    const redirectTo = userData.role === "admin" ? "/admin" : "/dashboard";
    console.log("[Onboarding] Onboarding complete, redirecting to:", redirectTo);

    const result = {
      success: true as const,
      role: userData.role,
      redirectTo
    };
    console.log("[Onboarding] Returning result:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[Onboarding] Onboarding error:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to complete onboarding"
    };
  }
}
