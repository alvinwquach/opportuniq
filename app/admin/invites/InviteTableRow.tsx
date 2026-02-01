import { IoMailOpen, IoLink } from "react-icons/io5";
import { CopyButton } from "./CopyButton";
import { RevokeButton } from "./RevokeButton";
import { InviteData, TIER_CONFIG, getInviteStatus } from "./types";

interface InviteTableRowProps {
  invite: InviteData;
}

export function InviteTableRow({ invite }: InviteTableRowProps) {
  const { isExpired, isAccepted, isPending } = getInviteStatus(invite);
  const tier = invite.tier || "alpha";
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.alpha;

  return (
    <tr className="border-b border-[#141414] hover:bg-[#111] transition-colors">
      <td className="px-5 py-3">
        <span className="text-sm text-white">{invite.email}</span>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <code className="text-xs font-mono text-[#888] bg-[#171717] px-2 py-1 rounded">
            {invite.token}
          </code>
          <CopyButton text={invite.token} title="Copy token" />
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${tierConfig.dot}`} />
          <span className={`text-sm ${tierConfig.text}`}>
            {tierConfig.label}
          </span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span
          className={`text-sm ${
            isAccepted ? "text-emerald-400" : isPending ? "text-emerald-400" : "text-[#555]"
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
          {new Date(invite.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </td>
      <td className="px-5 py-3">
        <span className={`text-sm ${isExpired ? "text-red-400/70" : "text-[#666]"}`}>
          {new Date(invite.expiresAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1">
          <CopyButton
            text={`https://opportuniq.app/join?token=${invite.token}`}
          />
          {!isAccepted && (
            <RevokeButton inviteId={invite.id} email={invite.email} />
          )}
        </div>
      </td>
    </tr>
  );
}
