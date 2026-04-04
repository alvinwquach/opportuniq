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
    <div className="w-40 flex-shrink-0 h-full flex flex-col border-r border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-900">Issues</span>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900 rounded">
          <IoClose className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-2 border-b border-gray-200">
        <button
          onClick={onNewIssue}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-gray-900 text-[11px] font-medium rounded-lg transition-colors"
        >
          <IoAdd className="w-3.5 h-3.5" />
          New Issue
        </button>
      </div>
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <IoSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-[11px] bg-gray-100 border border-gray-200 rounded-md placeholder:text-gray-400 text-gray-900 focus:outline-none focus:border-blue-500"
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
                isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start gap-1.5">
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isActive ? "bg-blue-50" : "bg-gray-200"}`}>
                  <IssueIcon className={`w-3 h-3 ${isActive ? "text-blue-600" : issue.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-medium truncate ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] text-gray-500">{issue.date}</span>
                    {issue.status === "resolved" && <IoCheckmarkCircle className="w-2.5 h-2.5 text-blue-500" />}
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
