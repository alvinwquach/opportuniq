/**
 * Google Calendar Disconnect API
 *
 * Removes the Google Calendar connection for the authenticated user.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { googleCalendarTokens } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the Google Calendar tokens for this user
    await db
      .delete(googleCalendarTokens)
      .where(eq(googleCalendarTokens.userId, user.id));

    console.log(
      "[Google Calendar Disconnect] Google Calendar disconnected for user:",
      user.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Google Calendar Disconnect] Error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Calendar" },
      { status: 500 }
    );
  }
}
