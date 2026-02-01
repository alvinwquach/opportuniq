"use client";

import Link from "next/link";
import {
  IoWater,
  IoSnow,
  IoFlash,
  IoConstruct,
  IoHome,
  IoSparkles,
  IoCheckmarkCircle,
} from "react-icons/io5";
import type { IssueWithDetails } from "@/lib/graphql/types";
import { PRIORITY_CONFIG } from "../types";

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
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

interface KanbanColumnProps {
  title: string;
  count: number;
  dotColor: string;
  hoverColor: string;
  issues: IssueWithDetails[];
}

function KanbanColumn({ title, count, dotColor, hoverColor, issues }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {issues.map((issue) => {
          const Icon = getCategoryIcon(issue.category);
          const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.medium;
          const isCompleted = issue.status === "completed";
          const isInvestigating = issue.status === "investigating";
          const isInProgress = issue.status === "in_progress";

          return (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 ${hoverColor} transition-all cursor-pointer group block ${
                isCompleted ? "opacity-75 hover:opacity-100" : ""
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg ${
                    isCompleted ? "bg-emerald-500/20" : "bg-emerald-500/20"
                  } flex items-center justify-center flex-shrink-0`}
                >
                  {isCompleted ? (
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? "text-[#ccc]" : "text-white"
                    } group-hover:text-emerald-400 transition-colors line-clamp-2`}
                  >
                    {issue.title}
                  </p>
                  <p className="text-xs text-[#666] mt-0.5">{issue.groupName}</p>
                </div>
              </div>

              {/* Investigating: Show confidence */}
              {isInvestigating && issue.confidence && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-amber-500/10 rounded-lg">
                  <IoSparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-400">{issue.confidence}% confident</span>
                </div>
              )}

              {/* In Progress: Show difficulty/cost savings */}
              {isInProgress && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-500/10 rounded-lg">
                  <IoConstruct className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400">In Progress</span>
                </div>
              )}

              {/* Completed: Show resolution info */}
              {isCompleted && (
                <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg mb-3">
                  <span className="text-xs text-[#888]">
                    {issue.resolvedBy === "diy" ? "DIY" : "Pro"}
                  </span>
                  {issue.savedAmount && issue.savedAmount > 0 && (
                    <span className="text-sm font-semibold text-emerald-400">
                      +${issue.savedAmount.toFixed(0)}
                    </span>
                  )}
                </div>
              )}

              {issue.diagnosis && !isCompleted && (
                <p className="text-xs text-[#888] line-clamp-2 mb-3">{issue.diagnosis}</p>
              )}

              <div className="flex items-center justify-between">
                {isCompleted ? (
                  <span className="text-xs text-[#555]">
                    {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
                  </span>
                ) : (
                  <span className={`text-xs ${priority.color}`}>
                    {priority.label} priority
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        {issues.length === 0 && (
          <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
            <p className="text-xs text-[#555]">No {title.toLowerCase()} issues</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface IssuesKanbanViewProps {
  issues: IssueWithDetails[];
}

export function IssuesKanbanView({ issues }: IssuesKanbanViewProps) {
  const openIssues = issues.filter((i) => i.status === "open");
  const investigatingIssues = issues.filter((i) => i.status === "investigating");
  const inProgressIssues = issues.filter((i) => i.status === "in_progress");
  const completedIssues = issues.filter((i) => i.status === "completed");

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <KanbanColumn
        title="Open"
        count={openIssues.length}
        dotColor="bg-emerald-500"
        hoverColor="hover:border-emerald-500/30"
        issues={openIssues}
      />
      <KanbanColumn
        title="Investigating"
        count={investigatingIssues.length}
        dotColor="bg-amber-500"
        hoverColor="hover:border-amber-500/30"
        issues={investigatingIssues}
      />
      <KanbanColumn
        title="In Progress"
        count={inProgressIssues.length}
        dotColor="bg-emerald-500"
        hoverColor="hover:border-emerald-500/30"
        issues={inProgressIssues}
      />
      <div className="flex-shrink-0 w-80">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold text-white">Completed</h3>
          <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
            {completedIssues.length}
          </span>
        </div>
        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
          {completedIssues.map((issue) => {
            const Icon = getCategoryIcon(issue.category);

            return (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group opacity-75 hover:opacity-100 block"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors line-clamp-2">
                      {issue.title}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5">{issue.groupName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg mb-3">
                  <span className="text-xs text-[#888]">
                    {issue.resolvedBy === "diy" ? "DIY" : "Pro"}
                  </span>
                  {issue.savedAmount && issue.savedAmount > 0 && (
                    <span className="text-sm font-semibold text-emerald-400">
                      +${issue.savedAmount.toFixed(0)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#555]">
                    {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
                  </span>
                </div>
              </Link>
            );
          })}
          {completedIssues.length === 0 && (
            <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
              <p className="text-xs text-[#555]">No completed issues</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
