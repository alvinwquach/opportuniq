import { Suspense } from "react";
import { UserGrowthChart } from "./components/UserGrowthChart";
import { RoleDistributionChart } from "./components/RoleDistributionChart";
import { TierDistributionChart } from "./components/TierDistributionChart";
import { InviteFunnelChart } from "./components/InviteFunnelChart";
import { ReferralStatsChart } from "./components/ReferralStatsChart";
import { QuickStatsCard } from "./components/QuickStatsCard";
import { ActivityFeedCard } from "./components/ActivityFeedCard";
import { QuickActionsCard } from "./components/QuickActionsCard";
import { GuideAnalyticsCard } from "./components/GuideAnalyticsCard";
import { FinanceAnalyticsCard } from "./components/FinanceAnalyticsCard";
import { IssueDecisionAnalyticsCard } from "./components/IssueDecisionAnalyticsCard";
import {
  getAdminDashboardStats,
  getGuideAnalytics,
  getFinanceAnalytics,
  getIssueDecisionAnalytics,
} from "./actions";
import {
  IoPeople,
  IoTime,
  IoMail,
  IoShare,
  IoTrendingUp,
  IoTrendingDown,
  IoCheckmarkCircle,
  IoStatsChart,
} from "react-icons/io5";

function StatsLoading() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-4 lg:gap-5">
        <div className="space-y-4 order-2 lg:order-1">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 sm:p-4 h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-72" />
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-72" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-64" />
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-64" />
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-64" />
          </div>
        </div>
        <div className="space-y-3 order-1 lg:order-2">
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 h-48" />
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 h-64" />
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 h-32" />
        </div>
      </div>
    </div>
  );
}

async function DashboardStats() {
  const [result, guideResult, financeResult, issueResult] = await Promise.all([
    getAdminDashboardStats(),
    getGuideAnalytics(),
    getFinanceAnalytics(),
    getIssueDecisionAnalytics(),
  ]);

  if (!result.data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-lg">!</span>
          </div>
          <h2 className="text-sm font-medium text-red-400">Error Loading Stats</h2>
        </div>
        <p className="text-xs text-red-400/70">{result.error || "Unknown error occurred"}</p>
      </div>
    );
  }

  // Default data for analytics if they fail
  const guideStats = guideResult.data || {
    total: 0,
    clicked: 0,
    bookmarked: 0,
    helpfulYes: 0,
    helpfulNo: 0,
    bySource: [],
    byCategory: [],
  };

  const financeStats = financeResult.data || {
    usersWithIncome: 0,
    usersWithExpenses: 0,
    usersWithBudgets: 0,
    totalIncomeStreams: 0,
    totalExpenses: 0,
    totalBudgets: 0,
    avgIncomeStreamsPerUser: 0,
    avgExpensesPerUser: 0,
    adoptionTrend: [],
  };

  const issueStats = issueResult.data || {
    totalIssues: 0,
    openIssues: 0,
    completedIssues: 0,
    inProgressIssues: 0,
    totalDecisions: 0,
    approvedDecisions: 0,
    byStatus: [],
    byCategory: [],
    byResolutionType: [],
    avgResolutionDays: 0,
  };

  const {
    combinedUserStats,
    waitlistStats,
    inviteStats,
    referralStats,
    userGrowthData,
    recentUsers,
    recentActivities,
    growthPercent,
  } = result.data;

  const statCards = [
    {
      label: "Total Users",
      value: Number(combinedUserStats.total || 0),
      subtext: `${Number(combinedUserStats.thisWeek || 0)} this week`,
      trend: growthPercent,
      icon: IoPeople,
      color: "emerald",
    },
    {
      label: "Waitlist",
      value: Number(waitlistStats.total || 0),
      subtext: "Waiting for access",
      icon: IoTime,
      color: "emerald",
    },
    {
      label: "Invites Sent",
      value: Number(inviteStats.total || 0),
      subtext: `${Number(inviteStats.accepted || 0)} accepted`,
      badge: Number(inviteStats.pending || 0) > 0 ? `${Number(inviteStats.pending || 0)} pending` : undefined,
      icon: IoMail,
      color: "emerald",
    },
    {
      label: "Referrals",
      value: Number(referralStats.total || 0),
      subtext: `${Number(referralStats.converted || 0)} converted`,
      icon: IoShare,
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "bg-emerald-500/20", text: "text-emerald-400" },
  };

  // Calculate invite acceptance rate
  const inviteAcceptanceRate = inviteStats.total > 0
    ? Math.round((inviteStats.accepted / inviteStats.total) * 100)
    : 0;

  // Calculate referral conversion rate
  const referralConversionRate = referralStats.total > 0
    ? Math.round((referralStats.converted / referralStats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-4 lg:gap-5">
      {/* Main Content */}
      <div className="space-y-4 min-w-0 order-2 lg:order-1">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((stat) => {
            const colors = colorClasses[stat.color];
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`${colors.bg} ${colors.border} border rounded-lg p-3 sm:p-4 transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${colors.icon} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${colors.text}`} />
                  </div>
                  {stat.trend !== undefined && stat.trend !== 0 && (
                    <div className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium ${
                      stat.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {stat.trend > 0 ? (
                        <IoTrendingUp className="w-3 h-3" />
                      ) : (
                        <IoTrendingDown className="w-3 h-3" />
                      )}
                      <span>{Math.abs(stat.trend).toFixed(1)}%</span>
                    </div>
                  )}
                  {stat.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium rounded-full bg-emerald-500/20 text-emerald-400">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-[#888] mb-1">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-white mb-0.5">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-[9px] sm:text-[10px] text-[#666]">{stat.subtext}</p>
              </div>
            );
          })}
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                <IoCheckmarkCircle className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-[10px] text-[#666]">Invite Rate</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{inviteAcceptanceRate}%</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                <IoStatsChart className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-[10px] text-[#666]">Referral Conv.</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{referralConversionRate}%</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-rose-500/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-rose-400">J</span>
              </div>
              <span className="text-[10px] text-[#666]">Johatsu</span>
            </div>
            <p className="text-xl font-bold text-rose-400">{combinedUserStats.johatsu}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-violet-500/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-violet-400">α</span>
              </div>
              <span className="text-[10px] text-[#666]">Alpha</span>
            </div>
            <p className="text-xl font-bold text-violet-400">{combinedUserStats.alpha}</p>
          </div>
        </div>

        {/* Charts Row 1: Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-medium text-white">User Growth</h2>
                <p className="text-[10px] text-[#666]">New signups over 30 days</p>
              </div>
              <span className="text-[10px] text-[#666] uppercase tracking-wider">Last 30 days</span>
            </div>
            <div className="h-48">
              <UserGrowthChart data={userGrowthData.rows} />
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-medium text-white">User Roles</h2>
                <p className="text-[10px] text-[#666]">Distribution by role type</p>
              </div>
              <span className="text-[10px] text-[#666] uppercase tracking-wider">Distribution</span>
            </div>
            <div className="h-48">
              <RoleDistributionChart stats={combinedUserStats} />
            </div>
          </div>
        </div>

        {/* Charts Row 2: Distributions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4">
            <div className="mb-3">
              <h2 className="text-sm font-medium text-white">Tier Distribution</h2>
              <p className="text-[10px] text-[#666]">Users by access tier</p>
            </div>
            <div className="h-40">
              <TierDistributionChart
                johatsu={combinedUserStats.johatsu}
                alpha={combinedUserStats.alpha}
                beta={combinedUserStats.beta}
              />
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4">
            <div className="mb-3">
              <h2 className="text-sm font-medium text-white">Invite Funnel</h2>
              <p className="text-[10px] text-[#666]">Invite conversion status</p>
            </div>
            <div className="h-40">
              <InviteFunnelChart
                total={inviteStats.total}
                accepted={inviteStats.accepted}
                pending={inviteStats.pending}
                expired={inviteStats.expired}
              />
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <h2 className="text-sm font-medium text-white">Referral Status</h2>
              <p className="text-[10px] text-[#666]">Referral conversion</p>
            </div>
            <div className="h-40">
              <ReferralStatsChart
                converted={referralStats.converted}
                pending={referralStats.pending}
                expired={referralStats.expired}
              />
            </div>
          </div>
        </div>

        {/* Feature Analytics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <GuideAnalyticsCard stats={guideStats} />
          <FinanceAnalyticsCard stats={financeStats} />
          <IssueDecisionAnalyticsCard stats={issueStats} />
        </div>

        {/* Recent Users */}
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium text-white">Recent Users</h2>
              <p className="text-[10px] text-[#666]">Latest signups</p>
            </div>
            <span className="text-[10px] text-[#666] uppercase tracking-wider">{recentUsers.length} users</span>
          </div>
          <div className="space-y-2">
            {recentUsers.slice(0, 5).map((user: typeof recentUsers[0]) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2.5 sm:p-3 bg-[#111111] rounded-lg border border-white/[0.06] hover:border-white/[0.1] transition-colors"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-medium text-xs sm:text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-white">{user.name || "No name"}</div>
                    <div className="text-[10px] sm:text-xs text-[#666]">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium capitalize ${
                      user.role === "admin"
                        ? "bg-red-500/20 text-red-400"
                        : user.role === "moderator"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {user.role.toLowerCase()}
                  </span>
                  {user.accessTier && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium bg-emerald-500/20 text-emerald-400 capitalize">
                      {user.accessTier.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-3 min-w-0 order-1 lg:order-2">
        {/* Quick Stats Summary */}
        <QuickStatsCard
          stats={[
            { label: "New Users (7d)", value: combinedUserStats.thisWeek, change: growthPercent, icon: "users" },
            { label: "Pending Invites", value: inviteStats.pending, icon: "invites" },
            { label: "Active Referrals", value: referralStats.pending, icon: "referrals" },
            { label: "Waitlist", value: waitlistStats.total, icon: "waitlist" },
          ]}
        />

        {/* Activity Feed */}
        <ActivityFeedCard activities={recentActivities} />

        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Tier Summary Card */}
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3">
          <h3 className="text-xs font-medium text-white mb-3">Access Tiers</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-[11px] text-[#888]">Johatsu</span>
              </div>
              <span className="text-sm font-semibold text-rose-400">{combinedUserStats.johatsu}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-[#888]">Alpha</span>
              </div>
              <span className="text-sm font-semibold text-emerald-400">{combinedUserStats.alpha}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-[#888]">Beta</span>
              </div>
              <span className="text-sm font-semibold text-emerald-400">{combinedUserStats.beta}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-3 sm:p-4 lg:p-5 min-h-[calc(100vh-48px)] bg-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 lg:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">Platform overview and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-[10px] font-medium rounded bg-emerald-500/20 text-emerald-400">
            Live Data
          </span>
        </div>
      </div>
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
