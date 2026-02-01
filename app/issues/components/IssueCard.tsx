"use client";

import Link from "next/link";
import {
  IoWater,
  IoSnow,
  IoFlash,
  IoConstruct,
  IoHome,
  IoSparkles,
  IoArrowForward,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoOpenOutline,
} from "react-icons/io5";
import type { IssueWithDetails } from "@/lib/graphql/types";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../types";

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

interface IssueCardProps {
  issue: IssueWithDetails;
  variant?: "active" | "completed";
}

export function IssueCard({ issue, variant = "active" }: IssueCardProps) {
  const Icon = getCategoryIcon(issue.category);
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;
  const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.medium;

  const isCompleted = variant === "completed" || issue.status === "completed";
  const potentialSavings =
    issue.diyCost !== null && issue.proCost !== null
      ? issue.proCost - issue.diyCost
      : null;

  if (isCompleted) {
    return (
      <Link
        href={`/issues/${issue.id}`}
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group opacity-80 hover:opacity-100 block"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors">
                {issue.title}
              </p>
              <p className="text-xs text-[#666]">
                {issue.groupName} · {issue.category || "General"}
              </p>
            </div>
          </div>
          <IoOpenOutline className="w-4 h-4 text-[#444] group-hover:text-emerald-400 transition-colors" />
        </div>

        {/* Resolution Info */}
        <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg">
          <div>
            <p className="text-xs text-[#666] mb-0.5">Resolved by</p>
            <p className="text-sm font-medium text-white">
              {issue.resolvedBy === "diy" ? "DIY" : "Professional"}
            </p>
          </div>
          {issue.savedAmount && issue.savedAmount > 0 && (
            <div className="text-right">
              <p className="text-xs text-[#666] mb-0.5">Saved</p>
              <p className="text-lg font-bold text-emerald-400">
                ${issue.savedAmount.toFixed(0)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-2 text-xs text-[#555]">
            <IoCalendarOutline className="w-3.5 h-3.5" />
            Resolved {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/issues/${issue.id}`}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 hover:bg-[#1f1f1f] transition-all cursor-pointer group block"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
              {issue.title}
            </p>
            <p className="text-xs text-[#666]">
              {issue.groupName} · {issue.category || "General"}
            </p>
          </div>
        </div>
        <IoArrowForward className="w-4 h-4 text-[#444] group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* Diagnosis - with special amber styling for investigating status */}
      {issue.diagnosis && (
        <div className={`mb-3 p-3 rounded-lg ${
          issue.status === "investigating" ? "bg-amber-500/10" : "bg-[#0f0f0f]"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <IoSparkles className={`w-3.5 h-3.5 ${
              issue.status === "investigating" ? "text-amber-400" : "text-emerald-400"
            }`} />
            <span className={`text-xs font-medium ${
              issue.status === "investigating" ? "text-amber-400" : "text-emerald-400"
            }`}>
              {issue.status === "investigating" ? "Analyzing" : "AI Diagnosis"}
            </span>
            {issue.confidence && (
              <span className={`text-xs ${
                issue.status === "investigating" ? "text-amber-400/70" : "text-[#555]"
              }`}>
                · {issue.confidence}% confident
              </span>
            )}
          </div>
          <p className="text-xs text-[#999] line-clamp-2">{issue.diagnosis}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color}`}>
            {status.label}
          </span>
          <span className={`text-xs ${priority.color}`}>{priority.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {potentialSavings !== null && potentialSavings > 0 && (
            <span className="text-xs text-emerald-400 font-medium">
              Save ${potentialSavings.toFixed(0)}
            </span>
          )}
          <span className="text-xs text-[#555]">{getRelativeTime(issue.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
