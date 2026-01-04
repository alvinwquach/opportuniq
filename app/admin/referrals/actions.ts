"use server";

import { db } from "@/app/db/client";
import { users, referrals } from "@/app/db/schema";
import { desc, eq, count, sql } from "drizzle-orm";

export async function getReferralsData() {
  const [
    [referralStats],
    topReferrers,
    recentReferrals,
    [tierStats],
    [viralCoef],
  ] = await Promise.all([
    db
      .select({
        total: count(),
        converted: count(
          sql`CASE WHEN ${referrals.status} = 'converted' THEN 1 END`
        ),
        pending: count(
          sql`CASE WHEN ${referrals.status} = 'pending' THEN 1 END`
        ),
      })
      .from(referrals),

    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        referralCode: users.referralCode,
        referralCount: users.referralCount,
        accessTier: users.accessTier,
      })
      .from(users)
      .where(sql`${users.referralCount} > 0`)
      .orderBy(desc(users.referralCount))
      .limit(10),

    db
      .select({
        id: referrals.id,
        refereeEmail: referrals.refereeEmail,
        status: referrals.status,
        createdAt: referrals.createdAt,
        convertedAt: referrals.convertedAt,
        referrerName: users.name,
        referrerEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .orderBy(desc(referrals.createdAt))
      .limit(20),

    db
      .select({
        johatsu: count(sql`CASE WHEN ${users.accessTier} = 'johatsu' THEN 1 END`),
        alpha: count(sql`CASE WHEN ${users.accessTier} = 'alpha' THEN 1 END`),
        beta: count(sql`CASE WHEN ${users.accessTier} = 'beta' THEN 1 END`),
      })
      .from(users),

    db
      .select({
        avgReferrals: sql<number>`AVG(${users.referralCount})`,
      })
      .from(users)
      .where(sql`${users.accessTier} = 'alpha'`),
  ]);

  const conversionRate =
    referralStats.total > 0
      ? Math.round((referralStats.converted / referralStats.total) * 100)
      : 0;

  const viralCoefficient = viralCoef?.avgReferrals
    ? Number(viralCoef.avgReferrals).toFixed(2)
    : "0.00";

  return {
    referralStats,
    topReferrers,
    recentReferrals,
    tierStats,
    conversionRate,
    viralCoefficient,
  };
}
