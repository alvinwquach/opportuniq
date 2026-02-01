"use client";

import { useState, useMemo } from "react";
import { IoSearch, IoAdd, IoCheckmarkCircle } from "react-icons/io5";
import { IssueIcon, getIconBgColor } from "./IssueIcon";
import type { DiagnoseIssue } from "../types";

interface IssuesSidebarProps {
  issues: DiagnoseIssue[];
  currentIssueId: string | null;
  isCreatingNewIssue: boolean;
  onSelectIssue: (issueId: string) => void;
  onCreateNewIssue: () => void;
}

export function IssuesSidebar({
  issues,
  currentIssueId,
  isCreatingNewIssue,
  onSelectIssue,
  onCreateNewIssue,
}: IssuesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "resolved">("all");

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        !searchQuery.trim() ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !issue.isResolved) ||
        (filterStatus === "resolved" && issue.isResolved);
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, filterStatus]);

  return (
    <div className="w-72 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0f0f0f]">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-white/[0.06] space-y-2">
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "active", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-colors ${
                filterStatus === status
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-[#666] hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-[#666]">No issues found</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isActive = currentIssueId === issue.id && !isCreatingNewIssue;
            const iconBg = getIconBgColor(issue.icon);
            return (
              <button
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className={`w-full flex items-start gap-3 p-3 border-b border-[#1a1a1a] transition-colors text-left ${
                  isActive ? "bg-emerald-500/10" : "hover:bg-[#1a1a1a]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
                >
                  <IssueIcon
                    iconName={issue.icon}
                    className={`w-4 h-4 ${isActive ? "text-emerald-400" : issue.iconColor}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-white" : "text-[#ccc]"
                      }`}
                    >
                      {issue.title}
                    </p>
                    {issue.isResolved && (
                      <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#666] mt-0.5">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        issue.isResolved
                          ? "bg-[#2a2a2a] text-[#888]"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {issue.isResolved ? "resolved" : "active"}
                    </span>
                    {issue.confidence && (
                      <span className="text-[10px] text-[#555]">{issue.confidence}% confident</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* New Issue Button */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={onCreateNewIssue}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isCreatingNewIssue
              ? "bg-emerald-500 text-white"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          <IoAdd className="w-4 h-4" />
          Report New Issue
        </button>
      </div>
    </div>
  );
}
