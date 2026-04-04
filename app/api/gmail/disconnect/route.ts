/**
 * Gmail Disconnect API
 *
 * Removes the Gmail connection for the authenticated user.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { gmailTokens } from "@/app/db/schema";
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

    // Delete the Gmail tokens for this user
    await db.delete(gmailTokens).where(eq(gmailTokens.userId, user.id));


    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to disconnect Gmail" },
      { status: 500 }
    );
  }
}
