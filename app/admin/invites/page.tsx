import { InviteForm } from "./InviteForm";
import { InviteCard } from "./InviteCard";
import { InviteTableRow } from "./InviteTableRow";
import { getInvitesData } from "./actions";
import type { InviteData, InviteStats } from "./types";
import { IoSend, IoCheckmarkCircle, IoTime, IoTrendingUp } from "react-icons/io5";
import { InviteStatusChart, InviteTierChart, InviteTrendChart } from "./charts";

interface TierBreakdown {
  tier: string | null;
  total: number;
  accepted: number;
}

interface DailyInvite {
  date: string;
  sent: number;
  accepted: number;
}

export default async function InvitesPage() {
  let invites: InviteData[] = [];
  let stats: InviteStats = { pendingCount: 0, acceptedCount: 0, expiredCount: 0 };
  let totalInvites = 0;
  let acceptanceRate = 0;
  let tierBreakdown: TierBreakdown[] = [];
  let dailyInvites: DailyInvite[] = [];
  let error: string | null = null;

  try {
    const result = await getInvitesData();
    invites = result.allInvites;
    stats = {
      pendingCount: result.pendingCount,
      acceptedCount: result.acceptedCount,
      expiredCount: result.expiredCount,
    };
    totalInvites = result.totalInvites;
    acceptanceRate = result.acceptanceRate;
    tierBreakdown = result.tierBreakdown;
    dailyInvites = result.dailyInvites;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load invites";
    console.error("[Admin Invites] Error loading invites:", err);
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-lg">!</span>
            </div>
            <h2 className="text-sm font-medium text-red-400">Error Loading Invites</h2>
          </div>
          <p className="text-xs text-red-400/70">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Invites", value: totalInvites, icon: IoSend, color: "emerald" },
    { label: "Pending", value: stats.pendingCount, icon: IoTime, color: "amber" },
    { label: "Accepted", value: stats.acceptedCount, icon: IoCheckmarkCircle, color: "emerald" },
    { label: "Acceptance Rate", value: `${acceptanceRate}%`, icon: IoTrendingUp, color: "emerald" },
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "bg-emerald-500/20", text: "text-emerald-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "bg-amber-500/20", text: "text-amber-400" },
  };

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">Invites</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">Send and manage invitations</p>
        </div>
        <InviteForm />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <InviteStatusChart
          pending={stats.pendingCount}
          accepted={stats.acceptedCount}
          expired={stats.expiredCount}
        />
        <InviteTierChart tierBreakdown={tierBreakdown} />
        <InviteTrendChart dailyInvites={dailyInvites} />
      </div>

      {/* Invites List */}
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white">All Invites</h2>
          <p className="text-[10px] text-[#666]">{invites.length} total invitations</p>
        </div>
        {invites.length === 0 ? (
          <div className="p-8 text-center">
            <IoSend className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-xs text-[#666]">No invites yet</p>
            <p className="text-[10px] text-[#555] mt-1">Use the form above to send invites</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="lg:hidden p-3 sm:p-4 space-y-3">
              {invites.map((invite) => (
                <InviteCard key={invite.id} invite={invite} />
              ))}
            </div>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Email</th>
                    <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Token</th>
                    <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Tier</th>
                    <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Delivery</th>
                    <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Created</th>
                    <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Expires</th>
                    <th className="text-right text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {invites.map((invite) => (
                    <InviteTableRow key={invite.id} invite={invite} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
