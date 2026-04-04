import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { users, invites } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { generateInviteToken } from "@/lib/referral";
import {
  sendJohatsuInviteEmail,
  sendAlphaInviteEmail,
  sendBetaInviteEmail,
} from "@/lib/resend";

/**
 * POST /api/admin/invite
 * Creates or regenerates an invite for a user (admin only)
 */
export async function POST(request: Request) {
  try {
    // Verify admin user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin (users.id matches Supabase auth.users.id)
    const [adminUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, user.id));

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { email, tier = "alpha", sendEmail = false } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate tier (public access is controlled via settings, not invites)
    const validTiers = ["johatsu", "alpha", "beta"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Use johatsu, alpha, or beta." },
        { status: 400 }
      );
    }

    // Check if email already has an account
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existingUser) {
      return NextResponse.json(
        { error: "This email already has an account" },
        { status: 400 }
      );
    }

    // Check if email already has an invite
    const [existingInvite] = await db
      .select()
      .from(invites)
      .where(eq(invites.email, email.toLowerCase()));

    if (existingInvite) {
      if (existingInvite.acceptedAt) {
        return NextResponse.json(
          { error: "This email has already accepted an invite" },
          { status: 400 }
        );
      }

      // Regenerate token and reset expiration to 30 days from now
      const newToken = generateInviteToken();
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      // Use non-www domain to match Supabase OAuth callback configuration
      const inviteLink = `https://opportuniq.app/join?token=${newToken}`;

      // Send email if requested
      let emailSent = false;
      if (sendEmail) {
        const emailResult = await sendInviteEmail(email.toLowerCase(), inviteLink, tier, "30 days");
        emailSent = emailResult.success;
      }

      await db
        .update(invites)
        .set({
          token: newToken,
          tier,
          expiresAt: newExpiresAt,
          invitedBy: adminUser.id,
          emailSent,
        })
        .where(eq(invites.id, existingInvite.id));

      return NextResponse.json({ inviteLink, regenerated: true, emailSent });
    }

    // Generate invite token for new invite
    const token = generateInviteToken();

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Always use production domain for invite links (non-www to match OAuth callback)
    const inviteLink = `https://opportuniq.app/join?token=${token}`;

    // Send email if requested
    let emailSent = false;
    if (sendEmail) {
      const emailResult = await sendInviteEmail(email.toLowerCase(), inviteLink, tier, "30 days");
      emailSent = emailResult.success;
    }

    // Create new invite
    await db.insert(invites).values({
      email: email.toLowerCase(),
      token,
      invitedBy: adminUser.id,
      expiresAt,
      tier,
      emailSent,
    });

    return NextResponse.json({ inviteLink, emailSent });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * Send the appropriate invite email based on tier
 */
async function sendInviteEmail(
  email: string,
  inviteUrl: string,
  tier: string,
  expiresIn: string
) {
  switch (tier) {
    case "johatsu":
      return sendJohatsuInviteEmail({ email, inviteUrl, expiresIn });
    case "alpha":
      return sendAlphaInviteEmail({ email, inviteUrl, expiresIn });
    case "beta":
      return sendBetaInviteEmail({ email, inviteUrl, expiresIn });
    default:
      return sendAlphaInviteEmail({ email, inviteUrl, expiresIn });
  }
}
