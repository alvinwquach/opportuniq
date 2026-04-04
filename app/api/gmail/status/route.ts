/**
 * Gmail Status API
 *
 * Returns the current Gmail connection status for the authenticated user.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { gmailTokens } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Gmail tokens
    const [tokenRecord] = await db
      .select({
        gmailAddress: gmailTokens.gmailAddress,
        isActive: gmailTokens.isActive,
        connectedAt: gmailTokens.connectedAt,
        expiresAt: gmailTokens.expiresAt,
      })
      .from(gmailTokens)
      .where(eq(gmailTokens.userId, user.id))
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json({
        connected: false,
        gmailAddress: null,
      });
    }

    return NextResponse.json({
      connected: tokenRecord.isActive,
      gmailAddress: tokenRecord.gmailAddress,
      connectedAt: tokenRecord.connectedAt,
      needsRefresh: new Date() >= tokenRecord.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get Gmail status" },
      { status: 500 }
    );
  }
}
