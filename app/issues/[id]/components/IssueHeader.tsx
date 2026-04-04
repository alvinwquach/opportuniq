"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  IoCheckmarkCircle,
  IoTime,
  IoAlertCircle,
  IoClose,
  IoRefresh,
} from "react-icons/io5";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { IssueDetails } from "../../actions";
import { reopenIssue } from "../../actions";
import { trackIssueReopened } from "@/lib/analytics";

interface IssueHeaderProps {
  issue: IssueDetails;
  onResolveClick: () => void;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "open":
      return {
        label: "Open",
        color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        icon: IoAlertCircle,
      };
    case "investigating":
      return {
        label: "Investigating",
        color: "bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20",
        icon: IoTime,
      };
    case "options_generated":
      return {
        label: "Options Ready",
        color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        icon: IoTime,
      };
    case "decided":
      return {
        label: "Decided",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: IoCheckmarkCircle,
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: IoTime,
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: IoCheckmarkCircle,
      };
    case "deferred":
      return {
        label: "Deferred",
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        icon: IoClose,
      };
    default:
      return {
        label: status,
        color: "bg-gray-50 text-gray-500 border-gray-200",
        icon: IoAlertCircle,
      };
  }
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case "urgent":
      return { label: "Urgent", color: "text-red-600" };
    case "high":
      return { label: "High", color: "text-orange-600" };
    case "medium":
      return { label: "Medium", color: "text-amber-600" };
    case "low":
      return { label: "Low", color: "text-gray-400" };
    default:
      return { label: priority, color: "text-gray-400" };
  }
}

function getResolutionLabel(type: string) {
  switch (type) {
    case "diy":
      return "Fixed DIY";
    case "hired":
      return "Hired Pro";
    case "replaced":
      return "Replaced";
    case "abandoned":
      return "Abandoned";
    case "deferred":
      return "Deferred";
    case "monitoring":
      return "Monitoring";
    default:
      return type;
  }
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function IssueHeader({ issue, onResolveClick }: IssueHeaderProps) {
  const [isReopening, setIsReopening] = useState(false);
  const statusConfig = getStatusConfig(issue.status);
  const priorityConfig = getPriorityConfig(issue.priority);
  const StatusIcon = statusConfig.icon;

  const isResolved = issue.status === "completed" || issue.status === "deferred";

  const handleReopen = async () => {
    setIsReopening(true);
    try {
      const result = await reopenIssue(issue.id);
      if (result.success) {
        trackIssueReopened({ issueId: issue.id });
        window.location.reload();
      }
    } catch (error) {
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200 py-0 gap-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`rounded-lg py-1 ${statusConfig.color}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </Badge>
          <Badge
            variant="outline"
            className={`rounded-lg py-1 bg-transparent border-transparent ${priorityConfig.color}`}
          >
            {priorityConfig.label} Priority
          </Badge>
          {issue.resolutionType && (
            <Badge
              variant="outline"
              className="rounded-lg py-1 bg-green-500/10 text-green-500 border-green-500/20"
            >
              {getResolutionLabel(issue.resolutionType)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isResolved ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReopen}
              disabled={isReopening}
              className="h-auto px-3 py-1.5 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-xs font-medium"
            >
              <IoRefresh className={`w-3.5 h-3.5 mr-1.5 ${isReopening ? "animate-spin" : ""}`} />
              Reopen
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResolveClick}
              className="h-auto px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500 text-xs font-medium"
            >
              <IoCheckmarkCircle className="w-3.5 h-3.5 mr-1.5" />
              Resolve Issue
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-4 space-y-4">
        {issue.description && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-1.5">Description</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {issue.description}
            </p>
          </div>
        )}
        {issue.resolutionNotes && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-1.5">Resolution Notes</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {issue.resolutionNotes}
            </p>
          </div>
        )}
        <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {issue.createdBy.avatarUrl ? (
              <Image
                src={issue.createdBy.avatarUrl}
                alt={issue.createdBy.name || "Creator"}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-medium text-gray-500">
                {getInitials(issue.createdBy.name)}
              </div>
            )}
            <span className="text-xs text-gray-400">
              Created by {issue.createdBy.name || "Unknown"} on{" "}
              {format(new Date(issue.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          {issue.resolvedBy && issue.resolvedAt && (
            <div className="flex items-center gap-2">
              {issue.resolvedBy.avatarUrl ? (
                <Image
                  src={issue.resolvedBy.avatarUrl}
                  alt={issue.resolvedBy.name || "Resolver"}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-medium text-gray-500">
                  {getInitials(issue.resolvedBy.name)}
                </div>
              )}
              <span className="text-xs text-gray-400">
                Resolved by {issue.resolvedBy.name || "Unknown"} on{" "}
                {format(new Date(issue.resolvedAt), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
