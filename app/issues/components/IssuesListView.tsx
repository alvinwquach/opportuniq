"use client";

import Link from "next/link";
import {
  IoWater,
  IoSnow,
  IoFlash,
  IoConstruct,
  IoHome,
  IoChevronForward,
  IoCheckmarkCircle,
} from "react-icons/io5";
import type { IssueWithDetails } from "@/lib/graphql/types";
import { STATUS_CONFIG } from "../types";

// Icon mapping based on category
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  plumbing: IoWater,
  hvac: IoSnow,
  electrical: IoFlash,
  appliance: IoConstruct,
  appliances: IoConstruct,
  home_repair: IoHome,
  garage: IoHome,
  security: IoHome,
  default: IoConstruct,
};

function getCategoryIcon(category: string | null) {
  if (!category) return IoConstruct;
  const key = category.toLowerCase().replace(/\s+/g, "_");
  return CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP.default;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

interface IssuesListViewProps {
  activeIssues: IssueWithDetails[];
  completedIssues: IssueWithDetails[];
}

export function IssuesListView({ activeIssues, completedIssues }: IssuesListViewProps) {
  return (
    <>
      {/* Active Issues */}
      {activeIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Issues ({activeIssues.length})
          </h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            {activeIssues.map((issue, idx) => {
              const Icon = getCategoryIcon(issue.category);
              const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;
              return (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className={`flex items-center gap-4 p-4 hover:bg-[#1f1f1f] transition-colors cursor-pointer ${
                    idx !== activeIssues.length - 1 ? "border-b border-[#2a2a2a]" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{issue.title}</p>
                    <p className="text-xs text-[#666] truncate">
                      {issue.diagnosis || issue.groupName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color} flex-shrink-0`}
                  >
                    {status.label}
                  </span>
                  <span className="text-xs text-[#555] flex-shrink-0 w-20 text-right">
                    {getRelativeTime(issue.updatedAt)}
                  </span>
                  <IoChevronForward className="w-4 h-4 text-[#444] flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Issues */}
      {completedIssues.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#888] mb-4 flex items-center gap-2">
            <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
            Resolved ({completedIssues.length})
          </h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden opacity-80">
            {completedIssues.map((issue, idx) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-[#1f1f1f] hover:opacity-100 transition-all cursor-pointer ${
                  idx !== completedIssues.length - 1 ? "border-b border-[#2a2a2a]" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#ccc] truncate">{issue.title}</p>
                  <p className="text-xs text-[#666]">
                    {issue.resolvedBy === "diy" ? "DIY" : "Professional"} ·{" "}
                    {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
                  </p>
                </div>
                {issue.savedAmount && issue.savedAmount > 0 && (
                  <span className="text-sm font-semibold text-emerald-400 flex-shrink-0">
                    +${issue.savedAmount.toFixed(0)}
                  </span>
                )}
                <span className="text-xs text-[#555] flex-shrink-0 w-24 text-right">
                  {issue.groupName}
                </span>
                <IoChevronForward className="w-4 h-4 text-[#444] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
