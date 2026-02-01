"use client";

import { IoAdd, IoSearch, IoCheckmarkCircle } from "react-icons/io5";
import type { IssueData } from "./types";

interface IssuesSidebarProps {
  issues: Record<string, IssueData>;
  selectedIssue: string;
  isCreatingNewIssue: boolean;
  searchQuery: string;
  filterStatus: "all" | "active" | "resolved" | "pending";
  onSearchChange: (query: string) => void;
  onFilterChange: (status: "all" | "active" | "resolved" | "pending") => void;
  onSelectIssue: (id: string) => void;
  onCreateNewIssue: () => void;
}

export function IssuesSidebar({
  issues,
  selectedIssue,
  isCreatingNewIssue,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onSelectIssue,
  onCreateNewIssue,
}: IssuesSidebarProps) {
  const filteredIssues = Object.entries(issues).filter(([id, issue]) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "active", "pending", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
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
        {filteredIssues.map(([id, issue]) => {
          const IssueIcon = issue.icon;
          const isActive = selectedIssue === id && !isCreatingNewIssue;
          const iconBg = issue.status === "resolved"
            ? "bg-emerald-500/20"
            : issue.iconColor.includes("blue") ? "bg-blue-500/20"
            : issue.iconColor.includes("cyan") ? "bg-cyan-500/20"
            : issue.iconColor.includes("amber") ? "bg-amber-500/20"
            : issue.iconColor.includes("yellow") ? "bg-yellow-500/20"
            : "bg-emerald-500/20";

          return (
            <button
              key={id}
              onClick={() => onSelectIssue(id)}
              className={`w-full flex items-start gap-3 p-3 border-b border-white/[0.04] transition-colors text-left ${
                isActive ? "bg-emerald-500/10" : "hover:bg-[#1a1a1a]"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <IssueIcon className={`w-4 h-4 ${
                  issue.status === "resolved" ? "text-emerald-400" : issue.iconColor
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-[#ccc]"}`}>
                    {issue.title}
                  </p>
                  {issue.status === "resolved" && (
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[#666] mt-0.5">{issue.date}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    issue.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                    issue.status === "resolved" ? "bg-[#2a2a2a] text-[#888]" :
                    "bg-amber-500/20 text-amber-400"
                  }`}>
                    {issue.status}
                  </span>
                  <span className="text-[10px] text-[#555]">{issue.confidence}% confident</span>
                </div>
              </div>
            </button>
          );
        })}
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
