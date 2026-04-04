"use client";

import {
  IoChevronForward,
  IoCheckmarkCircle,
} from "react-icons/io5";
import type { Issue } from "./types";
import { statusConfig } from "./config";

interface IssueListProps {
  activeIssues: Issue[];
  completedIssues: Issue[];
  onIssueClick: (id: string) => void;
}

export function IssueList({ activeIssues, completedIssues, onIssueClick }: IssueListProps) {
  return (
    <>
      {/* Active Issues */}
      {activeIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Active Issues ({activeIssues.length})
          </h2>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {activeIssues.map((issue, idx) => {
              const Icon = issue.icon;
              const status = statusConfig[issue.status];
              return (
                <div
                  key={issue.id}
                  onClick={() => onIssueClick(issue.id)}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-100 transition-colors cursor-pointer ${
                    idx !== activeIssues.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${issue.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${issue.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                    <p className="text-xs text-gray-500 truncate">{issue.diagnosis}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color} flex-shrink-0`}>{status.label}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 w-20 text-right">{issue.updatedAt}</span>
                  <IoChevronForward className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Issues */}
      {completedIssues.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
            Resolved ({completedIssues.length})
          </h2>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden opacity-80">
            {completedIssues.map((issue, idx) => {
              return (
                <div
                  key={issue.id}
                  onClick={() => onIssueClick(issue.id)}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-100 hover:opacity-100 transition-all cursor-pointer ${
                    idx !== completedIssues.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <IoCheckmarkCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{issue.title}</p>
                    <p className="text-xs text-gray-500">
                      {issue.resolvedBy === "diy" ? "DIY" : issue.proUsed || "Professional"} · {issue.resolvedAt}
                    </p>
                  </div>
                  {issue.savedAmount && issue.savedAmount > 0 && (
                    <span className="text-sm font-semibold text-blue-600 flex-shrink-0">+${issue.savedAmount}</span>
                  )}
                  <span className="text-xs text-gray-400 flex-shrink-0 w-24 text-right">{issue.group}</span>
                  <IoChevronForward className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
