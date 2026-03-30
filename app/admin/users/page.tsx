import Image from "next/image";
import { getUsersData } from "./actions";
import {
  IoPeople,
  IoShield,
  IoStar,
  IoRocket,
  IoBan,
} from "react-icons/io5";
import { TierDistributionChart, RoleDistributionChart, UserGrowthChart } from "./charts";

type UsersData = Awaited<ReturnType<typeof getUsersData>>;

export default async function UsersPage() {
  let allUsers: UsersData["allUsers"] = [];
  let userStats: UsersData["userStats"] | null = null;
  let userGrowthData: UsersData["userGrowthData"] = [];
  let error: string | null = null;

  try {
    const result = await getUsersData();
    allUsers = result.allUsers || [];
    userStats = result.userStats || null;
    userGrowthData = result.userGrowthData || [];
  } catch (err: unknown) {
    error = (err as Error)?.message || "Failed to load users";
    console.error("[Admin Users] Error loading users:", err);
  }

  if (error || !userStats) {
    return (
      <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-semibold text-white">Users</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">Manage all registered users</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-lg">!</span>
            </div>
            <h2 className="text-sm font-medium text-red-400">Error Loading Users</h2>
          </div>
          <p className="text-xs text-red-400/70">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: userStats.total, icon: IoPeople, color: "emerald" },
    { label: "Johatsu", value: userStats.johatsu, icon: IoStar, color: "rose" },
    { label: "Alpha", value: userStats.alpha, icon: IoRocket, color: "emerald" },
    { label: "Beta", value: userStats.beta, icon: IoShield, color: "emerald" },
    { label: "Banned", value: userStats.banned, icon: IoBan, color: "red" },
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "bg-emerald-500/20", text: "text-emerald-400" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "bg-rose-500/20", text: "text-rose-400" },
    red: { bg: "bg-red-500/10", border: "border-red-500/20", icon: "bg-red-500/20", text: "text-red-400" },
  };

  const tierColors: Record<string, { bg: string; text: string }> = {
    johatsu: { bg: "bg-rose-500/15", text: "text-rose-400" },
    alpha: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    beta: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    public: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  };

  const roleColorClasses: Record<string, { bg: string; text: string }> = {
    admin: { bg: "bg-red-500/15", text: "text-red-400" },
    moderator: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    user: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    banned: { bg: "bg-red-500/15", text: "text-red-400" },
  };

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">Users</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">Manage all registered users and access tiers</p>
        </div>
        <span className="px-2 py-1 text-[10px] font-medium rounded bg-emerald-500/20 text-emerald-400 self-start sm:self-auto">
          {allUsers.length} total
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${colors.bg} ${colors.border} border rounded-lg p-3 transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${colors.icon} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                </div>
              </div>
              <p className="text-[10px] text-[#888] mb-0.5">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* User Growth Chart */}
      <UserGrowthChart data={userGrowthData} />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <TierDistributionChart
          johatsu={userStats.johatsu}
          alpha={userStats.alpha}
          beta={userStats.beta}
          total={userStats.total}
          banned={userStats.banned}
        />
        <RoleDistributionChart
          admins={userStats.admins}
          moderators={userStats.moderators}
          activeUsers={userStats.activeUsers}
          banned={userStats.banned}
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white">All Users</h2>
          <p className="text-[10px] text-[#666]">{allUsers.length} registered accounts</p>
        </div>
        {allUsers.length === 0 ? (
          <div className="p-8 text-center">
            <IoPeople className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-xs text-[#666]">No users yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Tier</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Referrals</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.name || user.email}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#888]">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-white">{user.name || "No name"}</p>
                          <p className="text-[10px] text-[#666]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${
                          tierColors[user.accessTier || "public"]?.bg || "bg-emerald-500/15"
                        } ${tierColors[user.accessTier || "public"]?.text || "text-emerald-400"}`}
                      >
                        {(user.accessTier || "public").toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${
                          roleColorClasses[user.role]?.bg || "bg-emerald-500/15"
                        } ${roleColorClasses[user.role]?.text || "text-emerald-400"}`}
                      >
                        {user.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white font-mono">{user.referralCount || 0}</span>
                        {user.referralCode && (
                          <code className="text-[9px] text-[#666] bg-[#2a2a2a] px-1 py-0.5 rounded">
                            {user.referralCode}
                          </code>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-[#888]">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
