"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import {
  IoMailOutline,
  IoPersonAdd,
  IoRefresh,
  IoCalendarOutline,
  IoClose,
  IoCheckmarkCircle,
  IoTime,
  IoPeople,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import { getInvitationAuditLog, type InvitationAuditLogEntry } from "@/app/dashboard/groups/actions";

interface InvitationHistorySectionProps {
  groupId: string;
  isCollaborator: boolean;
}

type InvitationAction =
  | "created"
  | "resent"
  | "role_updated"
  | "extended"
  | "revoked"
  | "accepted"
  | "expired"
  | "bulk_created";

function getActionIcon(action: InvitationAction) {
  switch (action) {
    case "created":
      return <IoPersonAdd className="w-4 h-4" />;
    case "bulk_created":
      return <IoPeople className="w-4 h-4" />;
    case "resent":
      return <IoRefresh className="w-4 h-4" />;
    case "role_updated":
      return <IoMailOutline className="w-4 h-4" />;
    case "extended":
      return <IoCalendarOutline className="w-4 h-4" />;
    case "revoked":
      return <IoClose className="w-4 h-4" />;
    case "accepted":
      return <IoCheckmarkCircle className="w-4 h-4" />;
    case "expired":
      return <IoTime className="w-4 h-4" />;
    default:
      return <IoMailOutline className="w-4 h-4" />;
  }
}

function getActionColor(action: InvitationAction) {
  switch (action) {
    case "created":
    case "bulk_created":
      return "bg-[#00D4FF]/10 text-[#00D4FF]";
    case "resent":
      return "bg-green-500/10 text-green-500";
    case "role_updated":
      return "bg-purple-500/10 text-purple-400";
    case "extended":
      return "bg-amber-500/10 text-amber-500";
    case "revoked":
      return "bg-red-500/10 text-red-400";
    case "accepted":
      return "bg-green-500/10 text-green-500";
    case "expired":
      return "bg-[#666]/10 text-[#666]";
    default:
      return "bg-[#1f1f1f] text-[#9a9a9a]";
  }
}

function getActionLabel(action: InvitationAction): string {
  switch (action) {
    case "created":
      return "Invited";
    case "bulk_created":
      return "Bulk invited";
    case "resent":
      return "Resent invitation";
    case "role_updated":
      return "Role changed";
    case "extended":
      return "Extended expiration";
    case "revoked":
      return "Revoked";
    case "accepted":
      return "Accepted";
    case "expired":
      return "Expired";
    default:
      return action;
  }
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

function formatActionDetails(entry: InvitationAuditLogEntry): string | null {
  switch (entry.action) {
    case "role_updated":
      if (entry.oldValue && entry.newValue) {
        return `${entry.oldValue} → ${entry.newValue}`;
      }
      return null;
    case "extended":
      if (entry.newValue) {
        try {
          return `until ${format(new Date(entry.newValue), "MMM d, yyyy")}`;
        } catch {
          return null;
        }
      }
      return null;
    case "created":
    case "bulk_created":
      if (entry.newValue) {
        return `as ${entry.newValue}`;
      }
      return null;
    default:
      return null;
  }
}

export function InvitationHistorySection({
  groupId,
  isCollaborator,
}: InvitationHistorySectionProps) {
  const [entries, setEntries] = useState<InvitationAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      if (!isCollaborator) {
        setLoading(false);
        return;
      }

      try {
        const result = await getInvitationAuditLog(groupId, { limit: 20 });
        if (result.success) {
          setEntries(result.entries);
        } else {
          setError(result.error || "Failed to load history");
        }
      } catch (err) {
        setError("Failed to load history");
        console.error("Failed to fetch invitation history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [groupId, isCollaborator]);

  if (!isCollaborator) {
    return null;
  }

  if (loading) {
    return (
      <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <IoTime className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-medium text-white">
              Invitation History
            </h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-6 h-6 border-2 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#666] mt-3">Loading history...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <IoTime className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-medium text-white">
              Invitation History
            </h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <IoTime className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-medium text-white">
              Invitation History
            </h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center mx-auto mb-3">
            <IoTime className="w-6 h-6 text-[#666]" />
          </div>
          <p className="text-sm text-[#9a9a9a] mb-1">No invitation history yet</p>
          <p className="text-xs text-[#666]">
            Activity will appear here when you invite members
          </p>
        </div>
      </section>
    );
  }

  const displayedEntries = expanded ? entries : entries.slice(0, 5);

  return (
    <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <IoTime className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-medium text-white">
            Invitation History
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#666]">
            {entries.length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-[#1f1f1f]">
        {displayedEntries.map((entry) => {
          const actionDetails = formatActionDetails(entry);
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getActionColor(entry.action)}`}
              >
                {getActionIcon(entry.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">
                    {getActionLabel(entry.action)}
                  </span>
                  <span className="text-sm text-[#9a9a9a] truncate">
                    {entry.inviteeEmail}
                  </span>
                  {actionDetails && (
                    <span className="text-xs text-[#666] px-1.5 py-0.5 rounded bg-[#1f1f1f]">
                      {actionDetails}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {entry.performedBy.avatarUrl ? (
                    <Image
                      src={entry.performedBy.avatarUrl}
                      alt={entry.performedBy.name || entry.performedBy.email}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[8px] font-medium text-[#9a9a9a]">
                      {getInitials(entry.performedBy.name, entry.performedBy.email)}
                    </div>
                  )}
                  <span className="text-xs text-[#666]">
                    {entry.performedBy.name ||
                      entry.performedBy.email.split("@")[0]}
                  </span>
                  <span className="text-xs text-[#666]">·</span>
                  <span className="text-xs text-[#666]">
                    {formatDistanceToNow(new Date(entry.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {entries.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs text-[#00D4FF] hover:bg-[#1a1a1a] transition-colors border-t border-[#1f1f1f]"
        >
          {expanded ? (
            <>
              <IoChevronUp className="w-3.5 h-3.5" />
              Show less
            </>
          ) : (
            <>
              <IoChevronDown className="w-3.5 h-3.5" />
              Show {entries.length - 5} more
            </>
          )}
        </button>
      )}
    </section>
  );
}
