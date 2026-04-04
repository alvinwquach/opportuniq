"use client";

import { useState } from "react";
import type { IssueDetails, TimelineEntry } from "../actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IssueHeader,
  IssueTimeline,
  IssueSummary,
  ResolutionDialog,
} from "./components";

interface IssueDetailClientProps {
  issue: IssueDetails;
  initialTimeline: TimelineEntry[];
}

export function IssueDetailClient({
  issue,
  initialTimeline,
}: IssueDetailClientProps) {
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(issue);

  const handleResolutionComplete = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <IssueHeader
            issue={currentIssue}
            onResolveClick={() => setIsResolutionDialogOpen(true)}
          />
          <IssueSummary issue={currentIssue} />
          <IssueTimeline entries={initialTimeline} />
        </div>
        <div className="hidden lg:block space-y-4">
          <Card className="bg-[#161616] border-[#1f1f1f] py-0">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm font-medium text-white">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-[#666]">Evidence</span>
                <span className="text-xs text-white">{currentIssue.evidenceCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#666]">Hypotheses</span>
                <span className="text-xs text-white">{currentIssue.hypothesisCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#666]">Comments</span>
                <span className="text-xs text-white">{currentIssue.commentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#666]">Scheduled Tasks</span>
                <span className="text-xs text-white">{currentIssue.scheduleCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#161616] border-[#1f1f1f] py-0">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm font-medium text-white">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <p className="text-2xl font-bold text-[#00D4FF]">
                {initialTimeline.length}
              </p>
              <p className="text-xs text-[#666]">timeline events</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <ResolutionDialog
        isOpen={isResolutionDialogOpen}
        onClose={() => setIsResolutionDialogOpen(false)}
        issueId={currentIssue.id}
        onComplete={handleResolutionComplete}
      />
    </div>
  );
}
