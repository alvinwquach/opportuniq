import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { users, groupMembers, groupInvitations, invites, referralCodes, referrals } from "@/app/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateReferralCode } from "@/lib/referral";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const invitationToken = searchParams.get("token"); // From group magic link
  const alphaToken = searchParams.get("alpha_token"); // From admin alpha invite
  const referralCode = searchParams.get("ref"); // From beta referral
  const next = searchParams.get("next") ?? "/";

  console.log("[Auth Callback] Starting callback handler", {
    url: url.toString(),
    hasCode: !!code,
    codeLength: code?.length,
    hasError: !!errorParam,
    error: errorParam,
    errorCode: searchParams.get("error_code"),
    hasInvitationToken: !!invitationToken,
    hasAlphaToken: !!alphaToken,
    hasReferralCode: !!referralCode,
    next,
    origin,
  });

  // Handle OAuth errors FIRST (before any processing)
  if (errorParam) {
    const errorDescription = searchParams.get("error_description") || "Unknown error";
    const errorCode = searchParams.get("error_code");
    
    console.error("[Auth Callback] OAuth error received", {
      error: errorParam,
      errorCode,
      description: errorDescription,
    });
    
    // If flow state not found, the code expired - redirect to login with message
    if (errorParam === "server_error" && errorCode === "flow_state_not_found") {
      console.log("[Auth Callback] OAuth code expired - redirecting to login");
      return NextResponse.redirect(`${origin}/auth/login?error=expired&message=${encodeURIComponent("Your login session expired. Please try again.")}`, { status: 302 });
    }
    
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorParam)}&description=${encodeURIComponent(errorDescription)}`, { status: 302 });
  }

  if (code) {
    // CRITICAL: Exchange code IMMEDIATELY - codes expire in ~60 seconds
    // Do this BEFORE any database queries
    const supabase = await createClient();
    
    console.log("[Auth Callback] Exchanging code for session (must be fast)", { codeLength: code.length });
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[Auth Callback] Session exchange result", {
      success: !error,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      error: error?.message,
    });

    // Handle exchange errors
    if (error) {
      console.error("[Auth Callback] Code exchange failed", { error: error.message });
      
      // If code expired or invalid, redirect to login
      if (error.message.includes("expired") || error.message.includes("invalid") || error.message.includes("flow_state")) {
        return NextResponse.redirect(`${origin}/auth/login?error=expired`);
      }
      
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`);
    }

    if (!data?.user) {
      console.error("[Auth Callback] No user in session data");
      return NextResponse.redirect(`${origin}/auth/error`);
    }

    const userId = data.user.id;
    const userEmail = data.user.email!;

    console.log("[Auth Callback] Processing user", { userId, userEmail });

    // NOW do database queries (code is already exchanged, so we have time)
    // Check if user exists in our database with timeout protection
    let existingUser;
    try {
      console.log("[Auth Callback] Starting database query for user", { userId });
      const queryPromise = db.select().from(users).where(eq(users.id, userId));
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Database query timeout")), 5000)
      );
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      [existingUser] = result as Awaited<typeof queryPromise>;
      console.log("[Auth Callback] Database query completed", { found: !!existingUser });
    } catch (dbError: any) {
      // Enhanced error logging for database connection issues
      const errorMessage = dbError?.message || String(dbError);
      const errorCode = dbError?.code || dbError?.cause?.code;
      const errorHostname = dbError?.cause?.hostname;
      
      console.error("[Auth Callback] Database query error:", {
        message: errorMessage,
        code: errorCode,
        hostname: errorHostname,
        isDnsError: errorCode === "ENOTFOUND",
        isConnectionError: errorCode === "ECONNREFUSED" || errorCode === "ETIMEDOUT",
        stack: process.env.NODE_ENV === "development" ? dbError?.stack : undefined,
      });
      
      // Provide specific guidance based on error type
      if (errorCode === "ENOTFOUND") {
        console.error(
          "[Auth Callback] DNS resolution failed - database hostname cannot be found.\n" +
          "This usually means:\n" +
          "1. The DATABASE_URL environment variable has an incorrect or outdated hostname\n" +
          "2. The Supabase project was deleted or paused\n" +
          "3. Network connectivity issues\n" +
          `Hostname: ${errorHostname || "unknown"}\n` +
          "Please verify your DATABASE_URL in your environment variables."
        );
      } else if (errorCode === "ECONNREFUSED" || errorCode === "ETIMEDOUT") {
        console.error(
          "[Auth Callback] Database connection refused or timed out.\n" +
          "This usually means:\n" +
          "1. The database server is down or unreachable\n" +
          "2. Firewall or network restrictions are blocking the connection\n" +
          "3. The connection string has incorrect port or credentials"
        );
      }
      
      // If DB query fails, redirect anyway - user is authenticated in Supabase
      // Default to dashboard since we can't check role
      console.log("[Auth Callback] Redirecting to dashboard due to DB error");
      return NextResponse.redirect(`${origin}/dashboard`, { status: 302 });
    }

    const isNewUser = !existingUser;

    console.log("[Auth Callback] User lookup result", {
      userId,
      userEmail,
      isNewUser,
      existingUserRole: existingUser?.role,
      existingUserPostalCode: existingUser?.postalCode,
    });

    // Get avatar URL from OAuth metadata
    const avatarUrl = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;

    // Step 1: Create user record if new
    if (isNewUser) {
        // Check if this is an admin user
        const adminEmails = [
          "alvinwquach@gmail.com",
          "BinaryDecisions1111@gmail.com",
        ];
        const isAdmin = adminEmails.includes(userEmail);

        // Determine access tier and referrer
        // Default for admins - set to johatsu
        let accessTier: "johatsu" | "alpha" | "beta" | "public" = isAdmin ? "johatsu" : "alpha"; 
        let referredById: string | null = null;

        // Check for invite token (johatsu, alpha, or beta)
        if (alphaToken && !isAdmin) {
          const [invite] = await db
            .select()
            .from(invites)
            .where(eq(invites.token, alphaToken));

          if (invite && !invite.acceptedAt && new Date() < invite.expiresAt) {
            accessTier = invite.tier as "johatsu" | "alpha" | "beta";
            referredById = invite.invitedBy;

            // Mark invite as accepted
            await db
              .update(invites)
              .set({ acceptedAt: new Date(), userId })
              .where(eq(invites.id, invite.id));

            console.log("[Auth Callback] Invite accepted", { token: alphaToken, invitedBy: referredById, accessTier });
          } else {
            // Invalid or expired token - redirect to error
            console.log("[Auth Callback] Invalid invite token", { token: alphaToken });
            return NextResponse.redirect(`${origin}/join?error=invalid_invite`);
          }
        }
        // Check for beta referral code
        else if (referralCode && !isAdmin) {
          const [refCode] = await db
            .select()
            .from(referralCodes)
            .where(eq(referralCodes.code, referralCode.toUpperCase()));

          if (refCode && refCode.isActive === "true") {
            // Check usage limits
            if (!refCode.maxUses || refCode.useCount < refCode.maxUses) {
              accessTier = "beta";
              referredById = refCode.ownerId;

              // Increment referral code usage
              await db
                .update(referralCodes)
                .set({ useCount: refCode.useCount + 1 })
                .where(eq(referralCodes.id, refCode.id));

              // Create referral record
              await db.insert(referrals).values({
                referralCodeId: refCode.id,
                referrerId: refCode.ownerId,
                refereeEmail: userEmail,
                refereeId: userId,
                status: "converted",
                chainDepth: 1, // TODO: Calculate actual depth
                convertedAt: new Date(),
              });

              // Increment referrer's referral count
              await db
                .update(users)
                .set({ referralCount: sql`${users.referralCount} + 1` })
                .where(eq(users.id, refCode.ownerId));

              console.log("[Auth Callback] Beta referral accepted", { referralCode, referredBy: referredById });
            } else {
              console.log("[Auth Callback] Referral code max uses reached", { referralCode });
              return NextResponse.redirect(`${origin}/join?error=code_exhausted`);
            }
          } else {
            console.log("[Auth Callback] Invalid referral code", { referralCode });
            return NextResponse.redirect(`${origin}/join?error=invalid_code`);
          }
        }
        // No valid access method for non-admin
        else if (!isAdmin) {
          // Block public signups - redirect to join page
          console.log("[Auth Callback] No access token - blocking signup");
          return NextResponse.redirect(`${origin}/join?error=access_required`);
        }

        // Generate a referral code for this new user
        const newUserReferralCode = generateReferralCode();

        await db.insert(users).values({
          id: userId,
          email: userEmail,
          name: data.user.user_metadata?.full_name || null,
          avatarUrl,
          role: isAdmin ? "admin" : "user",
          accessTier: accessTier,
          referredBy: referredById,
          referralCode: newUserReferralCode,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create referral code entry for the new user
        await db.insert(referralCodes).values({
          code: newUserReferralCode,
          ownerId: userId,
          maxUses: null, // Unlimited by default
        });

        console.log("[Auth Callback] Created new user", {
          userId,
          userEmail,
          isAdmin,
          accessTier,
          referredBy: referredById,
          referralCode: newUserReferralCode,
          avatarUrl
        });
      } else {
        // Update avatar URL and access tier for existing users (in case it changed)
        // For admins, ensure they have johatsu tier
        const adminEmails = [
          "alvinwquach@gmail.com",
          "BinaryDecisions1111@gmail.com",
        ];
        const isAdmin = adminEmails.includes(userEmail);
        
        // Use Promise.race to prevent hanging on slow DB updates
        try {
          await Promise.race([
            db
              .update(users)
              .set({
                avatarUrl,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
                // Update admin access tier to johatsu if they're an admin
                ...(isAdmin ? { accessTier: "johatsu" as const } : {}),
              })
              .where(eq(users.id, userId)),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Update timeout")), 3000)
            )
          ]);
          console.log("[Auth Callback] Updated existing user", { userId, avatarUrl, isAdmin, accessTier: isAdmin ? "johatsu" : "unchanged" });
        } catch (updateError) {
          console.warn("[Auth Callback] User update failed (non-critical):", updateError);
          // Continue anyway - user is authenticated
        }
      }

    // Step 4: Handle invitation token if present
    if (invitationToken) {
        console.log("[Auth Callback] Processing invitation token", { invitationToken });
        const [invitation] = await db
          .select()
          .from(groupInvitations)
          .where(
            and(
              eq(groupInvitations.token, invitationToken),
              eq(groupInvitations.inviteeEmail, userEmail)
            )
          );

        if (invitation && !invitation.acceptedAt) {
          // Validate token hasn't expired
          if (new Date() < invitation.expiresAt) {
            // Add user to the invited group with PENDING status (requires coordinator approval)
            await db.insert(groupMembers).values({
              groupId: invitation.groupId,
              userId: userId,
              role: "participant", // Standard involvement level
              status: "pending", // Waiting for coordinator approval
              invitedAt: invitation.createdAt,
              joinedAt: new Date(), // They joined, but not yet approved
            });

            // Mark invitation as accepted (user clicked link and signed up)
            await db
              .update(groupInvitations)
              .set({ acceptedAt: new Date() })
              .where(eq(groupInvitations.id, invitation.id));

            // NEW USERS with invitation → onboarding first, then to pending page
            if (isNewUser) {
              console.log("[Auth Callback] New user with invitation → redirecting to onboarding", {
                redirectAfter: `/groups/${invitation.groupId}/pending`,
              });
              return NextResponse.redirect(
                `${origin}/onboarding?redirect=/groups/${invitation.groupId}/pending`
              );
            }

            // EXISTING USERS with invitation → directly to pending page
            console.log("[Auth Callback] Existing user with invitation → redirecting to pending page", {
              groupId: invitation.groupId,
            });
            return NextResponse.redirect(
              `${origin}/groups/${invitation.groupId}/pending`
            );
          } else {
            // Token expired
            return NextResponse.redirect(
              `${origin}/invite/expired?email=${encodeURIComponent(userEmail)}`
            );
          }
        }
      }

    // Step 5: Regular redirect for solo users
    // NEW USERS without invitation → onboarding
    if (isNewUser) {
      console.log("[Auth Callback] New user without invitation → redirecting to onboarding");
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    // EXISTING USERS without invitation → dashboard or custom redirect
    // Admin users go to /admin, regular users go to /dashboard (or custom redirect)
    const isExistingAdmin = existingUser?.role === "admin";
    const destination = next !== "/" ? next : isExistingAdmin ? "/admin" : "/dashboard";
    
    console.log("[Auth Callback] Existing user → redirecting to", {
      isAdmin: isExistingAdmin,
      requestedNext: next,
      finalDestination: destination,
    });
    
    // Create redirect response with absolute URL
    const redirectUrl = new URL(destination, origin).toString();
    
    console.log("[Auth Callback] Redirect URL", { redirectUrl, origin, destination });
    
    // Use 302 (temporary redirect) for better browser compatibility
    console.log("[Auth Callback] Creating redirect response", { redirectUrl });
    const response = NextResponse.redirect(redirectUrl, { status: 302 });
    
    // Set headers to ensure redirect works
    response.headers.set("Location", redirectUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    
    console.log("[Auth Callback] Sending redirect response", { 
      status: 302, 
      location: redirectUrl 
    });
    
    return response;
  }

  // Error fallback
  console.log("[Auth Callback] Error fallback - no valid code or session");
  return NextResponse.redirect(`${origin}/auth/error`);
}
