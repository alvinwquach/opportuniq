"use client";

import Link from "next/link";
import { IoAlertCircle, IoArrowForward } from "react-icons/io5";

interface OpenIssue {
  issue: {
    id: string;
    title: string;
    status: string | null;
  };
  group: {
    name: string;
  };
}

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
          href="/issues"
          className="text-xs text-[#9a9a9a] hover:text-white transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {issues.map(({ issue, group }) => (
          <Link
            key={issue.id}
            href={`/issues/${issue.id}`}
            className="flex items-center gap-4 p-3 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <IoAlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate group-hover:text-[#00D4FF] transition-colors">
                {issue.title}
              </p>
              <p className="text-xs text-[#9a9a9a]">
                {group.name} · {issue.status === "investigating" ? "Analyzing..." : "Open"}
              </p>
            </div>
            <IoArrowForward className="w-4 h-4 text-[#666] group-hover:text-[#00D4FF] transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
