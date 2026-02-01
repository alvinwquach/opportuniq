"use client";

import { useState } from "react";
import { IssuesSidebar, ChatArea, ResourcePanel, issuesData } from "./diagnose";

export function DiagnoseView() {
  const [selectedIssue, setSelectedIssue] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "resolved" | "pending">("all");
  const [isCreatingNewIssue, setIsCreatingNewIssue] = useState(false);

  const currentIssue = isCreatingNewIssue ? null : issuesData[selectedIssue];

  const handleSelectIssue = (id: string) => {
    setSelectedIssue(id);
    setIsCreatingNewIssue(false);
  };

  const handleCreateNewIssue = () => {
    setIsCreatingNewIssue(true);
  };

  return (
    <div className="h-[calc(100vh-48px)] bg-[#0f0f0f] flex overflow-hidden">
      {/* Left Column - Issue History & Search */}
      <IssuesSidebar
        issues={issuesData}
        selectedIssue={selectedIssue}
        isCreatingNewIssue={isCreatingNewIssue}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
        onSelectIssue={handleSelectIssue}
        onCreateNewIssue={handleCreateNewIssue}
      />

      {/* Center Column - Chat / Conversation */}
      <ChatArea
        issue={currentIssue}
        isCreatingNewIssue={isCreatingNewIssue}
      />

      {/* Right Column - Resources (DIY / Hire Pro) */}
      <ResourcePanel
        issue={currentIssue}
        isCreatingNewIssue={isCreatingNewIssue}
      />
    </div>
  );
}
