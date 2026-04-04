import { db } from "@/app/db/client";
import {
  users,
  waitlist,
  invites,
  referrals,
  diyGuides,
  userIncomeStreams,
  userExpenses,
  userBudgets,
  issues,
  decisions,
  decisionOptions,
} from "@/app/db/schema";
import { desc, count, sql, countDistinct } from "drizzle-orm";
import { unstable_cache } from "next/cache";

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseTimeAgo(time: string): number {
  if (time === "just now") return 0;
  const match = time.match(/^(\d+)([mhd])/);
  if (!match) return 999999;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "m") return value;
  if (unit === "h") return value * 60;
  if (unit === "d") return value * 1440;
  return 999999;
}

async function fetchAdminStats() {
  const startTime = Date.now();
  try {
    // Run ALL queries in parallel for maximum speed
    const [
      allUsers,
      [waitlistCount],
      [inviteStats],
      [referralStats],
      [userStats],
      userGrowthRows,
      recentInvites,
      recentReferrals,
    ] = await Promise.all([
      // Recent users for display (limited)
      db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        accessTier: users.accessTier,
        createdAt: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt)).limit(10),

      // Waitlist count
      db.select({ total: count() }).from(waitlist),

      // Invite stats aggregated in SQL
      db.select({
        total: count(),
        accepted: sql<number>`count(*) filter (where ${invites.acceptedAt} is not null)`,
        pending: sql<number>`count(*) filter (where ${invites.acceptedAt} is null and ${invites.expiresAt} > now())`,
        expired: sql<number>`count(*) filter (where ${invites.acceptedAt} is null and ${invites.expiresAt} <= now())`,
      }).from(invites),

      // Referral stats aggregated in SQL
      db.select({
        total: count(),
        valid: sql<number>`count(*) filter (where ${referrals.status} = 'converted')`,
        pending: sql<number>`count(*) filter (where ${referrals.status} = 'pending')`,
        expired: sql<number>`count(*) filter (where ${referrals.status} = 'expired')`,
      }).from(referrals),

      // User stats aggregated in SQL - use NOW() - INTERVAL for date calculations
      db.select({
        total: count(),
        admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
        moderators: sql<number>`count(*) filter (where ${users.role} = 'moderator')`,
        activeUsers: sql<number>`count(*) filter (where ${users.role} = 'user')`,
        banned: sql<number>`count(*) filter (where ${users.role} = 'banned')`,
        johatsu: sql<number>`count(*) filter (where ${users.accessTier} = 'johatsu')`,
        alpha: sql<number>`count(*) filter (where ${users.accessTier} = 'alpha')`,
        beta: sql<number>`count(*) filter (where ${users.accessTier} = 'beta')`,
        thisWeek: sql<number>`count(*) filter (where ${users.createdAt} >= now() - interval '7 days')`,
        lastWeek: sql<number>`count(*) filter (where ${users.createdAt} >= now() - interval '14 days' and ${users.createdAt} < now() - interval '7 days')`,
      }).from(users),

      // User growth by date (last 30 days)
      db.select({
        date: sql<string>`date(${users.createdAt})`,
        count: count(),
      })
        .from(users)
        .where(sql`${users.createdAt} >= now() - interval '30 days'`)
        .groupBy(sql`date(${users.createdAt})`)
        .orderBy(sql`date(${users.createdAt})`),

      // Recent invites for activity feed
      db.select({
        id: invites.id,
        email: invites.email,
        acceptedAt: invites.acceptedAt,
        createdAt: invites.createdAt,
      }).from(invites).orderBy(desc(invites.createdAt)).limit(5),

      // Recent referrals for activity feed
      db.select({
        id: referrals.id,
        status: referrals.status,
        createdAt: referrals.createdAt,
      }).from(referrals).orderBy(desc(referrals.createdAt)).limit(5),
    ]);


    const combinedUserStats = {
      total: Number(userStats.total) || 0,
      admins: Number(userStats.admins) || 0,
      moderators: Number(userStats.moderators) || 0,
      activeUsers: Number(userStats.activeUsers) || 0,
      banned: Number(userStats.banned) || 0,
      johatsu: Number(userStats.johatsu) || 0,
      alpha: Number(userStats.alpha) || 0,
      beta: Number(userStats.beta) || 0,
      thisWeek: Number(userStats.thisWeek) || 0,
      lastWeek: Number(userStats.lastWeek) || 0,
    };

    const userGrowthData = {
      rows: userGrowthRows.map(row => ({
        date: row.date,
        count: row.count,
      })),
    };

    const growthPercent = combinedUserStats.lastWeek > 0
      ? ((combinedUserStats.thisWeek - combinedUserStats.lastWeek) / combinedUserStats.lastWeek) * 100
      : 0;

    // Build activity feed from recent events
    const activities: {
      id: string;
      type: "user_joined" | "invite_sent" | "invite_accepted" | "referral";
      title: string;
      subtitle: string;
      time: string;
    }[] = [];

    // Add recent users to activity
    for (const user of allUsers.slice(0, 3)) {
      const timeAgo = getTimeAgo(new Date(user.createdAt));
      activities.push({
        id: `user-${user.id}`,
        type: "user_joined",
        title: user.name || "New user",
        subtitle: user.email,
        time: timeAgo,
      });
    }

    // Add recent invites to activity
    for (const invite of recentInvites.slice(0, 3)) {
      const timeAgo = getTimeAgo(new Date(invite.createdAt));
      if (invite.acceptedAt) {
        activities.push({
          id: `invite-accepted-${invite.id}`,
          type: "invite_accepted",
          title: "Invite accepted",
          subtitle: invite.email,
          time: timeAgo,
        });
      } else {
        activities.push({
          id: `invite-sent-${invite.id}`,
          type: "invite_sent",
          title: "Invite sent",
          subtitle: invite.email,
          time: timeAgo,
        });
      }
    }

    // Sort activities by recency (already have time strings, sort by original dates)
    activities.sort((a, b) => {
      // Simple sort based on time string patterns
      const aMin = parseTimeAgo(a.time);
      const bMin = parseTimeAgo(b.time);
      return aMin - bMin;
    });

    return {
      success: true,
      data: {
        combinedUserStats,
        waitlistStats: { total: waitlistCount?.total || 0 },
        inviteStats: {
          total: Number(inviteStats.total) || 0,
          accepted: Number(inviteStats.accepted) || 0,
          pending: Number(inviteStats.pending) || 0,
          expired: Number(inviteStats.expired) || 0,
        },
        referralStats: {
          total: Number(referralStats.total) || 0,
          converted: Number(referralStats.valid) || 0,
          pending: Number(referralStats.pending) || 0,
          expired: Number(referralStats.expired) || 0,
        },
        userGrowthData,
        recentUsers: allUsers,
        recentActivities: activities.slice(0, 5),
        growthPercent,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Cache for 30 seconds to improve performance while keeping data fresh
export const getAdminDashboardStats = unstable_cache(
  fetchAdminStats,
  ["admin-dashboard-stats"],
  { revalidate: 30, tags: ["admin-stats"] }
);

// ============================================
// GUIDE ANALYTICS
// ============================================

async function fetchGuideAnalytics() {
  const startTime = Date.now();
  try {
    const [
      [guideCounts],
      bySourceRows,
      byCategoryRows,
    ] = await Promise.all([
      // Main guide counts
      db.select({
        total: count(),
        clicked: sql<number>`count(*) filter (where ${diyGuides.wasClicked} = true)`,
        bookmarked: sql<number>`count(*) filter (where ${diyGuides.wasBookmarked} = true)`,
        helpfulYes: sql<number>`count(*) filter (where ${diyGuides.wasHelpful} = true)`,
        helpfulNo: sql<number>`count(*) filter (where ${diyGuides.wasHelpful} = false)`,
      }).from(diyGuides),

      // By source
      db.select({
        source: diyGuides.source,
        count: count(),
      })
        .from(diyGuides)
        .groupBy(diyGuides.source)
        .orderBy(desc(count())),

      // By category
      db.select({
        category: diyGuides.issueCategory,
        count: count(),
      })
        .from(diyGuides)
        .groupBy(diyGuides.issueCategory)
        .orderBy(desc(count()))
        .limit(10),
    ]);


    return {
      success: true,
      data: {
        total: Number(guideCounts.total) || 0,
        clicked: Number(guideCounts.clicked) || 0,
        bookmarked: Number(guideCounts.bookmarked) || 0,
        helpfulYes: Number(guideCounts.helpfulYes) || 0,
        helpfulNo: Number(guideCounts.helpfulNo) || 0,
        bySource: bySourceRows.map(r => ({
          source: r.source || "other",
          count: r.count,
        })),
        byCategory: byCategoryRows
          .filter(r => r.category)
          .map(r => ({
            category: r.category!,
            count: r.count,
          })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const getGuideAnalytics = unstable_cache(
  fetchGuideAnalytics,
  ["admin-guide-analytics"],
  { revalidate: 60, tags: ["admin-stats"] }
);

// ============================================
// FINANCE ANALYTICS
// ============================================

async function fetchFinanceAnalytics() {
  const startTime = Date.now();
  try {
    const [
      [incomeStats],
      [expenseStats],
      [budgetStats],
      adoptionTrendRows,
    ] = await Promise.all([
      // Income stats
      db.select({
        usersWithIncome: countDistinct(userIncomeStreams.userId),
        totalStreams: count(),
      }).from(userIncomeStreams),

      // Expense stats
      db.select({
        usersWithExpenses: countDistinct(userExpenses.userId),
        totalExpenses: count(),
      }).from(userExpenses),

      // Budget stats
      db.select({
        usersWithBudgets: countDistinct(userBudgets.userId),
        totalBudgets: count(),
      }).from(userBudgets),

      // Adoption trend (last 30 days)
      db.select({
        date: sql<string>`date(${users.createdAt})`,
        income: sql<number>`(
          select count(distinct uis.user_id)
          from user_income_streams uis
          where date(uis.created_at) <= date(${users.createdAt})
        )`,
        expenses: sql<number>`(
          select count(distinct ue.user_id)
          from user_expenses ue
          where date(ue.date) <= date(${users.createdAt})
        )`,
        budgets: sql<number>`(
          select count(distinct ub.user_id)
          from user_budgets ub
          where date(ub.updated_at) <= date(${users.createdAt})
        )`,
      })
        .from(users)
        .where(sql`${users.createdAt} >= now() - interval '30 days'`)
        .groupBy(sql`date(${users.createdAt})`)
        .orderBy(sql`date(${users.createdAt})`)
        .limit(30),
    ]);

    const usersWithIncome = Number(incomeStats?.usersWithIncome) || 0;
    const usersWithExpenses = Number(expenseStats?.usersWithExpenses) || 0;
    const totalStreams = Number(incomeStats?.totalStreams) || 0;
    const totalExpenses = Number(expenseStats?.totalExpenses) || 0;


    return {
      success: true,
      data: {
        usersWithIncome,
        usersWithExpenses,
        usersWithBudgets: Number(budgetStats?.usersWithBudgets) || 0,
        totalIncomeStreams: totalStreams,
        totalExpenses,
        totalBudgets: Number(budgetStats?.totalBudgets) || 0,
        avgIncomeStreamsPerUser: usersWithIncome > 0 ? totalStreams / usersWithIncome : 0,
        avgExpensesPerUser: usersWithExpenses > 0 ? totalExpenses / usersWithExpenses : 0,
        adoptionTrend: adoptionTrendRows.map(r => ({
          date: r.date,
          income: Number(r.income) || 0,
          expenses: Number(r.expenses) || 0,
          budgets: Number(r.budgets) || 0,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const getFinanceAnalytics = unstable_cache(
  fetchFinanceAnalytics,
  ["admin-finance-analytics"],
  { revalidate: 60, tags: ["admin-stats"] }
);

// ============================================
// ISSUE & DECISION ANALYTICS
// ============================================

async function fetchIssueDecisionAnalytics() {
  const startTime = Date.now();
  try {
    const [
      [issueCounts],
      [decisionCounts],
      byStatusRows,
      byCategoryRows,
      byResolutionRows,
      [avgResolution],
    ] = await Promise.all([
      // Issue counts
      db.select({
        total: count(),
        open: sql<number>`count(*) filter (where ${issues.status} = 'open')`,
        completed: sql<number>`count(*) filter (where ${issues.status} = 'completed')`,
        inProgress: sql<number>`count(*) filter (where ${issues.status} = 'in_progress')`,
      }).from(issues),

      // Decision counts
      db.select({
        total: count(),
        approved: sql<number>`count(*) filter (where ${decisions.approvedAt} is not null)`,
      }).from(decisions),

      // By status
      db.select({
        status: issues.status,
        count: count(),
      })
        .from(issues)
        .groupBy(issues.status)
        .orderBy(desc(count())),

      // By category
      db.select({
        category: issues.category,
        count: count(),
      })
        .from(issues)
        .groupBy(issues.category)
        .orderBy(desc(count()))
        .limit(10),

      // By resolution type
      db.select({
        type: issues.resolutionType,
        count: count(),
      })
        .from(issues)
        .where(sql`${issues.resolutionType} is not null`)
        .groupBy(issues.resolutionType)
        .orderBy(desc(count())),

      // Average resolution time (days)
      db.select({
        avgDays: sql<number>`avg(extract(epoch from (${issues.completedAt} - ${issues.createdAt})) / 86400)`,
      })
        .from(issues)
        .where(sql`${issues.completedAt} is not null`),
    ]);


    return {
      success: true,
      data: {
        totalIssues: Number(issueCounts.total) || 0,
        openIssues: Number(issueCounts.open) || 0,
        completedIssues: Number(issueCounts.completed) || 0,
        inProgressIssues: Number(issueCounts.inProgress) || 0,
        totalDecisions: Number(decisionCounts.total) || 0,
        approvedDecisions: Number(decisionCounts.approved) || 0,
        byStatus: byStatusRows.map(r => ({
          status: r.status || "unknown",
          count: r.count,
        })),
        byCategory: byCategoryRows
          .filter(r => r.category)
          .map(r => ({
            category: r.category!,
            count: r.count,
          })),
        byResolutionType: byResolutionRows.map(r => ({
          type: r.type || "unknown",
          count: r.count,
        })),
        avgResolutionDays: Number(avgResolution?.avgDays) || 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const getIssueDecisionAnalytics = unstable_cache(
  fetchIssueDecisionAnalytics,
  ["admin-issue-decision-analytics"],
  { revalidate: 60, tags: ["admin-stats"] }
);
