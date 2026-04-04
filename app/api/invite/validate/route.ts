import { NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { invites, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/invite/validate
 * Validates an invite token (johatsu, alpha, or beta tier)
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Invite token is required" },
        { status: 400 }
      );
    }

    const [invite] = await db
      .select({
        id: invites.id,
        email: invites.email,
        acceptedAt: invites.acceptedAt,
        expiresAt: invites.expiresAt,
        invitedBy: invites.invitedBy,
        tier: invites.tier,
      })
      .from(invites)
      .where(eq(invites.token, token));

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite link" },
        { status: 400 }
      );
    }

    // Check if already used
    if (invite.acceptedAt) {
      return NextResponse.json(
        { valid: false, error: "This invite has already been used" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "This invite has expired" },
        { status: 400 }
      );
    }

    // Get inviter name for display
    const [inviter] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, invite.invitedBy));

    return NextResponse.json({
      valid: true,
      email: invite.email,
      tier: invite.tier,
      invitedBy: inviter?.name || "OpportunIQ Team",
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
