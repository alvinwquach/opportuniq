import Image from "next/image";
import { getReferralsData } from "./actions";

export default async function Referrals() {
  let referralStats: any = null;
  let topReferrers: any[] = [];
  let recentReferrals: any[] = [];
  let tierStats: any = null;
  let conversionRate = 0;
  let viralCoefficient: string | number = 0;
  let error: string | null = null;

  try {
    const result = await getReferralsData();
    referralStats = result.referralStats || null;
    topReferrers = result.topReferrers || [];
    recentReferrals = result.recentReferrals || [];
    tierStats = result.tierStats || null;
    conversionRate = result.conversionRate || 0;
    viralCoefficient = result.viralCoefficient || 0;
  } catch (err: any) {
    error = err?.message || "Failed to load referrals";
    console.error("[Admin Referrals] Error loading referrals:", err);
  }

  if (error) {
    return (
      <div className="p-4 lg:p-5">
        <div className="mb-4">
          <h1 className="text-[15px] font-medium text-white">User Referrals</h1>
          <p className="text-[13px] text-[#666]">Track user-to-user referrals</p>
        </div>
        <div className="bg-red-900/50 border border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Referrals</h2>
          <p className="text-red-300">{error}</p>
          <p className="text-sm text-red-400 mt-2">
            This is likely a database connection issue. Check your DATABASE_URL configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-5">
      <div className="mb-4">
        <h1 className="text-[15px] font-medium text-white">User Referrals</h1>
        <p className="text-[13px] text-[#666]">
          Track user-to-user referrals (when existing users invite friends via referral codes)
        </p>
        <p className="text-[11px] text-[#444] mt-1">
          Note: Admin invites are tracked separately in the Invites page
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Johatsu</p>
          <span className="text-xl font-semibold text-white">{tierStats?.johatsu || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Alpha Users</p>
          <span className="text-xl font-semibold text-white">{tierStats?.alpha || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Beta Users</p>
          <span className="text-xl font-semibold text-white">{tierStats?.beta || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Referral Signups</p>
          <span className="text-xl font-semibold text-emerald-400">{referralStats?.converted || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Conversion Rate</p>
          <span className="text-xl font-semibold text-white">{conversionRate}%</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f] group relative">
          <p className="text-[11px] text-[#666] mb-1">Viral Coefficient</p>
          <span className="text-xl font-semibold text-amber-400">{viralCoefficient}</span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1f1f1f] border border-[#333] rounded-lg text-[11px] text-[#888] w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Avg new users per existing user. Above 1.0 = viral growth
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-3">
            <h2 className="text-[13px] font-medium text-white">Top referrers</h2>
            <p className="text-[11px] text-[#666]">Users who have referred the most friends</p>
          </div>
          {topReferrers.length === 0 ? (
            <p className="text-[13px] text-[#666] text-center py-6">No user referrals yet</p>
          ) : (
            <div className="space-y-2.5">
              {topReferrers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono text-[#555] w-5">#{index + 1}</span>
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || user.email}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[10px] text-[#888]">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white truncate">{user.name || user.email}</p>
                    <p className="text-[10px] text-[#555] font-mono">{user.referralCode}</p>
                  </div>
                  <span className="text-[15px] font-semibold text-emerald-400">{user.referralCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-3">
            <h2 className="text-[13px] font-medium text-white">Referral funnel</h2>
            <p className="text-[11px] text-[#666]">User referral code usage breakdown</p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="text-[#888]">Codes Shared</span>
                <span className="text-white font-medium">{referralStats?.total || 0}</span>
              </div>
              <div className="h-1 rounded-full bg-[#1f1f1f] overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="text-[#888]">Pending</span>
                <span className="text-white font-medium">{referralStats?.pending || 0}</span>
              </div>
              <div className="h-1 rounded-full bg-[#1f1f1f] overflow-hidden">
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
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="text-[#888]">Converted</span>
                <span className="text-white font-medium">{referralStats?.converted || 0}</span>
              </div>
              <div className="h-1 rounded-full bg-[#1f1f1f] overflow-hidden">
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
      <div className="rounded-lg bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1f1f1f]">
          <h2 className="text-[13px] font-medium text-white">Recent user referrals</h2>
          <p className="text-[11px] text-[#666]">Friends invited by existing users</p>
        </div>
        {recentReferrals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-[#666]">No user referrals yet</p>
            <p className="text-[11px] text-[#444] mt-1">Users can share their referral codes to invite friends</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Referee</th>
                  <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Referred By</th>
                  <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Status</th>
                  <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {recentReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-white">{referral.refereeEmail}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#888]">
                        {referral.referrerName || referral.referrerEmail}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            referral.status === "converted"
                              ? "rgba(34, 197, 94, 0.15)"
                              : referral.status === "pending"
                              ? "rgba(251, 191, 36, 0.15)"
                              : "rgba(100, 116, 139, 0.15)",
                          color:
                            referral.status === "converted"
                              ? "#22c55e"
                              : referral.status === "pending"
                              ? "#fbbf24"
                              : "#64748b",
                        }}
                      >
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#888]">
                        {referral.createdAt.toLocaleDateString("en-US", {
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
