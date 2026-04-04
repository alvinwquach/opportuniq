"use client";

import Link from "next/link";
import { IoAlertCircle, IoArrowForward } from "react-icons/io5";
import type { OpenIssue } from "@/app/dashboard/types";

interface OpenIssuesSectionProps {
  issues: OpenIssue[];
}

export function OpenIssuesSection({ issues }: OpenIssuesSectionProps) {
  if (issues.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Open Issues</h2>
        <Link
          href="/dashboard/projects"
          className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {issues.map(({ issue, group }) => (
          <Link
            key={issue.id}
            href={`/dashboard/projects/${issue.id}`}
            className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-200 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <IoAlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {issue.title}
              </p>
              <p className="text-xs text-gray-400">
                {group.name} · {issue.status === "investigating" ? "Analyzing..." : "Open"}
              </p>
            </div>
            <IoArrowForward className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
