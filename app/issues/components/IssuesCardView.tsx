"use client";

import { IssueCard } from "./IssueCard";
import type { IssueWithDetails } from "@/lib/graphql/types";
import { IoCheckmarkCircle } from "react-icons/io5";

interface IssuesCardViewProps {
  activeIssues: IssueWithDetails[];
  completedIssues: IssueWithDetails[];
}

export function IssuesCardView({ activeIssues, completedIssues }: IssuesCardViewProps) {
  return (
    <>
      {/* Active Issues */}
      {activeIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Issues ({activeIssues.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="active" />
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="completed" />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
