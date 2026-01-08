import { InviteForm } from "./InviteForm";
import { CopyButton } from "./CopyButton";
import { RevokeButton } from "./RevokeButton";
import { getInvitesData } from "./actions";
import { IoMailOpen, IoLink } from "react-icons/io5";

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

  const tierConfig: Record<string, { dot: string; text: string; label: string }> = {
    johatsu: { dot: "bg-rose-400", text: "text-rose-400", label: "Johatsu" },
    alpha: { dot: "bg-purple-400", text: "text-purple-400", label: "Alpha" },
    beta: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Beta" },
  };

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
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <h1 className="text-base font-semibold text-white">Invites</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-blue-400">{pendingCount} pending</span>
              <span className="text-[#333]">·</span>
              <span className="text-emerald-400">{acceptedCount} accepted</span>
              <span className="text-[#333]">·</span>
              <span className="text-[#666]">{expiredCount} expired</span>
            </div>
          </div>
          <InviteFormCompact />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {allInvites.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[#444]">No invites yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-[#0d0d0d] z-10">
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Tier</th>
                <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Delivery</th>
                <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Created</th>
                <th className="text-left text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Expires</th>
                <th className="text-right text-xs font-medium text-[#666] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allInvites.map((invite) => {
                const isExpired = !invite.acceptedAt && new Date() >= invite.expiresAt;
                const isAccepted = !!invite.acceptedAt;
                const isPending = !isExpired && !isAccepted;
                const tier = invite.tier || "alpha";

                return (
                  <tr key={invite.id} className="border-b border-[#141414] hover:bg-[#111] transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm text-white">{invite.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${tierConfig[tier]?.dot || tierConfig.alpha.dot}`} />
                        <span className={`text-sm ${tierConfig[tier]?.text || tierConfig.alpha.text}`}>
                          {tierConfig[tier]?.label || "Alpha"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-sm ${
                          isAccepted ? "text-emerald-400" : isPending ? "text-blue-400" : "text-[#555]"
                        }`}
                      >
                        {isAccepted ? "Accepted" : isPending ? "Pending" : "Expired"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {invite.emailSent ? (
                        <IoMailOpen className="w-4 h-4 text-emerald-400" title="Email sent" />
                      ) : (
                        <IoLink className="w-4 h-4 text-[#444]" title="Link only" />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-[#666]">
                        {invite.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${isExpired ? "text-red-400/70" : "text-[#666]"}`}>
                        {invite.expiresAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <CopyButton
                          text={`https://www.opportuniq.app/join?token=${invite.token}`}
                        />
                        {!isAccepted && (
                          <RevokeButton inviteId={invite.id} email={invite.email} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
