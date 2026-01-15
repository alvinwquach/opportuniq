"use server";

import { db } from "@/app/db/client";
import {
  users,
  waitlist,
  groups,
  issues,
  decisions,
  decisionOptions,
  invites,
} from "@/app/db/schema";
import { count, sql, gte, eq, isNotNull, isNull } from "drizzle-orm";

export async function getAnalyticsData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Essential queries only - run in parallel
  const [
    userGrowthData,
    waitlistGrowthData,
    [userTotal],
    [waitlistTotal],
    [groupsTotal],
    [issuesTotal],
    [decisionsTotal],
    issueStatusData,
    decisionTypeData,
    tierDistribution,
    countryData,
    [invitesTotal],
    [invitesAccepted],
  ] = await Promise.all([
    // User growth (last 30 days)
    db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`),

    // Waitlist growth (last 30 days)
    db
      .select({
        date: sql<string>`DATE(${waitlist.createdAt})`,
        count: count(),
      })
      .from(waitlist)
      .where(gte(waitlist.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${waitlist.createdAt})`)
      .orderBy(sql`DATE(${waitlist.createdAt})`),

    // Core totals
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(waitlist),
    db.select({ count: count() }).from(groups),
    db.select({ count: count() }).from(issues),
    db.select({ count: count() }).from(decisions),

    // Issue status distribution
    db
      .select({
        status: issues.status,
        count: count(),
      })
      .from(issues)
      .groupBy(issues.status),

    // Decision type distribution
    db
      .select({
        decisionType: decisionOptions.type,
        count: count(),
      })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .groupBy(decisionOptions.type),

    // User tier distribution
    db
      .select({
        tier: users.accessTier,
        count: count(),
      })
      .from(users)
      .groupBy(users.accessTier),

    // Country distribution (top 5)
    db
      .select({
        country: users.country,
        count: count(),
      })
      .from(users)
      .where(isNotNull(users.country))
      .groupBy(users.country)
      .orderBy(sql`count(*) DESC`)
      .limit(5),

    // Invites
    db.select({ count: count() }).from(invites),
    db.select({ count: count() }).from(invites).where(isNotNull(invites.acceptedAt)),
  ]);

  // Calculate invite acceptance rate
  const inviteAcceptanceRate =
    invitesTotal.count > 0
      ? Math.round((invitesAccepted.count / invitesTotal.count) * 100)
      : 0;

  return {
    // Growth data
    userGrowthData,
    waitlistGrowthData,
    countryData,

    // Core totals
    userTotal,
    waitlistTotal,
    groupsTotal,
    issuesTotal,
    decisionsTotal,

    // Distributions
    issueStatusData,
    decisionTypeData,
    tierDistribution,

    // Invites
    invitesTotal,
    invitesAccepted,
    invitesPending: { count: invitesTotal.count - invitesAccepted.count },
    inviteAcceptanceRate,
  };
}
