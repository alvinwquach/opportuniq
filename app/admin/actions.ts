"use server";

import { db } from "@/app/db/client";
import { users, waitlist, invites, referrals } from "@/app/db/schema";
import { sql, desc } from "drizzle-orm";

/**
 * Server action to fetch all admin dashboard statistics
 */
export async function getAdminDashboardStats() {
  // Date calculations
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // ISO strings for raw SQL queries
  const oneWeekAgoISO = oneWeekAgo.toISOString();
  const twoWeeksAgoISO = twoWeeksAgo.toISOString();

  try {
    const [
      userStatsData,
      [waitlistStats],
      [inviteStats],
      [referralStats],
      userGrowthData,
      recentUsers,
    ] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE role = 'admin') as admins,
          COUNT(*) FILTER (WHERE role = 'moderator') as moderators,
          COUNT(*) FILTER (WHERE role = 'user') as active_users,
          COUNT(*) FILTER (WHERE role = 'banned') as banned,
          COUNT(*) FILTER (WHERE access_tier = 'johatsu') as johatsu,
          COUNT(*) FILTER (WHERE access_tier = 'alpha') as alpha,
          COUNT(*) FILTER (WHERE access_tier = 'beta') as beta,
          COUNT(*) FILTER (WHERE created_at >= ${oneWeekAgoISO}::timestamptz) as this_week,
          COUNT(*) FILTER (WHERE created_at >= ${twoWeeksAgoISO}::timestamptz AND created_at < ${oneWeekAgoISO}::timestamptz) as last_week
        FROM users
      `),
      db.select({ total: sql<number>`count(*)` }).from(waitlist),
      db.select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${invites.acceptedAt} IS NULL AND ${invites.expiresAt} > NOW())`,
        accepted: sql<number>`count(*) filter (where ${invites.acceptedAt} IS NOT NULL)`,
        expired: sql<number>`count(*) filter (where ${invites.expiresAt} <= NOW() AND ${invites.acceptedAt} IS NULL)`,
      }).from(invites),
      db.select({
        total: sql<number>`count(*)`,
        valid: sql<number>`count(*) filter (where ${referrals.status} = 'converted')`,
        invalid: sql<number>`count(*) filter (where ${referrals.status} IN ('expired', 'pending'))`,
      }).from(referrals),
      db.execute(sql`
        SELECT
          DATE(${users.createdAt}) as date,
          COUNT(*) as count
        FROM ${users}
        WHERE ${users.createdAt} >= ${thirtyDaysAgo.toISOString()}::timestamptz
        GROUP BY DATE(${users.createdAt})
        ORDER BY date ASC
      `),
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

    // Handle raw SQL result (array of rows from db.execute)
    const rawData = userStatsData as any;
    const row = rawData?.rows?.[0] || rawData?.[0] || {};
    // Normalize snake_case from SQL to camelCase
    const combinedUserStats = {
      total: Number(row.total || 0),
      admins: Number(row.admins || 0),
      moderators: Number(row.moderators || 0),
      activeUsers: Number(row.active_users || row.activeUsers || 0),
      banned: Number(row.banned || 0),
      johatsu: Number(row.johatsu || 0),
      alpha: Number(row.alpha || 0),
      beta: Number(row.beta || 0),
      thisWeek: Number(row.this_week || row.thisWeek || 0),
      lastWeek: Number(row.last_week || row.lastWeek || 0),
    };

    // Calculate growth percentage
    const thisWeekCount = combinedUserStats.thisWeek;
    const lastWeekCount = combinedUserStats.lastWeek;
    const growthPercent =
      lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;

    return {
      success: true,
      data: {
        combinedUserStats,
        waitlistStats: waitlistStats || { total: 0 },
        inviteStats: inviteStats || { total: 0, pending: 0, accepted: 0, expired: 0 },
        referralStats: referralStats || { total: 0, valid: 0, invalid: 0 },
        userGrowthData: userGrowthData || { rows: [] },
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

