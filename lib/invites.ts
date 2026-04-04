"use server";

import { db } from "@/app/db/client";
import { users, invites } from "@/app/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { generateInviteToken, generateReferralCode } from "@/lib/referral";
import { sendBetaInviteEmail, sendAlphaInviteEmail } from "@/lib/resend";

export type InviteTier = "johatsu" | "alpha" | "beta" | "public";

interface UserInviteData {
  user: {
    id: string;
    name: string | null;
    email: string;
    accessTier: InviteTier | null;
    referralCode: string | null;
    referralCount: number;
  };
  sentInvites: {
    id: string;
    email: string;
    tier: InviteTier;
    acceptedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
  }[];
  stats: {
    totalSent: number;
    accepted: number;
    pending: number;
    expired: number;
  };
  canInvite: boolean;
  inviteTier: InviteTier;
}

/**
 * Get the invite tier a user can grant based on their access tier
 */
function getInvitableTier(accessTier: InviteTier | null): InviteTier {
  switch (accessTier) {
    case "johatsu":
      return "alpha";
    case "alpha":
      return "beta";
    case "beta":
      return "beta";
    default:
      return "public";
  }
}

/**
 * Check if user can send invites based on their tier
 */
function canUserInvite(accessTier: InviteTier | null): boolean {
  return accessTier === "johatsu" || accessTier === "alpha" || accessTier === "beta";
}

/**
 * Get user's invite data including sent invites and stats
 */
export async function getUserInviteData(userId: string): Promise<UserInviteData | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      accessTier: users.accessTier,
      referralCode: users.referralCode,
      referralCount: users.referralCount,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  let referralCode = user.referralCode;
  if (!referralCode) {
    referralCode = generateReferralCode();
    await db
      .update(users)
      .set({ referralCode })
      .where(eq(users.id, userId));
  }

  const accessTier = user.accessTier as InviteTier | null;

  const sentInvites = await db
    .select({
      id: invites.id,
      email: invites.email,
      tier: invites.tier,
      acceptedAt: invites.acceptedAt,
      expiresAt: invites.expiresAt,
      createdAt: invites.createdAt,
    })
    .from(invites)
    .where(eq(invites.invitedBy, userId))
    .orderBy(desc(invites.createdAt));

  const now = new Date();
  const stats = {
    totalSent: sentInvites.length,
    accepted: sentInvites.filter((i) => i.acceptedAt !== null).length,
    pending: sentInvites.filter((i) => i.acceptedAt === null && i.expiresAt > now).length,
    expired: sentInvites.filter((i) => i.acceptedAt === null && i.expiresAt <= now).length,
  };

  return {
    user: {
      ...user,
      referralCode,
      accessTier,
    },
    sentInvites: sentInvites.map((i) => ({
      ...i,
      tier: i.tier as InviteTier,
    })),
    stats,
    canInvite: canUserInvite(accessTier),
    inviteTier: getInvitableTier(accessTier),
  };
}

/**
 * Send an invite to a new user
 */
export async function sendUserInvite(
  userId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [inviter] = await db
      .select({
        id: users.id,
        name: users.name,
        accessTier: users.accessTier,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!inviter) {
      return { success: false, error: "User not found" };
    }

    const accessTier = inviter.accessTier as InviteTier | null;

    if (!canUserInvite(accessTier)) {
      return { success: false, error: "You don't have permission to send invites" };
    }

    const [existingInvite] = await db
      .select()
      .from(invites)
      .where(eq(invites.email, email.toLowerCase()))
      .limit(1);

    if (existingInvite) {
      return { success: false, error: "This email has already been invited" };
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return { success: false, error: "This person is already a member" };
    }

    const token = generateInviteToken();
    const tier = getInvitableTier(accessTier);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(invites).values({
      email: email.toLowerCase(),
      token,
      tier,
      invitedBy: userId,
      expiresAt,
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/join?token=${token}`;

    if (tier === "alpha") {
      await sendAlphaInviteEmail({
        email: email.toLowerCase(),
        inviteUrl,
        expiresIn: "7 days",
      });
    } else {
      await sendBetaInviteEmail({
        email: email.toLowerCase(),
        inviteUrl,
        referrerName: inviter.name || "An OpportunIQ member",
        expiresIn: "7 days",
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send invite" };
  }
}

/**
 * Resend an invite
 */
export async function resendInvite(
  userId: string,
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [invite] = await db
      .select()
      .from(invites)
      .where(and(eq(invites.id, inviteId), eq(invites.invitedBy, userId)))
      .limit(1);

    if (!invite) {
      return { success: false, error: "Invite not found" };
    }

    if (invite.acceptedAt) {
      return { success: false, error: "This invite has already been accepted" };
    }

    const [inviter] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db
      .update(invites)
      .set({ expiresAt })
      .where(eq(invites.id, inviteId));

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/join?token=${invite.token}`;

    await sendBetaInviteEmail({
      email: invite.email,
      inviteUrl,
      referrerName: inviter?.name || "An OpportunIQ member",
      expiresIn: "7 days",
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to resend invite" };
  }
}
