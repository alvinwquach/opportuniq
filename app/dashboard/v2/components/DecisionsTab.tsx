"use client";

import Link from "next/link";
import {
  IoWarning,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoChevronForward,
} from "react-icons/io5";
import type { AdaptedDashboardData } from "../types";

interface DecisionsTabProps {
  data: AdaptedDashboardData;
}

export function DecisionsTab({ data }: DecisionsTabProps) {
  const { pendingDecisions, openIssues } = data;

  return (
    <>
      {/* Awaiting Decisions Card */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoWarning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-medium text-white">
              Awaiting Your Decision
            </h3>
          </div>
          <span className="text-[10px] sm:text-xs text-[#888]">
            {pendingDecisions.length} issue{pendingDecisions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {pendingDecisions.length === 0 ? (
          <div className="py-6 text-center">
            <IoCheckmarkCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400/50" />
            <p className="text-sm text-[#888]">No pending decisions</p>
            <p className="text-xs text-[#666] mt-1">
              All caught up! New decisions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingDecisions.slice(0, 5).map((decision) => (
              <Link
                key={decision.id}
                href={`/dashboard/issues/${decision.id}`}
                className="block p-2 sm:p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-xs font-medium text-white truncate">
                      {decision.issueTitle}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[#888]">
                      {decision.groupName}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                      decision.priority === "high"
                        ? "bg-red-500/20 text-red-400"
                        : decision.priority === "medium"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-[#2a2a2a] text-[#888]"
                    }`}
                  >
                    {decision.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] mt-2 flex-wrap">
                  {decision.diyOption && (
                    <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                      DIY: {decision.diyOption.cost} · {decision.diyOption.time}
                    </span>
                  )}
                  {decision.proOption && (
                    <span className="px-1.5 sm:px-2 py-0.5 bg-[#2a2a2a] text-[#888] rounded">
                      Pro: {decision.proOption.cost}
                    </span>
                  )}
                </div>
                {decision.recommendation && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400">
                    <IoCheckmarkCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {decision.recommendation}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Open Issues Card */}
      {openIssues.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-white">
              Open Issues
            </h3>
            <Link
              href="/dashboard/issues"
              className="text-[10px] sm:text-xs text-emerald-400 cursor-pointer hover:text-emerald-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {openIssues.slice(0, 5).map((issue) => (
              <Link
                key={issue.id}
                href={`/dashboard/issues/${issue.id}`}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-[#252525] transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <IoAlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">
                    {issue.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#888]">
                    {issue.group} ·{" "}
                    {issue.status === "investigating" ? "Analyzing..." : "Open"}
                  </p>
                </div>
                <IoChevronForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#666] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no open issues */}
      {openIssues.length === 0 && pendingDecisions.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 text-center">
          <IoCheckmarkCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
          <h3 className="text-sm font-medium text-white mb-1">All Clear!</h3>
          <p className="text-xs text-[#888]">
            No open issues or pending decisions. Enjoy your peace of mind!
          </p>
        </div>
      )}
    </>
  );
}
