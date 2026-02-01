import { IoMailOpen, IoLink } from "react-icons/io5";
import { CopyButton } from "./CopyButton";
import { RevokeButton } from "./RevokeButton";
import { InviteData, TIER_CONFIG, getInviteStatus } from "./types";

interface InviteCardProps {
  invite: InviteData;
}

export function InviteCard({ invite }: InviteCardProps) {
  const { isExpired, isAccepted, isPending } = getInviteStatus(invite);
  const tier = invite.tier || "alpha";
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.alpha;

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-medium truncate">{invite.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs ${tierConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tierConfig.dot}`} />
              {tierConfig.label}
            </span>
            <span className="text-[#333]">·</span>
            <span className={`text-xs ${isAccepted ? "text-emerald-400" : isPending ? "text-emerald-400" : "text-[#555]"}`}>
              {isAccepted ? "Accepted" : isPending ? "Pending" : "Expired"}
            </span>
            <span className="text-[#333]">·</span>
            {invite.emailSent ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <IoMailOpen className="w-3 h-3" /> Emailed
              </span>
            ) : (
              <span className="text-xs text-[#555] flex items-center gap-1">
                <IoLink className="w-3 h-3" /> Link only
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <code className="text-xs font-mono text-[#666] bg-[#171717] px-2 py-1.5 rounded flex-1 truncate">
          {invite.token}
        </code>
        <CopyButton text={invite.token} title="Copy token" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
        <div className="text-xs text-[#555]">
          <span>{new Date(invite.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span className="mx-1.5">→</span>
          <span className={isExpired ? "text-red-400/70" : ""}>
            {new Date(invite.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CopyButton text={`https://opportuniq.app/join?token=${invite.token}`} />
          {!isAccepted && (
            <RevokeButton inviteId={invite.id} email={invite.email} />
          )}
        </div>
      </div>
    </div>
  );
}
