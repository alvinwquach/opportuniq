import { InviteForm } from "./InviteForm";
import { InviteCard } from "./InviteCard";
import { InviteTableRow } from "./InviteTableRow";
import { getInvitesData } from "./actions";
import type { InviteData, InviteStats } from "./types";

export default async function InvitesPage() {
  let invites: InviteData[] = [];
  let stats: InviteStats = { pendingCount: 0, acceptedCount: 0, expiredCount: 0 };
  let error: string | null = null;

  try {
    const result = await getInvitesData();
    invites = result.allInvites;
    stats = {
      pendingCount: result.pendingCount,
      acceptedCount: result.acceptedCount,
      expiredCount: result.expiredCount,
    };
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load invites";
    console.error("[Admin Invites] Error loading invites:", err);
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen flex flex-col bg-[#0a0a0a]">
      <InvitesHeader stats={stats} />
      <InvitesList invites={invites} />
    </div>
  );
}

function InvitesHeader({ stats }: { stats: InviteStats }) {
  return (
    <div className="shrink-0 px-4 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
          <h1 className="text-base font-semibold text-white">Invites</h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-blue-400">{stats.pendingCount} pending</span>
            <span className="text-[#333]">·</span>
            <span className="text-emerald-400">{stats.acceptedCount} accepted</span>
            <span className="text-[#333]">·</span>
            <span className="text-[#666]">{stats.expiredCount} expired</span>
          </div>
        </div>
        <div className="shrink-0">
          <InviteForm />
        </div>
      </div>
    </div>
  );
}

function InvitesList({ invites }: { invites: InviteData[] }) {
  if (invites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-sm text-[#444]">No invites yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0a0a]">
      <div className="lg:hidden p-4 space-y-3">
        {invites.map((invite) => (
          <InviteCard key={invite.id} invite={invite} />
        ))}
      </div>
      <table className="w-full hidden lg:table">
        <thead className="sticky top-0 bg-[#0d0d0d] z-10">
          <tr className="border-b border-[#1a1a1a]">
            <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Email</th>
            <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Token</th>
            <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Tier</th>
            <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Status</th>
            <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Delivery</th>
            <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Created</th>
            <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Expires</th>
            <th className="text-right text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <InviteTableRow key={invite.id} invite={invite} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
