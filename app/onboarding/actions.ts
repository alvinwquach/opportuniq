
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
    return { success: false, error: "Unauthorized - please sign in again" };
  }

  console.log("[Onboarding Action] User authenticated:", user.id);

  const { country, postalCode, searchRadius, theme, streetAddress, city, stateProvince, phoneNumber } = data;

  if (!country || !postalCode || !searchRadius) {
    return { success: false, error: "Country, postal code, and search radius are required" };
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
    const cookieStore = await cookies();
    const pendingUserCookie = cookieStore.get("pending_user");
    let pendingUserData: PendingUserData | null = null;
    let isNewUser = false;

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

    // Handle new user creation vs existing user update
    if (isNewUser && pendingUserData) {
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

        // Clear the pending_user cookie
        cookieStore.delete("pending_user");
        console.log("[Onboarding] Cleared pending_user cookie");

        userData = {
          role: pendingUserData.isAdmin ? "admin" : "user",
          name: user.user_metadata?.full_name || null,
          id: user.id,
          email: user.email!,
        };

      } catch (createError: any) {
        console.error("[Onboarding] Failed to create user:", createError);
        return { success: false, error: "Failed to create user account. Please try again." };
      }

    } else {
      // EXISTING USER: Update with onboarding preferences
      console.log("[Onboarding] Updating existing user in database");

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

      try {
        console.log("[Onboarding] Executing database update query");
        const updatePromise = db
          .update(users)
          .set(updateData)
          .where(eq(users.id, user.id));

        // Aggressive 1.5 second timeout - if DB is slow, skip update and continue
        const updateTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => {
            console.warn("[Onboarding] Database update TIMEOUT after 1.5 seconds - continuing without update");
            reject(new Error("Database update timeout"));
          }, 1500)
        );

        await Promise.race([updatePromise, updateTimeout]);
        console.log("[Onboarding] User updated successfully");
      } catch (dbUpdateError: any) {
        const errorMsg = dbUpdateError?.message || String(dbUpdateError);
        console.error("[Onboarding] Database update error (non-blocking):", errorMsg);
        // Continue even if update fails - onboarding can complete without DB update
      }

      // Get user data for email and redirect (with timeout)
      try {
        console.log("[Onboarding] Fetching user data for redirect");
        const selectPromise = db
          .select()
          .from(users)
          .where(eq(users.id, user.id));

        const selectTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => {
            console.warn("[Onboarding] Database select TIMEOUT after 1.5 seconds - using fallback");
            reject(new Error("Database select timeout"));
          }, 1500)
        );

        const result = await Promise.race([selectPromise, selectTimeout]) as Awaited<typeof selectPromise>;
        const [existingUserData] = result;

        if (existingUserData) {
          userData = {
            role: existingUserData.role as "admin" | "user",
            name: existingUserData.name,
            id: existingUserData.id,
            email: existingUserData.email,
          };
        } else {
          throw new Error("User not found");
        }
        console.log("[Onboarding] User data fetched:", { role: userData.role });
      } catch (dbSelectError: any) {
        const errorMsg = dbSelectError?.message || String(dbSelectError);
        console.warn("[Onboarding] Database select error (using fallback):", errorMsg);
        // Fallback: check if user email is admin email
        const isAdminEmail = user.email === "alvinwquach@gmail.com" || user.email === "binarydecisions1111@gmail.com";
        userData = {
          role: isAdminEmail ? "admin" : "user",
          id: user.id,
          email: user.email!,
        };
        console.log("[Onboarding] Using fallback user data:", userData);
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

    return {
      success: true,
      role: userData.role,
      redirectTo
    };
  } catch (error) {
    console.error("[Onboarding] Onboarding error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete onboarding"
    };
  }
}
