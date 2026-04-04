"use client";

import {
  IoArrowForward,
  IoSparkles,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoOpenOutline,
} from "react-icons/io5";
import type { Issue } from "./types";
import { statusConfig, priorityConfig } from "./config";
import { getInitials } from "./utils";

interface IssueCardsProps {
  activeIssues: Issue[];
  completedIssues: Issue[];
  onIssueClick: (id: string) => void;
}

export function IssueCards({ activeIssues, completedIssues, onIssueClick }: IssueCardsProps) {
  return (
    <>
      {/* Active Issues */}
      {activeIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Active Issues ({activeIssues.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeIssues.map((issue) => {
              const Icon = issue.icon;
              const status = statusConfig[issue.status];
              return (
                <div
                  key={issue.id}
                  onClick={() => onIssueClick(issue.id)}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500/30 hover:bg-gray-50 transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${issue.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${issue.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{issue.title}</p>
                        <p className="text-xs text-gray-500">{issue.group} · {issue.category}</p>
                      </div>
                    </div>
                    <IoArrowForward className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  {/* Diagnosis */}
                  <div className="mb-3 p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <IoSparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">AI Diagnosis</span>
                      <span className="text-xs text-gray-600">· {issue.confidence}%</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{issue.diagnosis}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color}`}>{status.label}</span>
                      <span className={`text-xs ${priorityConfig[issue.priority].color}`}>
                        {priorityConfig[issue.priority].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.diyCost > 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                          Save ${(issue.proCost - issue.diyCost).toFixed(0)}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">{issue.updatedAt}</span>
                    </div>
                  </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedIssues.map((issue) => {
              return (
                <div
                  key={issue.id}
                  onClick={() => onIssueClick(issue.id)}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group opacity-80 hover:opacity-100"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <IoCheckmarkCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{issue.title}</p>
                        <p className="text-xs text-gray-500">{issue.group} · {issue.category}</p>
                      </div>
                    </div>
                    <IoOpenOutline className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  {/* Resolution Info */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Resolved by</p>
                      <p className="text-sm font-medium text-gray-900">
                        {issue.resolvedBy === "diy" ? "DIY" : issue.proUsed || "Professional"}
                      </p>
                    </div>
                    {issue.savedAmount && issue.savedAmount > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Saved</p>
                        <p className="text-lg font-bold text-blue-600">${issue.savedAmount}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <IoCalendarOutline className="w-3.5 h-3.5" />
                      Resolved {issue.resolvedAt}
                    </div>
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-medium text-gray-500">{getInitials(issue.assignee.name)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
