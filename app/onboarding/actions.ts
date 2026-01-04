
"use server";

import { getCachedUser } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/resend";
import { geocodePostalCode } from "@/lib/geocoding";

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
  const user = await getCachedUser();

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

    // Update user with onboarding preferences and geocoded coordinates
    // Add aggressive timeout to database operations to prevent hanging
    console.log("[Onboarding] Updating user in database");
    
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
      // Store geocoded coordinates if available
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
      // User can update their profile later
    }

    // Get user data for email and redirect (with timeout)
    // If this fails, we'll use a fallback based on email
    let userData;
    try {
      console.log("[Onboarding] Fetching user data for redirect");
      const selectPromise = db
        .select()
        .from(users)
        .where(eq(users.id, user.id));
      
      // Aggressive 1.5 second timeout - use fallback if DB is slow
      const selectTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => {
          console.warn("[Onboarding] Database select TIMEOUT after 1.5 seconds - using fallback");
          reject(new Error("Database select timeout"));
        }, 1500)
      );

      const result = await Promise.race([selectPromise, selectTimeout]) as Awaited<typeof selectPromise>;
      [userData] = result;
      console.log("[Onboarding] User data fetched:", { role: userData?.role, hasData: !!userData });
    } catch (dbSelectError: any) {
      const errorMsg = dbSelectError?.message || String(dbSelectError);
      console.warn("[Onboarding] Database select error (using fallback):", errorMsg);
      // Fallback: check if user email is admin email
      const isAdminEmail = user.email === "alvinwquach@gmail.com";
      userData = {
        role: isAdminEmail ? ("admin" as const) : ("user" as const),
        id: user.id,
        email: user.email!,
      };
      console.log("[Onboarding] Using fallback user data:", userData);
    }

    if (!userData) {
      console.error("[Onboarding] User data not found after update");
      return { success: false, error: "Failed to retrieve user data" };
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
