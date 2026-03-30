import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { users, groupMembers, groupInvitations, invites, referralCodes, referrals } from "@/app/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateReferralCode } from "@/lib/referral";

// Helper to create a redirect response while preserving cookies from the original response
function createRedirectWithCookies(
  url: string,
  sourceResponse: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(url, { status: 302 });

  // Copy all cookies from the source response to the redirect response
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite as "lax" | "strict" | "none" | undefined,
      maxAge: cookie.maxAge,
      expires: cookie.expires,
    });
  });

  return redirectResponse;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const invitationToken = searchParams.get("token"); // From group magic link
  const inviteToken = searchParams.get("invite_token"); // From admin invite (johatsu/alpha/beta)
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
    hasInviteToken: !!inviteToken,
    hasReferralCode: !!referralCode,
    next,
    origin,
  });

  try {
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

    // If someone visits callback directly without a code, redirect them appropriately
    if (!code) {
      console.log("[Auth Callback] No code provided - redirecting");
      // If they have an invite token, send them to the join page
      if (inviteToken) {
        return NextResponse.redirect(`${origin}/join?token=${inviteToken}`, { status: 302 });
      }
      // Otherwise send to login
      return NextResponse.redirect(`${origin}/auth/login`, { status: 302 });
    }

  // Create Supabase client with request cookies for PKCE code verifier
  // This is critical: PKCE code verifier must be read from request cookies
  const supabaseResponse = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          // Read cookies from the incoming request headers
          // This ensures we can access the PKCE code verifier stored by the browser client
          const cookieHeader = request.headers.get("cookie") || "";
          const cookies: { name: string; value: string }[] = [];
          
          if (cookieHeader) {
            cookieHeader.split(";").forEach((cookie) => {
              const trimmed = cookie.trim();
              const equalIndex = trimmed.indexOf("=");
              if (equalIndex > 0) {
                const name = trimmed.substring(0, equalIndex).trim();
                const value = trimmed.substring(equalIndex + 1).trim();
                if (name) {
                  cookies.push({ name, value });
                }
              }
            });
          }
          
          return cookies;
        },
        setAll(cookiesToSet) {
          // Set cookies on the response so they persist
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    // CRITICAL: Exchange code IMMEDIATELY - codes expire in ~60 seconds
    // Do this BEFORE any database queries
    
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

      // Handle PKCE code verifier errors - this happens when:
      // 1. Auth flow was started on a different device/browser
      // 2. Cookies were cleared/blocked
      // 3. User navigated away and came back
      if (error.message.includes("code verifier") || error.message.includes("PKCE")) {
        console.error("[Auth Callback] PKCE verification failed - cookies may not have been sent correctly");
        const errorMsg = encodeURIComponent("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.");
        return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent("pkce_error")}&error_description=${errorMsg}`, { status: 302 });
      }

      // If code expired or invalid, redirect to login
      if (error.message.includes("expired") || error.message.includes("invalid") || error.message.includes("flow_state")) {
        return NextResponse.redirect(`${origin}/auth/login?error=expired`, { status: 302 });
      }

      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`, { status: 302 });
    }

    if (!data?.user) {
      console.error("[Auth Callback] No user in session data");
      return NextResponse.redirect(`${origin}/auth/error`, { status: 302 });
    }

    const userId = data.user.id;
    const userEmail = data.user.email!;
    const avatarUrl = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;

    console.log("[Auth Callback] Processing user", { userId, userEmail });

    // Fast path for known admin emails - skip DB query entirely
    const ADMIN_EMAILS = ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"];
    const isKnownAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());

    if (isKnownAdmin && !invitationToken && !inviteToken) {
      // Admin fast path - redirect directly to admin without DB query
      // Skip fast path if they have an invite token that needs processing
      const destination = next !== "/" ? next : "/admin";
      console.log("[Auth Callback] Admin fast path → redirecting to", destination);
      return createRedirectWithCookies(`${origin}${destination}`, supabaseResponse);
    }

    // For non-admins or admins with invitation tokens, check DB
    console.log("[Auth Callback] Starting DB query...");
    const startTime = Date.now();
    const [existingUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, userId));
    console.log("[Auth Callback] DB query completed in", Date.now() - startTime, "ms");
    const isNewUser = !existingUser;

    console.log("[Auth Callback] User lookup result", {
      userId,
      userEmail,
      isNewUser,
      existingUserRole: existingUser?.role,
    });

    // Step 1: For new users, validate access and store pending data in cookie
    // User creation is deferred to onboarding completion
    if (isNewUser) {
        // Check if this is an admin user
        const adminEmails = [
          "alvinwquach@gmail.com",
          "binarydecisions1111@gmail.com",
        ];
        const isAdmin = adminEmails.includes(userEmail.toLowerCase());

        // Determine access tier and referrer
        // Default for admins - set to johatsu
        let accessTier: "johatsu" | "alpha" | "beta" | "public" = isAdmin ? "johatsu" : "alpha";
        let referredById: string | null = null;
        let inviteId: string | null = null;
        let referralCodeId: string | null = null;

        // Check for invite token (johatsu, alpha, or beta)
        if (inviteToken && !isAdmin) {
          const [invite] = await db
            .select()
            .from(invites)
            .where(eq(invites.token, inviteToken));

          if (invite && !invite.acceptedAt && new Date() < invite.expiresAt) {
            accessTier = invite.tier as "johatsu" | "alpha" | "beta";
            referredById = invite.invitedBy;
            inviteId = invite.id; // Store for marking accepted after onboarding

            console.log("[Auth Callback] Invite validated (will be marked accepted after onboarding)", { token: inviteToken, invitedBy: referredById, accessTier });
          } else {
            // Invalid or expired token - redirect to error
            console.log("[Auth Callback] Invalid invite token", { token: inviteToken });
            return NextResponse.redirect(`${origin}/join?error=invalid_invite`, { status: 302 });
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
              referralCodeId = refCode.id; // Store for tracking after onboarding

              console.log("[Auth Callback] Referral code validated (will be tracked after onboarding)", { referralCode, referredBy: referredById });
            } else {
              console.log("[Auth Callback] Referral code max uses reached", { referralCode });
              return NextResponse.redirect(`${origin}/join?error=code_exhausted`, { status: 302 });
            }
          } else {
            console.log("[Auth Callback] Invalid referral code", { referralCode });
            return NextResponse.redirect(`${origin}/join?error=invalid_code`, { status: 302 });
          }
        }
        // No valid access method for non-admin
        else if (!isAdmin) {
          // Block public signups - redirect to join page
          console.log("[Auth Callback] No access token - blocking signup");
          return NextResponse.redirect(`${origin}/join?error=access_required`, { status: 302 });
        }

        // Store pending user data in cookie (user will be created after onboarding)
        const pendingUserData = {
          accessTier,
          referredBy: referredById,
          inviteId,
          referralCodeId,
          isAdmin,
        };

        // Set the pending_user cookie on the response
        supabaseResponse.cookies.set("pending_user", JSON.stringify(pendingUserData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60, // 1 hour
        });

        console.log("[Auth Callback] Stored pending user data in cookie (user will be created after onboarding)", {
          userId,
          userEmail,
          isAdmin,
          accessTier,
          referredBy: referredById,
          hasInviteId: !!inviteId,
          hasReferralCodeId: !!referralCodeId,
        });
      } else {
        // Update avatar and last login for existing users
        await db
          .update(users)
          .set({
            avatarUrl,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
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
              const redirectUrl = `${origin}/onboarding?redirect=/groups/${invitation.groupId}/pending`;
              return createRedirectWithCookies(redirectUrl, supabaseResponse);
            }

            // EXISTING USERS with invitation → directly to pending page
            console.log("[Auth Callback] Existing user with invitation → redirecting to pending page", {
              groupId: invitation.groupId,
            });
            const redirectUrl = `${origin}/groups/${invitation.groupId}/pending`;
            return createRedirectWithCookies(redirectUrl, supabaseResponse);
          } else {
            // Token expired
            return NextResponse.redirect(
              `${origin}/invite/expired?email=${encodeURIComponent(userEmail)}`,
              { status: 302 }
            );
          }
        }
      }

    // Step 5: Regular redirect for solo users
    // NEW USERS without invitation → onboarding
    if (isNewUser) {
      console.log("[Auth Callback] New user without invitation → redirecting to onboarding");
      const redirectUrl = `${origin}/onboarding`;
      return createRedirectWithCookies(redirectUrl, supabaseResponse);
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

    // Use helper to preserve session cookies on redirect
    const finalResponse = createRedirectWithCookies(redirectUrl, supabaseResponse);
    finalResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    console.log("[Auth Callback] Sending redirect response", {
      status: 302,
      location: redirectUrl
    });

    return finalResponse;
  }

  // Error fallback
  console.log("[Auth Callback] Error fallback - no valid code or session");
  return NextResponse.redirect(`${origin}/auth/error`);

  } catch (error: unknown) {
    // Catch-all for any unhandled errors to prevent 500s
    const err = error as { message?: string; stack?: string };
    console.error("[Auth Callback] Unhandled error:", {
      message: err?.message,
      stack: err?.stack,
    });

    const errorMsg = err?.message || "An unexpected error occurred";

    // Check for PKCE-related errors
    if (errorMsg.includes("code verifier") || errorMsg.includes("PKCE") || errorMsg.includes("pkce")) {
      return NextResponse.redirect(
        `${origin}/auth/error?error=pkce_error&error_description=${encodeURIComponent(
          "Authentication session expired or was started on a different device. Please try signing in again from the beginning."
        )}`,
        { status: 302 }
      );
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=callback_error&error_description=${encodeURIComponent(errorMsg)}`,
      { status: 302 }
    );
  }
}
