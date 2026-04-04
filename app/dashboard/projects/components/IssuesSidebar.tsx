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
    <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-gray-200 space-y-2">
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "active", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-colors ${
                filterStatus === status
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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
            <p className="text-sm text-gray-500">No issues found</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isActive = currentIssueId === issue.id && !isCreatingNewIssue;
            const iconBg = getIconBgColor(issue.icon);
            return (
              <button
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className={`w-full flex items-start gap-3 p-3 border-b border-gray-200 transition-colors text-left ${
                  isActive ? "bg-blue-50" : "hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
                >
                  <IssueIcon
                    iconName={issue.icon}
                    className={`w-4 h-4 ${isActive ? "text-blue-600" : issue.iconColor}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-gray-900" : "text-[#ccc]"
                      }`}
                    >
                      {issue.title}
                    </p>
                    {issue.isResolved && (
                      <IoCheckmarkCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        issue.isResolved
                          ? "bg-gray-200 text-gray-500"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {issue.isResolved ? "resolved" : "active"}
                    </span>
                    {issue.confidence && (
                      <span className="text-[10px] text-gray-400">{issue.confidence}% confident</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* New Issue Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onCreateNewIssue}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isCreatingNewIssue
              ? "bg-blue-500 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          <IoAdd className="w-4 h-4" />
          Report New Issue
        </button>
      </div>
    </div>
  );
}
