"use client";

import {
  IoCheckmarkCircle,
  IoSparkles,
  IoConstruct,
} from "react-icons/io5";
import type { Issue } from "./types";
import { priorityConfig } from "./config";
import { getInitials } from "./utils";

interface KanbanColumnProps {
  title: string;
  dotColor: string;
  issues: Issue[];
  onIssueClick: (id: string) => void;
  hoverColor: string;
  showConfidence?: boolean;
  showDifficulty?: boolean;
  isCompleted?: boolean;
}

function KanbanColumn({
  title,
  dotColor,
  issues,
  onIssueClick,
  hoverColor,
  showConfidence,
  showDifficulty,
  isCompleted,
}: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </div>
      <div className={`space-y-3 ${isCompleted ? "max-h-[calc(100vh-320px)] overflow-y-auto pr-2" : ""}`}>
        {issues.map((issue) => {
          const Icon = issue.icon;
          return (
            <div
              key={issue.id}
              onClick={() => onIssueClick(issue.id)}
              className={`bg-white border border-gray-200 rounded-xl p-4 ${hoverColor} transition-all cursor-pointer group ${isCompleted ? "opacity-75 hover:opacity-100" : ""}`}
            >
              <div className="flex items-start gap-3 mb-3">
                {isCompleted ? (
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-lg ${issue.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${issue.iconColor}`} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? "text-gray-700 group-hover:text-gray-900" : "text-gray-900 group-hover:text-blue-600"} transition-colors line-clamp-2`}>{issue.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{issue.group}</p>
                </div>
              </div>

              {showConfidence && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-amber-50 rounded-lg">
                  <IoSparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs text-amber-600">{issue.confidence}% confident</span>
                </div>
              )}

              {showDifficulty && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                  <IoConstruct className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-blue-600">{issue.difficulty}</span>
                </div>
              )}

              {!isCompleted && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{issue.diagnosis}</p>
              )}

              {isCompleted ? (
                <>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg mb-3">
                    <span className="text-xs text-gray-500">
                      {issue.resolvedBy === "diy" ? "DIY" : issue.proUsed || "Pro"}
                    </span>
                    {issue.savedAmount && issue.savedAmount > 0 && (
                      <span className="text-sm font-semibold text-blue-600">+${issue.savedAmount}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{issue.resolvedAt}</span>
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-medium text-gray-500">{getInitials(issue.assignee.name)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  {showDifficulty && issue.diyCost > 0 ? (
                    <span className="text-xs text-blue-600 font-medium">
                      Save ${(issue.proCost - issue.diyCost).toFixed(0)}
                    </span>
                  ) : showDifficulty ? (
                    <span className="text-xs text-gray-500">${issue.proCost} est.</span>
                  ) : (
                    <span className={`text-xs ${priorityConfig[issue.priority].color}`}>
                      {priorityConfig[issue.priority].label} priority
                    </span>
                  )}
                  <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-medium text-gray-500">{getInitials(issue.assignee.name)}</span>
                </div>
              )}
            </div>
          );
        })}
        {issues.length === 0 && (
          <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
            <p className="text-xs text-gray-600">No {title.toLowerCase()} issues</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  issues: Issue[];
  onIssueClick: (id: string) => void;
}

export function KanbanView({ issues, onIssueClick }: KanbanViewProps) {
  const openIssues = issues.filter(i => i.status === "open");
  const investigatingIssues = issues.filter(i => i.status === "investigating");
  const inProgressIssues = issues.filter(i => i.status === "in_progress");
  const completedIssues = issues.filter(i => i.status === "completed");

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <KanbanColumn
        title="Open"
        dotColor="bg-blue-500"
        issues={openIssues}
        onIssueClick={onIssueClick}
        hoverColor="hover:border-blue-500/30"
      />
      <KanbanColumn
        title="Investigating"
        dotColor="bg-amber-500"
        issues={investigatingIssues}
        onIssueClick={onIssueClick}
        hoverColor="hover:border-amber-500/30"
        showConfidence
      />
      <KanbanColumn
        title="In Progress"
        dotColor="bg-blue-500"
        issues={inProgressIssues}
        onIssueClick={onIssueClick}
        hoverColor="hover:border-blue-500/30"
        showDifficulty
      />
      <KanbanColumn
        title="Completed"
        dotColor="bg-blue-500"
        issues={completedIssues}
        onIssueClick={onIssueClick}
        hoverColor="hover:border-blue-500/30"
        isCompleted
      />
    </div>
  );
}
