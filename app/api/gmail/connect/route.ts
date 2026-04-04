/**
 * Gmail Connect API
 *
 * Initiates the Gmail OAuth flow by redirecting to Google's consent screen.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGmailAuthUrl } from "@/lib/gmail";

export async function GET(req: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Get optional redirect URL from query params
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirect") || "/dashboard/settings/integrations";

    // Create state with user ID and redirect URL (for callback)
    const state = Buffer.from(
      JSON.stringify({ userId: user.id, redirectTo })
    ).toString("base64url");

    // Generate Gmail OAuth URL and redirect
    const authUrl = getGmailAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initiate Gmail connection" },
      { status: 500 }
    );
  }
}
