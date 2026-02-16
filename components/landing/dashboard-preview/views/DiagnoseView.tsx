"use client";

import { useState, useCallback } from "react";
import { IssuesSidebar, ChatArea, ResourcePanel, issuesData } from "./diagnose";
import { DemoFlowProvider } from "./diagnose/DemoFlowContext";

export function DiagnoseView() {
  const [selectedIssueId, setSelectedIssueId] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "resolved" | "pending">("all");
  const [isCreatingNewIssue, setIsCreatingNewIssue] = useState(false);

  const currentIssue = isCreatingNewIssue ? null : issuesData[selectedIssueId];

  const handleSelectIssue = useCallback((id: string) => {
    setSelectedIssueId(id);
    setIsCreatingNewIssue(false);
  }, []);

  const handleCreateNewIssue = useCallback(() => {
    setIsCreatingNewIssue(true);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleFilterChange = useCallback((value: "all" | "active" | "resolved" | "pending") => {
    setFilterStatus(value);
  }, []);

  return (
    <DemoFlowProvider issue={currentIssue}>
      <div className="h-full bg-[#0f0f0f] flex overflow-hidden">
        {/* Left Column - Issue History & Search (hidden below lg) */}
        <div className="hidden lg:block">
          <IssuesSidebar
            issues={issuesData}
            selectedIssue={selectedIssueId}
            isCreatingNewIssue={isCreatingNewIssue}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onSelectIssue={handleSelectIssue}
            onCreateNewIssue={handleCreateNewIssue}
          />
        </div>

        {/* Center Column - Chat / Conversation (hidden below lg) */}
        <div className="hidden lg:flex flex-1">
          <ChatArea
            issue={currentIssue}
            isCreatingNewIssue={isCreatingNewIssue}
          />
        </div>

        {/* Right Column - Resources (DIY / Hire Pro) - Full width below lg */}
        <ResourcePanel
          issue={currentIssue}
          isCreatingNewIssue={isCreatingNewIssue}
        />
      </div>
    </DemoFlowProvider>
  );
}
