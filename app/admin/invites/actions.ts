"use server";

import { db } from "@/app/db/client";
import { invites, users } from "@/app/db/schema";
import { desc, eq, sql, count } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function revokeInvite(inviteId: string) {
  // Verify admin user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if user is admin
  const [adminUser] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, user.id));

  if (!adminUser || adminUser.role !== "admin") {
    return { error: "Forbidden - Admin access required" };
  }

  // Delete the invite
  await db.delete(invites).where(eq(invites.id, inviteId));

  revalidatePath("/admin/invites");
  revalidateTag("admin-invites", { expire: 0 });
  return { success: true };
}

export async function markInviteAccepted(inviteId: string) {
  // Verify admin user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if user is admin
  const [adminUser] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, user.id));

  if (!adminUser || adminUser.role !== "admin") {
    return { error: "Forbidden - Admin access required" };
  }

  // Mark the invite as accepted
  await db
    .update(invites)
    .set({ acceptedAt: new Date() })
    .where(eq(invites.id, inviteId));

  revalidatePath("/admin/invites");
  revalidateTag("admin-invites", { expire: 0 });
  return { success: true };
}

async function fetchInvitesData() {
  const [allInvites, [stats], tierBreakdown, dailyInvites] = await Promise.all([
    db
      .select({
        id: invites.id,
        email: invites.email,
        token: invites.token,
        tier: invites.tier,
        acceptedAt: invites.acceptedAt,
        expiresAt: invites.expiresAt,
        createdAt: invites.createdAt,
        inviterName: users.name,
        emailSent: invites.emailSent,
      })
      .from(invites)
      .leftJoin(users, eq(invites.invitedBy, users.id))
      .orderBy(desc(invites.createdAt)),
    db
      .select({
        pendingCount: count(
          sql`CASE WHEN ${invites.acceptedAt} IS NULL AND ${invites.expiresAt} > NOW() THEN 1 END`
        ),
        acceptedCount: count(sql`CASE WHEN ${invites.acceptedAt} IS NOT NULL THEN 1 END`),
        expiredCount: count(
          sql`CASE WHEN ${invites.acceptedAt} IS NULL AND ${invites.expiresAt} <= NOW() THEN 1 END`
        ),
      })
      .from(invites),
    // Tier breakdown
    db
      .select({
        tier: invites.tier,
        total: count(),
        accepted: count(sql`CASE WHEN ${invites.acceptedAt} IS NOT NULL THEN 1 END`),
      })
      .from(invites)
      .groupBy(invites.tier),
    // Daily invites for last 14 days
    db
      .select({
        date: sql<string>`DATE(${invites.createdAt})`,
        sent: count(),
        accepted: count(sql`CASE WHEN ${invites.acceptedAt} IS NOT NULL THEN 1 END`),
      })
      .from(invites)
      .where(sql`${invites.createdAt} >= NOW() - INTERVAL '14 days'`)
      .groupBy(sql`DATE(${invites.createdAt})`)
      .orderBy(sql`DATE(${invites.createdAt})`),
  ]);

  const totalInvites = allInvites.length;
  const acceptanceRate = totalInvites > 0
    ? Math.round(((stats?.acceptedCount ?? 0) / totalInvites) * 100)
    : 0;

  return {
    allInvites,
    pendingCount: stats?.pendingCount ?? 0,
    acceptedCount: stats?.acceptedCount ?? 0,
    expiredCount: stats?.expiredCount ?? 0,
    totalInvites,
    acceptanceRate,
    tierBreakdown,
    dailyInvites,
  };
}

// Cache for 30 seconds
export const getInvitesData = unstable_cache(
  fetchInvitesData,
  ["admin-invites-data"],
  { revalidate: 30, tags: ["admin-invites"] }
);
