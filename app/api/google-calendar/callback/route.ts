/**
 * Google Calendar OAuth Callback
 *
 * Handles the OAuth callback from Google, exchanges the code for tokens,
 * and stores them in the database.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { googleCalendarTokens } from "@/app/db/schema";
import { exchangeCodeForTokens, getGoogleEmail } from "@/lib/google-calendar";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Default redirect
  const defaultRedirect = "/dashboard/settings/integrations";

  // Handle user denying access
  if (error) {
    const redirectUrl = new URL(defaultRedirect, req.url);
    redirectUrl.searchParams.set("calendar_error", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code provided" },
      { status: 400 }
    );
  }

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Parse state to get redirect URL
    let redirectTo = defaultRedirect;
    if (state) {
      try {
        const stateData = JSON.parse(
          Buffer.from(state, "base64url").toString()
        );
        redirectTo = stateData.redirectTo || defaultRedirect;

        // Verify the state belongs to this user
        if (stateData.userId !== user.id) {
          return NextResponse.redirect(
            new URL(
              `${defaultRedirect}?calendar_error=invalid_state`,
              req.url
            )
          );
        }
      } catch {
      }
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL(`${defaultRedirect}?calendar_error=missing_tokens`, req.url)
      );
    }

    // Get the Google email associated with this token
    const email = await getGoogleEmail(tokens.access_token);

    // Calculate expiry time
    const expiresAt = new Date(
      Date.now() + (tokens.expiry_date || 3600 * 1000)
    );

    // Store tokens in database (upsert)
    await db
      .insert(googleCalendarTokens)
      .values({
        userId: user.id,
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scopes:
          tokens.scope ||
          "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
        isActive: true,
        connectedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: googleCalendarTokens.userId,
        set: {
          email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt,
          scopes:
            tokens.scope ||
            "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
          isActive: true,
          lastRefreshedAt: new Date(),
        },
      });


    // Redirect back with success
    const redirectUrl = new URL(redirectTo, req.url);
    redirectUrl.searchParams.set("calendar_connected", "true");
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.redirect(
      new URL(`${defaultRedirect}?calendar_error=connection_failed`, req.url)
    );
  }
}
