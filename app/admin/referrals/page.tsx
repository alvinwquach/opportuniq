import Image from "next/image";
import { getReferralsData } from "./actions";
import {
  IoShare,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoStar,
  IoRocket,
  IoShield,
} from "react-icons/io5";
import { TierDistributionChart, ReferralFunnelChart, ReferralTrendChart, ReferralGrowthChart } from "./charts";

type ReferralsData = Awaited<ReturnType<typeof getReferralsData>>;

export default async function Referrals() {
  let referralStats: ReferralsData["referralStats"] | null = null;
  let topReferrers: ReferralsData["topReferrers"] = [];
  let recentReferrals: ReferralsData["recentReferrals"] = [];
  let tierStats: ReferralsData["tierStats"] | null = null;
  let conversionRate = 0;
  let viralCoefficient: string | number = 0;
  let error: string | null = null;

  let referralGrowthData: ReferralsData["referralGrowthData"] = [];

  try {
    const result = await getReferralsData();
    referralStats = result.referralStats || null;
    topReferrers = result.topReferrers || [];
    recentReferrals = result.recentReferrals || [];
    tierStats = result.tierStats || null;
    conversionRate = result.conversionRate || 0;
    viralCoefficient = result.viralCoefficient || 0;
    referralGrowthData = result.referralGrowthData || [];
  } catch (err: unknown) {
    error = (err as Error)?.message || "Failed to load referrals";
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-semibold text-white">User Referrals</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">Track user-to-user referrals</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-lg">!</span>
            </div>
            <h2 className="text-sm font-medium text-red-400">Error Loading Referrals</h2>
          </div>
          <p className="text-xs text-red-400/70">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Johatsu", value: tierStats?.johatsu || 0, icon: IoStar, color: "rose" },
    { label: "Alpha", value: tierStats?.alpha || 0, icon: IoRocket, color: "emerald" },
    { label: "Beta", value: tierStats?.beta || 0, icon: IoShield, color: "emerald" },
    { label: "Converted", value: referralStats?.converted || 0, icon: IoCheckmarkCircle, color: "emerald" },
    { label: "Conversion", value: `${conversionRate}%`, icon: IoTrendingUp, color: "emerald" },
    { label: "Viral Coef.", value: viralCoefficient, icon: IoShare, color: "emerald" },
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "bg-rose-500/20", text: "text-rose-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "bg-emerald-500/20", text: "text-emerald-400" },
  };

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-white">User Referrals</h1>
        <p className="text-[10px] sm:text-xs text-[#666]">
          Track user-to-user referrals (when existing users invite friends via referral codes)
        </p>
        <p className="text-[9px] text-[#555] mt-1">
          Note: Admin invites are tracked separately in the Invites page
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${colors.bg} ${colors.border} border rounded-lg p-3 transition-all hover:scale-[1.02] group relative`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${colors.icon} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                </div>
              </div>
              <p className="text-[10px] text-[#888] mb-0.5">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.label === "Viral Coef." ? "text-emerald-400" : "text-white"}`}>
                {stat.value}
              </p>
              {stat.label === "Viral Coef." && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-[10px] text-[#888] w-44 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Avg new users per existing user. Above 1.0 = viral growth
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Referral Growth Chart */}
      <ReferralGrowthChart data={referralGrowthData} />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <TierDistributionChart
          johatsu={tierStats?.johatsu || 0}
          alpha={tierStats?.alpha || 0}
          beta={tierStats?.beta || 0}
        />
        <ReferralFunnelChart
          total={referralStats?.total || 0}
          pending={referralStats?.pending || 0}
          converted={referralStats?.converted || 0}
        />
        <ReferralTrendChart referrals={recentReferrals} />
      </div>

      {/* Two Column Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Referrers */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-white">Top Referrers</h2>
            <p className="text-[10px] text-[#666]">Users who have referred the most friends</p>
          </div>
          {topReferrers.length === 0 ? (
            <div className="py-6 text-center">
              <IoShare className="w-6 h-6 text-[#333] mx-auto mb-2" />
              <p className="text-xs text-[#666]">No user referrals yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topReferrers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                  <span className="text-[10px] font-mono text-[#555] w-5">#{index + 1}</span>
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || user.email}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[9px] text-[#888]">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{user.name || user.email}</p>
                    <p className="text-[9px] text-[#555] font-mono">{user.referralCode}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{user.referralCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referral Funnel Progress */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-white">Referral Pipeline</h2>
            <p className="text-[10px] text-[#666]">User referral code usage breakdown</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#888]">Codes Shared</span>
                <span className="text-white font-medium">{referralStats?.total || 0}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#888]">Pending</span>
                <span className="text-white font-medium">{referralStats?.pending || 0}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: referralStats?.total
                      ? `${(referralStats.pending / referralStats.total) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#888]">Converted</span>
                <span className="text-white font-medium">{referralStats?.converted || 0}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: referralStats?.total
                      ? `${(referralStats.converted / referralStats.total) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals Table */}
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white">Recent User Referrals</h2>
          <p className="text-[10px] text-[#666]">Friends invited by existing users</p>
        </div>
        {recentReferrals.length === 0 ? (
          <div className="p-8 text-center">
            <IoShare className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-xs text-[#666]">No user referrals yet</p>
            <p className="text-[10px] text-[#555] mt-1">Users can share their referral codes to invite friends</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Referee</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Referred By</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {recentReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-white">{referral.refereeEmail}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-[#888]">
                        {referral.referrerName || referral.referrerEmail}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${
                          referral.status === "converted"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : referral.status === "pending"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-gray-500/15 text-gray-400"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-[#888]">
                        {new Date(referral.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
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
