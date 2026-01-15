import { db } from "@/app/db/client";
import { users, waitlist, invites, referrals } from "@/app/db/schema";
import { desc, count } from "drizzle-orm";

async function fetchAdminStats() {
  console.log("[Admin Stats] Starting fetch...");
  const startTime = Date.now();
  try {
    // Run queries sequentially to identify which one hangs
    console.log("[Admin Stats] Fetching users...");
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      accessTier: users.accessTier,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(100);
    console.log("[Admin Stats] Users fetched:", allUsers.length);

    console.log("[Admin Stats] Fetching waitlist...");
    const waitlistCount = await db.select({ total: count() }).from(waitlist);
    console.log("[Admin Stats] Waitlist fetched");

    console.log("[Admin Stats] Fetching invites...");
    const allInvites = await db.select({
      id: invites.id,
      acceptedAt: invites.acceptedAt,
      expiresAt: invites.expiresAt,
    }).from(invites);
    console.log("[Admin Stats] Invites fetched:", allInvites.length);

    console.log("[Admin Stats] Fetching referrals...");
    const allReferrals = await db.select({
      id: referrals.id,
      status: referrals.status,
    }).from(referrals);
    console.log("[Admin Stats] Referrals fetched:", allReferrals.length);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const combinedUserStats = {
      total: allUsers.length,
      admins: allUsers.filter(user => user.role === 'admin').length,
      moderators: allUsers.filter(user => user.role === 'moderator').length,
      activeUsers: allUsers.filter(user => user.role === 'user').length,
      banned: allUsers.filter(user => user.role === 'banned').length,
      johatsu: allUsers.filter(user => user.accessTier === 'johatsu').length,
      alpha: allUsers.filter(user => user.accessTier === 'alpha').length,
      beta: allUsers.filter(user => user.accessTier === 'beta').length,
      thisWeek: allUsers.filter(user => user.createdAt >= oneWeekAgo).length,
      lastWeek: allUsers.filter(user => user.createdAt >= twoWeeksAgo && user.createdAt < oneWeekAgo).length,
    };

    const recentUsers = allUsers.filter(user => user.createdAt >= thirtyDaysAgo);
    const growthByDate = new Map<string, number>();
    recentUsers.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      growthByDate.set(date, (growthByDate.get(date) || 0) + 1);
    });

    const userGrowthData = {
      rows: Array.from(growthByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };

    const growthPercent = combinedUserStats.lastWeek > 0
      ? ((combinedUserStats.thisWeek - combinedUserStats.lastWeek) / combinedUserStats.lastWeek) * 100
      : 0;

    // Calculate invite stats
    const inviteStats = {
      total: allInvites.length,
      accepted: allInvites.filter(i => i.acceptedAt !== null).length,
      pending: allInvites.filter(i => i.acceptedAt === null && i.expiresAt > now).length,
      expired: allInvites.filter(i => i.acceptedAt === null && i.expiresAt <= now).length,
    };

    // Calculate referral stats
    const referralStats = {
      total: allReferrals.length,
      valid: allReferrals.filter(r => r.status === 'converted').length,
      invalid: allReferrals.filter(r => r.status === 'expired' || r.status === 'pending').length,
    };

    console.log("[Admin Stats] Completed in", Date.now() - startTime, "ms");
    return {
      success: true,
      data: {
        combinedUserStats,
        waitlistStats: { total: waitlistCount[0]?.total || 0 },
        inviteStats,
        referralStats,
        userGrowthData,
        recentUsers: allUsers.slice(0, 10),
        growthPercent,
      },
    };
  } catch (error) {
    console.error("[Admin Stats] Error after", Date.now() - startTime, "ms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Temporarily bypass cache for debugging
export const getAdminDashboardStats = fetchAdminStats;
