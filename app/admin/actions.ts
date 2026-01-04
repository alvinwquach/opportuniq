"use server";

import { db, checkDatabaseConnection } from "@/app/db/client";
import { users, waitlist, invites, referrals } from "@/app/db/schema";
import { sql, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action to fetch all admin dashboard statistics
 * Runs all queries in parallel with a timeout to prevent hanging
 */
export async function getAdminDashboardStats() {
  // Quick connection check with very short timeout
  // If connection is slow, we'll use extremely aggressive timeouts
  let connectionHealthy = false;
  try {
    const healthCheckPromise = checkDatabaseConnection();
    const healthCheckTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Health check timeout")), 800) // 800ms timeout
    );
    const healthResult = await Promise.race([healthCheckPromise, healthCheckTimeout]);
    connectionHealthy = healthResult.success;
  } catch {
    // Connection check timed out or failed - use very aggressive timeouts
    console.warn("[Admin Dashboard] Connection health check failed or timed out - using very aggressive timeouts (1-1.5s)");
  }
  
  // Use extremely short timeouts if connection is unhealthy
  // For empty tables, queries should complete in <100ms, so 1-1.5s is plenty
  // If connection is slow, use very aggressive timeouts (1-1.5s max)
  const timeoutMultiplier = connectionHealthy ? 1 : 0.4; // Cut timeouts to 40% if connection is slow
  // Date calculations
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // ISO strings for raw SQL queries
  const oneWeekAgoISO = oneWeekAgo.toISOString();
  const twoWeeksAgoISO = twoWeeksAgo.toISOString();

  // Run queries individually with timeouts to get partial data if some fail
  // This is more resilient than Promise.all which fails completely if one query fails
  // Supabase has a default statement timeout (~2-5 seconds), so we set our timeouts lower
  const queryWithTimeout = async <T>(
    queryPromise: Promise<T>,
    timeoutMs: number,
    queryName: string
  ): Promise<{ success: true; data: T } | { success: false; error: string }> => {
    const startTime = Date.now();
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout: ${queryName}`)), timeoutMs)
      );
      const data = await Promise.race([queryPromise, timeoutPromise]);
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        console.warn(`[Admin Dashboard] ${queryName} took ${duration}ms (slow but succeeded)`);
      }
      return { success: true, data };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Handle PostgreSQL statement timeout (code 57014)
      const isPostgresTimeout = error?.code === "57014" || error?.cause?.code === "57014";
      const isConnectionError = 
        error?.message?.includes("connection") ||
        error?.message?.includes("timeout") ||
        error?.code === "ECONNREFUSED" ||
        error?.code === "ETIMEDOUT";
      
      let errorMsg: string;
      if (isPostgresTimeout) {
        errorMsg = `Query exceeded Supabase statement timeout (${queryName}) after ${duration}ms`;
      } else if (isConnectionError) {
        // Extract query info if available for debugging
        const queryInfo = error?.query ? `Failed query: ${String(error.query).substring(0, 100)}...` : `Database connection error (${queryName})`;
        errorMsg = `${queryInfo}: ${error.message}. Check DATABASE_URL configuration.`;
      } else {
        errorMsg = error instanceof Error ? error.message : "Unknown error";
      }
      
      console.warn(`[Admin Dashboard] ${queryName} failed after ${duration}ms:`, errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  try {
    // Run queries in parallel but handle each one individually
    // This way if one fails, others can still succeed
    const [
      userStatsResult,
      waitlistResult,
      invitesResult,
      referralsResult,
      growthResult,
      recentUsersResult,
    ] = await Promise.all([
      queryWithTimeout(
        // Optimized: Use simpler COUNT queries that can leverage indexes better
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
        Math.round(4000 * timeoutMultiplier), // Adaptive timeout
        "userStats"
      ),
      queryWithTimeout(
        db.select({ total: sql<number>`count(*)` }).from(waitlist),
        Math.round(2000 * timeoutMultiplier), // Very short for simple COUNT
        "waitlist"
      ),
      queryWithTimeout(
        db.select({
          total: sql<number>`count(*)`,
          pending: sql<number>`count(*) filter (where ${invites.acceptedAt} IS NULL AND ${invites.expiresAt} > NOW())`,
          accepted: sql<number>`count(*) filter (where ${invites.acceptedAt} IS NOT NULL)`,
          expired: sql<number>`count(*) filter (where ${invites.expiresAt} <= NOW() AND ${invites.acceptedAt} IS NULL)`,
        }).from(invites),
        Math.round(2000 * timeoutMultiplier),
        "invites"
      ),
      queryWithTimeout(
        db.select({
          total: sql<number>`count(*)`,
          valid: sql<number>`count(*) filter (where ${referrals.status} = 'converted')`,
          invalid: sql<number>`count(*) filter (where ${referrals.status} IN ('expired', 'pending'))`,
        }).from(referrals),
        Math.round(2000 * timeoutMultiplier),
        "referrals"
      ),
      queryWithTimeout(
        db.execute(sql`
          SELECT 
            DATE(${users.createdAt}) as date,
            COUNT(*) as count
          FROM ${users}
          WHERE ${users.createdAt} >= ${thirtyDaysAgo.toISOString()}::timestamptz
          GROUP BY DATE(${users.createdAt})
          ORDER BY date ASC
        `),
        Math.round(3000 * timeoutMultiplier),
        "userGrowth"
      ),
      queryWithTimeout(
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
        Math.round(2000 * timeoutMultiplier),
        "recentUsers"
      ),
    ]);

    // Extract data or use defaults with proper types
    type UserStats = {
      total: number;
      admins: number;
      moderators: number;
      activeUsers: number;
      banned: number;
      johatsu: number;
      alpha: number;
      beta: number;
      thisWeek: number;
      lastWeek: number;
    };
    const defaultUserStats: UserStats = {
      total: 0,
      admins: 0,
      moderators: 0,
      activeUsers: 0,
      banned: 0,
      johatsu: 0,
      alpha: 0,
      beta: 0,
      thisWeek: 0,
      lastWeek: 0,
    };
    // Handle raw SQL result (array of rows from db.execute)
    let combinedUserStats: UserStats;
    if (userStatsResult.success) {
      const rawData = userStatsResult.data as any;
      // db.execute returns { rows: [...] } or just array
      const row = rawData?.rows?.[0] || rawData?.[0] || defaultUserStats;
      // Normalize snake_case from SQL to camelCase
      combinedUserStats = {
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
    } else {
      combinedUserStats = defaultUserStats;
    }
    const [waitlistStats] = waitlistResult.success ? waitlistResult.data : [{ total: 0 }];
    const [inviteStats] = invitesResult.success ? invitesResult.data : [{ total: 0, pending: 0, accepted: 0, expired: 0 }];
    const [referralStats] = referralsResult.success ? referralsResult.data : [{ total: 0, valid: 0, invalid: 0 }];
    const userGrowthData = growthResult.success ? growthResult.data : { rows: [] };
    const recentUsers = recentUsersResult.success ? recentUsersResult.data : [];

    // Calculate growth percentage (with fallback if data missing)
    const thisWeekCount = Number(combinedUserStats?.thisWeek || 0);
    const lastWeekCount = Number(combinedUserStats?.lastWeek || 0);
    const growthPercent =
      lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;

    // Check if we got any data at all
    const hasAnyData = userStatsResult.success || waitlistResult.success || invitesResult.success;

    return {
      success: hasAnyData, // Success if at least one query worked
      data: {
        combinedUserStats: combinedUserStats || defaultUserStats,
        waitlistStats: waitlistStats || { total: 0 },
        inviteStats: inviteStats || { total: 0, pending: 0, accepted: 0, expired: 0 },
        referralStats: referralStats || { total: 0, valid: 0, invalid: 0 },
        userGrowthData: userGrowthData || { rows: [] },
        recentUsers: recentUsers || [],
        growthPercent,
      },
      partial: !hasAnyData, // Flag if we're showing partial data
      errors: {
        userStats: !userStatsResult.success ? userStatsResult.error : null,
        waitlist: !waitlistResult.success ? waitlistResult.error : null,
        invites: !invitesResult.success ? invitesResult.error : null,
        referrals: !referralsResult.success ? referralsResult.error : null,
        userGrowth: !growthResult.success ? growthResult.error : null,
        recentUsers: !recentUsersResult.success ? recentUsersResult.error : null,
      },
    };
  } catch (error) {
    console.error("[Admin Dashboard] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

