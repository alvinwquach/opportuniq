import { Suspense } from "react";
import { UserGrowthChart } from "./components/UserGrowthChart";
import { RoleDistributionChart } from "./components/RoleDistributionChart";
import { getAdminDashboardStats } from "./actions";

function StatsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 h-80" />
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 h-80" />
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 h-96" />
    </div>
  );
}

async function DashboardStats() {
  const result = await getAdminDashboardStats();

  if (!result.data) {
    return (
      <div className="bg-red-900/50 border border-red-800 rounded-lg p-4">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Stats</h2>
        <p className="text-red-300">{result.error || "Unknown error occurred"}</p>
      </div>
    );
  }

  const {
    combinedUserStats,
    waitlistStats,
    inviteStats,
    referralStats,
    userGrowthData,
    recentUsers,
    growthPercent,
  } = result.data;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-400">Total Users</div>
            {growthPercent !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                growthPercent > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                <span>{growthPercent > 0 ? '↑' : '↓'}</span>
                <span>{Math.abs(growthPercent).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Number(combinedUserStats.total || 0).toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">
            {Number(combinedUserStats.thisWeek || 0)} new this week
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition-colors">
          <div className="text-sm font-medium text-neutral-400 mb-2">Waitlist</div>
          <div className="text-3xl font-bold text-white mb-1">
            {Number(waitlistStats.total || 0).toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">
            Waiting for access
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-400">Invites</div>
            {Number(inviteStats.pending || 0) > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
                {Number(inviteStats.pending || 0)} pending
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Number(inviteStats.total || 0).toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">
            {Number(inviteStats.accepted || 0)} accepted
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition-colors">
          <div className="text-sm font-medium text-neutral-400 mb-2">Referrals</div>
          <div className="text-3xl font-bold text-white mb-1">
            {Number(referralStats.total || 0).toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">
            {Number(referralStats.valid || 0)} converted
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">User Roles</h2>
            <span className="text-xs text-neutral-500">Distribution</span>
          </div>
          <div className="h-60">
            <RoleDistributionChart stats={combinedUserStats} />
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">User Growth</h2>
            <span className="text-xs text-neutral-500">Last 30 days</span>
          </div>
          <div className="h-60">
            <UserGrowthChart data={userGrowthData.rows} />
          </div>
        </div>
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Users</h2>
        <div className="space-y-2">
          {recentUsers.map((user: typeof recentUsers[0]) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                  <span className="text-[#00F0FF] font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{user.name || "No name"}</div>
                  <div className="text-sm text-neutral-400">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    user.role === "admin"
                      ? "bg-red-500/20 text-red-400"
                      : user.role === "moderator"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {user.role.toLowerCase()}
                </span>
                {user.accessTier && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-[#00F0FF]/20 text-[#00F0FF] capitalize">
                    {user.accessTier.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-neutral-400 mt-1">Platform overview and analytics</p>
      </div>
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
