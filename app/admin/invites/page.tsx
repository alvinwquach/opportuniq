import { InviteForm } from "./InviteForm";
import { CopyButton } from "./CopyButton";
import { getInvitesData } from "./actions";
import { IoMail, IoMailOpen, IoTime, IoCheckmarkCircle, IoCloseCircle, IoPeople, IoTrendingUp, IoLink } from "react-icons/io5";

export const dynamic = "force-dynamic";

export default async function Invites() {
  let allInvites: any[] = [];
  let pendingCount = 0;
  let acceptedCount = 0;
  let expiredCount = 0;
  let error: string | null = null;

  try {
    const result = await getInvitesData();
    allInvites = result.allInvites || [];
    pendingCount = result.pendingCount || 0;
    acceptedCount = result.acceptedCount || 0;
    expiredCount = result.expiredCount || 0;
  } catch (err: any) {
    error = err?.message || "Failed to load invites";
    console.error("[Admin Invites] Error loading invites:", err);
  }

  const tierConfig: Record<string, { bg: string; text: string; label: string }> = {
    johatsu: { bg: "bg-rose-500/10", text: "text-rose-400", label: "Johatsu" },
    alpha: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Alpha" },
    beta: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Beta" },
  };

  const conversionRate = allInvites.length > 0
    ? Math.round((acceptedCount / allInvites.length) * 100)
    : 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Error Loading Invites</h2>
          <p className="text-red-300/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Invites</h1>
        <p className="text-sm text-[#888]">Manage and track user invitations across all access tiers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <IoTime className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-blue-400/60 uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">{pendingCount}</p>
          <p className="text-xs text-[#666] mt-1">Awaiting signup</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400/60 uppercase tracking-wider">Accepted</span>
          </div>
          <p className="text-3xl font-bold text-white">{acceptedCount}</p>
          <p className="text-xs text-[#666] mt-1">Successfully joined</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
              <IoCloseCircle className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-medium text-slate-400/60 uppercase tracking-wider">Expired</span>
          </div>
          <p className="text-3xl font-bold text-white">{expiredCount}</p>
          <p className="text-xs text-[#666] mt-1">Past deadline</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <IoTrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xs font-medium text-amber-400/60 uppercase tracking-wider">Conversion</span>
          </div>
          <p className="text-3xl font-bold text-white">{conversionRate}%</p>
          <p className="text-xs text-[#666] mt-1">Invite to signup</p>
        </div>
      </div>

      {/* Invite Form */}
      <div className="mb-6">
        <InviteForm />
      </div>

      {/* Invites Table */}
      <div className="rounded-xl bg-[#0d0d0d] border border-[#1f1f1f] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center">
              <IoPeople className="w-4 h-4 text-[#888]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">All Invites</h3>
              <p className="text-xs text-[#666]">{allInvites.length} total invitations</p>
            </div>
          </div>
        </div>

        {allInvites.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
              <IoMail className="w-6 h-6 text-[#444]" />
            </div>
            <p className="text-sm text-[#666] mb-1">No invites sent yet</p>
            <p className="text-xs text-[#444]">Use the form above to invite your first user</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
                  <th className="text-left text-[10px] font-semibold text-[#666] uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-[10px] font-semibold text-[#666] uppercase tracking-wider px-5 py-3">Tier</th>
                  <th className="text-left text-[10px] font-semibold text-[#666] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-[10px] font-semibold text-[#666] uppercase tracking-wider px-5 py-3">Sent</th>
                  <th className="text-left text-[10px] font-semibold text-[#666] uppercase tracking-wider px-5 py-3">Invite Link</th>
                  <th className="text-left text-[10px] font-semibold text-[#666] uppercase tracking-wider px-5 py-3">Created</th>
                  <th className="text-left text-[10px] font-semibold text-[#666] uppercase tracking-wider px-5 py-3">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {allInvites.map((invite) => {
                  const isExpired = !invite.acceptedAt && new Date() >= invite.expiresAt;
                  const isAccepted = !!invite.acceptedAt;
                  const isPending = !isExpired && !isAccepted;
                  const tier = invite.tier || "alpha";

                  return (
                    <tr key={invite.id} className="hover:bg-[#111] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center text-xs font-medium text-[#888]">
                            {invite.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-white font-medium">{invite.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${tierConfig[tier]?.bg || tierConfig.alpha.bg} ${tierConfig[tier]?.text || tierConfig.alpha.text}`}>
                          {tierConfig[tier]?.label || "Alpha"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAccepted ? "bg-emerald-400" : isPending ? "bg-blue-400" : "bg-slate-500"
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              isAccepted ? "text-emerald-400" : isPending ? "text-blue-400" : "text-slate-500"
                            }`}
                          >
                            {isAccepted ? "Accepted" : isPending ? "Pending" : "Expired"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {invite.emailSent ? (
                            <>
                              <IoMailOpen className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-medium text-emerald-400">Sent</span>
                            </>
                          ) : (
                            <>
                              <IoLink className="w-4 h-4 text-slate-500" />
                              <span className="text-xs font-medium text-slate-500">Link only</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <CopyButton
                          text={`https://www.opportuniq.app/join/${invite.token}`}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[#666]">
                          {invite.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs ${isExpired ? "text-red-400" : "text-[#666]"}`}>
                          {invite.expiresAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
