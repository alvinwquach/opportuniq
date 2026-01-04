"use server";

import { db } from "@/app/db/client";
import { invites, users } from "@/app/db/schema";
import { desc, eq, sql, count } from "drizzle-orm";

export async function getInvitesData() {
  const [allInvites, [stats]] = await Promise.all([
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
  ]);

  return {
    allInvites,
    pendingCount: stats?.pendingCount ?? 0,
    acceptedCount: stats?.acceptedCount ?? 0,
    expiredCount: stats?.expiredCount ?? 0,
  };
}
