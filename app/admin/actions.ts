"use server";

import { db } from "@/app/db/client";
import { users, waitlist, invites, referrals } from "@/app/db/schema";
import { sql, desc, count, gte } from "drizzle-orm";

/**
 * Server action to fetch all admin dashboard statistics
 * Uses Drizzle ORM for type-safe, optimized queries
 */
export async function getAdminDashboardStats() {
  // Date calculations
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  try {
    // Run all queries in parallel for better performance
    const [
      userStatsResult,
      waitlistStats,
      inviteStats,
      referralStats,
      userGrowthData,
      recentUsers,
    ] = await Promise.all([
      // User stats - single query with conditional aggregation (more efficient than multiple queries)
      db
        .select({
          total: count(),
          admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
          moderators: sql<number>`count(*) filter (where ${users.role} = 'moderator')`,
          activeUsers: sql<number>`count(*) filter (where ${users.role} = 'user')`,
          banned: sql<number>`count(*) filter (where ${users.role} = 'banned')`,
          johatsu: sql<number>`count(*) filter (where ${users.accessTier} = 'johatsu')`,
          alpha: sql<number>`count(*) filter (where ${users.accessTier} = 'alpha')`,
          beta: sql<number>`count(*) filter (where ${users.accessTier} = 'beta')`,
          thisWeek: sql<number>`count(*) filter (where ${users.createdAt} >= ${oneWeekAgo.toISOString()})`,
          lastWeek: sql<number>`count(*) filter (where ${users.createdAt} >= ${twoWeeksAgo.toISOString()} AND ${users.createdAt} < ${oneWeekAgo.toISOString()})`,
        })
        .from(users),

      // Waitlist stats
      db.select({ total: count() }).from(waitlist),

      // Invite stats - using Drizzle's query builder with SQL for complex filters
      db
        .select({
          total: count(),
          pending: sql<number>`count(*) filter (where ${invites.acceptedAt} IS NULL AND ${invites.expiresAt} > NOW())`,
          accepted: sql<number>`count(*) filter (where ${invites.acceptedAt} IS NOT NULL)`,
          expired: sql<number>`count(*) filter (where ${invites.expiresAt} <= NOW() AND ${invites.acceptedAt} IS NULL)`,
        })
        .from(invites),

      // Referral stats - using Drizzle's query builder
      db
        .select({
          total: count(),
          valid: sql<number>`count(*) filter (where ${referrals.status} = 'converted')`,
          invalid: sql<number>`count(*) filter (where ${referrals.status} IN ('expired', 'pending'))`,
        })
        .from(referrals),

      // User growth data - using Drizzle with SQL for date truncation
      db
        .select({
          date: sql<string>`DATE(${users.createdAt})`.as("date"),
          count: count(),
        })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt}) ASC`),

      // Recent users
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          accessTier: users.accessTier,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(10),
    ]);

    // Extract user stats from result
    const userStats = userStatsResult[0] || {};
    const combinedUserStats = {
      total: Number(userStats.total || 0),
      admins: Number(userStats.admins || 0),
      moderators: Number(userStats.moderators || 0),
      activeUsers: Number(userStats.activeUsers || 0),
      banned: Number(userStats.banned || 0),
      johatsu: Number(userStats.johatsu || 0),
      alpha: Number(userStats.alpha || 0),
      beta: Number(userStats.beta || 0),
      thisWeek: Number(userStats.thisWeek || 0),
      lastWeek: Number(userStats.lastWeek || 0),
    };

    // Calculate growth percentage
    const thisWeekCount = combinedUserStats.thisWeek;
    const lastWeekCount = combinedUserStats.lastWeek;
    const growthPercent =
      lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;

    // Format user growth data to match expected structure
    const formattedGrowthData = {
      rows: userGrowthData.map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),
    };

    return {
      success: true,
      data: {
        combinedUserStats,
        waitlistStats: { total: waitlistStats[0]?.total || 0 },
        inviteStats: inviteStats[0] || { total: 0, pending: 0, accepted: 0, expired: 0 },
        referralStats: referralStats[0] || { total: 0, valid: 0, invalid: 0 },
        userGrowthData: formattedGrowthData,
        recentUsers: recentUsers || [],
        growthPercent,
      },
    };
  } catch (error) {
    console.error("[Admin Dashboard] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

