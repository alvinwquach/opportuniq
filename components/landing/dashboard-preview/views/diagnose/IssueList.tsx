"use client";

import { IoAdd, IoSearch, IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { IssueData } from "./types";

interface IssueListProps {
  issues: Record<string, IssueData>;
  selectedIssue: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectIssue: (id: string) => void;
  onNewIssue: () => void;
  onClose: () => void;
}

export function IssueList({
  issues,
  selectedIssue,
  searchQuery,
  onSearchChange,
  onSelectIssue,
  onNewIssue,
  onClose,
}: IssueListProps) {
  const filteredIssues = Object.entries(issues).filter(
    ([_, issue]) =>
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-40 flex-shrink-0 h-full flex flex-col border-r border-white/[0.06] bg-[#0d0d0d]">
      <div className="flex items-center justify-between p-2 border-b border-white/[0.06]">
        <span className="text-xs font-semibold text-white">Issues</span>
        <button onClick={onClose} className="p-1 text-white/40 hover:text-white rounded">
          <IoClose className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-2 border-b border-white/[0.06]">
        <button
          onClick={onNewIssue}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium rounded-lg transition-colors"
        >
          <IoAdd className="w-3.5 h-3.5" />
          New Issue
        </button>
      </div>
      <div className="p-2 border-b border-white/[0.06]">
        <div className="relative">
          <IoSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-[11px] bg-[#171717] border border-white/[0.06] rounded-md placeholder:text-white/30 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        {filteredIssues.map(([id, issue]) => {
          const IssueIcon = issue.icon;
          const isActive = selectedIssue === id;
          return (
            <button
              key={id}
              onClick={() => onSelectIssue(id)}
              className={`w-full text-left p-2 rounded-lg transition-colors mb-1 ${
                isActive ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start gap-1.5">
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isActive ? "bg-emerald-500/20" : "bg-white/[0.06]"}`}>
                  <IssueIcon className={`w-3 h-3 ${isActive ? "text-emerald-400" : issue.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-medium truncate ${isActive ? "text-white" : "text-white/70"}`}>
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] text-white/40">{issue.date}</span>
                    {issue.status === "resolved" && <IoCheckmarkCircle className="w-2.5 h-2.5 text-emerald-500" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
