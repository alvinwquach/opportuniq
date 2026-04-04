"use client";

import { IoAdd, IoSearch, IoCheckmarkCircle } from "react-icons/io5";
import type { IssueData } from "./types";
import { useDarkMode } from "../../DarkModeContext";

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
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-200";
  const labelCls = dark ? "text-gray-600" : "text-gray-500";

  const filteredIssues = Object.entries(issues).filter(([, issue]) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`w-72 h-full flex-shrink-0 border-r flex flex-col ${b} ${dark ? "bg-[#141414]" : "bg-gray-50"}`}>
      {/* Search & Filter Header */}
      <div className={`p-3 border-b space-y-2 ${b}`}>
        <div className="relative">
          <IoSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${labelCls}`} />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 border ${
              dark
                ? "bg-white/[0.06] border-white/10 text-gray-200"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "active", "pending", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-colors ${
                filterStatus === status
                  ? "bg-blue-100 text-blue-600"
                  : dark ? "text-gray-600 hover:text-gray-400 hover:bg-white/[0.06]" : "text-gray-500 hover:text-gray-900 hover:bg-white"
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
            ? "bg-blue-50"
            : issue.iconColor.includes("blue") ? "bg-blue-50"
            : issue.iconColor.includes("cyan") ? "bg-cyan-50"
            : issue.iconColor.includes("amber") ? "bg-amber-50"
            : issue.iconColor.includes("yellow") ? "bg-yellow-50"
            : "bg-blue-50";

          return (
            <button
              key={id}
              onClick={() => onSelectIssue(id)}
              className={`w-full flex items-start gap-3 p-3 border-b transition-colors text-left ${b} ${
                isActive
                  ? dark ? "bg-blue-600/10" : "bg-blue-50"
                  : dark ? "hover:bg-white/[0.04]" : "hover:bg-white"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <IssueIcon className={`w-4 h-4 ${issue.status === "resolved" ? "text-blue-600" : issue.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${isActive ? (dark ? "text-gray-100" : "text-gray-900") : (dark ? "text-gray-300" : "text-gray-700")}`}>
                    {issue.title}
                  </p>
                  {issue.status === "resolved" && (
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${labelCls}`}>{issue.date}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    issue.status === "active" ? "bg-blue-100 text-blue-600" :
                    issue.status === "resolved" ? (dark ? "bg-white/10 text-gray-500" : "bg-gray-100 text-gray-500") :
                    "bg-amber-100 text-amber-600"
                  }`}>
                    {issue.status}
                  </span>
                  <span className={`text-[10px] ${labelCls}`}>{issue.confidence}% confident</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* New Issue Button */}
      <div className={`p-3 border-t ${b}`}>
        <button
          onClick={onCreateNewIssue}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <IoAdd className="w-4 h-4" />
          Report New Issue
        </button>
      </div>
    </div>
  );
}
