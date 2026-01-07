"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  IoTime,
  IoChevronDown,
  IoChevronUp,
  IoChatbubble,
  IoCamera,
  IoCalendar,
  IoCheckmarkCircle,
  IoSwapHorizontal,
  IoFlag,
  IoBulb,
  IoConstruct,
  IoClose,
} from "react-icons/io5";
import type { TimelineEntry } from "../../actions";

interface IssueTimelineProps {
  entries: TimelineEntry[];
}

function getTimelineIcon(type: TimelineEntry["type"], title?: string) {
  if (title?.toLowerCase().includes("status")) {
    return IoSwapHorizontal;
  }
  if (title?.toLowerCase().includes("resolv") || title?.toLowerCase().includes("complet")) {
    return IoCheckmarkCircle;
  }
  if (title?.toLowerCase().includes("reopen")) {
    return IoClose;
  }
  if (title?.toLowerCase().includes("diagnos") || title?.toLowerCase().includes("hypothesis")) {
    return IoBulb;
  }

  switch (type) {
    case "activity":
      return IoFlag;
    case "comment":
      return IoChatbubble;
    case "evidence":
      return IoCamera;
    case "schedule":
      return IoCalendar;
    case "decision":
      return IoCheckmarkCircle;
    case "vote":
      return IoCheckmarkCircle;
    case "outcome":
      return IoConstruct;
    default:
      return IoTime;
  }
}

function getTimelineColors(type: TimelineEntry["type"], title?: string) {
  if (title?.toLowerCase().includes("resolv") || title?.toLowerCase().includes("complet")) {
    return { bg: "bg-green-500", icon: "text-white", line: "bg-green-500/30" };
  }
  if (title?.toLowerCase().includes("reopen")) {
    return { bg: "bg-orange-500", icon: "text-white", line: "bg-orange-500/30" };
  }
  if (title?.toLowerCase().includes("status")) {
    return { bg: "bg-purple-500", icon: "text-white", line: "bg-purple-500/30" };
  }
  if (title?.toLowerCase().includes("cancel") || title?.toLowerCase().includes("delet")) {
    return { bg: "bg-red-500", icon: "text-white", line: "bg-red-500/30" };
  }

  switch (type) {
    case "activity":
      return { bg: "bg-[#00D4FF]", icon: "text-white", line: "bg-[#00D4FF]/30" };
    case "comment":
      return { bg: "bg-blue-500", icon: "text-white", line: "bg-blue-500/30" };
    case "evidence":
      return { bg: "bg-amber-500", icon: "text-white", line: "bg-amber-500/30" };
    case "schedule":
      return { bg: "bg-purple-500", icon: "text-white", line: "bg-purple-500/30" };
    case "decision":
      return { bg: "bg-green-500", icon: "text-white", line: "bg-green-500/30" };
    case "vote":
      return { bg: "bg-[#00D4FF]", icon: "text-white", line: "bg-[#00D4FF]/30" };
    case "outcome":
      return { bg: "bg-green-500", icon: "text-white", line: "bg-green-500/30" };
    default:
      return { bg: "bg-[#333]", icon: "text-[#9a9a9a]", line: "bg-[#333]" };
  }
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function IssueTimeline({ entries }: IssueTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) {
    return (
      <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <IoTime className="w-4 h-4 text-[#00D4FF]" />
            <h2 className="text-sm font-medium text-white">Timeline</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center mx-auto mb-3">
            <IoTime className="w-6 h-6 text-[#666]" />
          </div>
          <p className="text-sm text-[#9a9a9a] mb-1">No activity yet</p>
          <p className="text-xs text-[#666]">
            Events will appear here as the issue progresses
          </p>
        </div>
      </section>
    );
  }

  const displayedEntries = expanded ? entries : entries.slice(0, 10);

  return (
    <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <IoTime className="w-4 h-4 text-[#00D4FF]" />
          <h2 className="text-sm font-medium text-white">Timeline</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#666]">
            {entries.length}
          </span>
        </div>
      </div>

      {/* Timeline with vertical line */}
      <div className="p-4">
        <div className="relative">
          {displayedEntries.map((entry, index) => {
            const Icon = getTimelineIcon(entry.type, entry.title);
            const colors = getTimelineColors(entry.type, entry.title);
            const isLast = index === displayedEntries.length - 1;

            return (
              <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-16px)] ${colors.line}`}
                  />
                )}

                {/* Icon node */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colors.bg}`}
                >
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-white">{entry.title}</p>
                  {entry.description && (
                    <p className="text-xs text-[#9a9a9a] mt-1 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {entry.performer ? (
                      <>
                        {entry.performer.avatarUrl ? (
                          <Image
                            src={entry.performer.avatarUrl}
                            alt={entry.performer.name || "User"}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[8px] font-medium text-[#9a9a9a]">
                            {getInitials(entry.performer.name)}
                          </div>
                        )}
                        <span className="text-xs text-[#666]">
                          {entry.performer.name || "Unknown"}
                        </span>
                        <span className="text-xs text-[#444]">·</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[8px] font-medium text-[#00D4FF]">
                          AI
                        </div>
                        <span className="text-xs text-[#666]">System</span>
                        <span className="text-xs text-[#444]">·</span>
                      </>
                    )}
                    <span className="text-xs text-[#666]">
                      {formatDistanceToNow(new Date(entry.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {entries.length > 10 && (
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
              Show {entries.length - 10} more
            </>
          )}
        </button>
      )}
    </section>
  );
}
