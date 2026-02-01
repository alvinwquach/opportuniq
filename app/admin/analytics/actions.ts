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
import { count, sql, eq, isNotNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";

async function fetchAnalyticsData() {
  // Split into 3 batches to avoid overwhelming the connection pool

  // Batch 1: Core counts and user stats (consolidated into fewer queries)
  const [
    [coreCounts],
    [inviteStats],
    tierDistribution,
  ] = await Promise.all([
    // All core counts in one query using subqueries
    db.select({
      userCount: sql<number>`(select count(*) from ${users})`,
      waitlistCount: sql<number>`(select count(*) from ${waitlist})`,
      groupsCount: sql<number>`(select count(*) from ${groups})`,
      issuesCount: sql<number>`(select count(*) from ${issues})`,
      decisionsCount: sql<number>`(select count(*) from ${decisions})`,
    }).from(sql`(select 1) as dummy`),

    // Invite stats in one query
    db.select({
      total: count(),
      accepted: sql<number>`count(*) filter (where ${invites.acceptedAt} is not null)`,
    }).from(invites),

    // User tier distribution
    db
      .select({
        tier: users.accessTier,
        count: count(),
      })
      .from(users)
      .groupBy(users.accessTier),
  ]);

  // Batch 2: Growth data and distributions
  const [
    userGrowthData,
    waitlistGrowthData,
    issueStatusData,
  ] = await Promise.all([
    // User growth (last 30 days)
    db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(sql`${users.createdAt} >= now() - interval '30 days'`)
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`),

    // Waitlist growth (last 30 days)
    db
      .select({
        date: sql<string>`DATE(${waitlist.createdAt})`,
        count: count(),
      })
      .from(waitlist)
      .where(sql`${waitlist.createdAt} >= now() - interval '30 days'`)
      .groupBy(sql`DATE(${waitlist.createdAt})`)
      .orderBy(sql`DATE(${waitlist.createdAt})`),

    // Issue status distribution
    db
      .select({
        status: issues.status,
        count: count(),
      })
      .from(issues)
      .groupBy(issues.status),
  ]);

  // Batch 3: Less critical data
  const [
    decisionTypeData,
    countryData,
  ] = await Promise.all([
    // Decision type distribution
    db
      .select({
        decisionType: decisionOptions.type,
        count: count(),
      })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .groupBy(decisionOptions.type),

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
  ]);

  // Calculate invite acceptance rate
  const inviteAcceptanceRate =
    Number(inviteStats.total) > 0
      ? Math.round((Number(inviteStats.accepted) / Number(inviteStats.total)) * 100)
      : 0;

  return {
    // Growth data
    userGrowthData,
    waitlistGrowthData,
    countryData,

    // Core totals
    userTotal: { count: Number(coreCounts.userCount) || 0 },
    waitlistTotal: { count: Number(coreCounts.waitlistCount) || 0 },
    groupsTotal: { count: Number(coreCounts.groupsCount) || 0 },
    issuesTotal: { count: Number(coreCounts.issuesCount) || 0 },
    decisionsTotal: { count: Number(coreCounts.decisionsCount) || 0 },

    // Distributions
    issueStatusData,
    decisionTypeData,
    tierDistribution,

    // Invites
    invitesTotal: { count: Number(inviteStats.total) || 0 },
    invitesAccepted: { count: Number(inviteStats.accepted) || 0 },
    invitesPending: { count: (Number(inviteStats.total) || 0) - (Number(inviteStats.accepted) || 0) },
    inviteAcceptanceRate,
  };
}

// Cache for 60 seconds (analytics can be slightly stale)
export const getAnalyticsData = unstable_cache(
  fetchAnalyticsData,
  ["admin-analytics-data"],
  { revalidate: 60, tags: ["admin-analytics"] }
);
