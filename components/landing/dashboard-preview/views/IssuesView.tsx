"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { IoAddOutline } from "react-icons/io5";
import {
  issuesHistoryData,
  NewIssueModal,
  StatsCards,
  AnalyticsCharts,
  IssueFilters,
  KanbanView,
  IssueCards,
  IssueList,
  EmptyState,
  type Filters,
} from "./issues";

interface IssuesViewProps {
  onNavigateToIssue?: (issueId: string) => void;
}

export function IssuesView({ onNavigateToIssue }: IssuesViewProps) {
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "priority">("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban">("cards");
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: null,
    priority: null,
    category: null,
    group: null,
  });


  // Filter issues
  let filteredIssues = issuesHistoryData.filter((issue) => {
    if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !issue.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.category && issue.category !== filters.category) return false;
    if (filters.group && issue.group !== filters.group) return false;
    return true;
  });

  // Sort issues
  filteredIssues = [...filteredIssues].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const activeIssues = filteredIssues.filter((i) => i.status !== "completed");
  const completedIssues = filteredIssues.filter((i) => i.status === "completed");

  const allCategories = Array.from(new Set(issuesHistoryData.map((i) => i.category)));
  const allGroups = Array.from(new Set(issuesHistoryData.map((i) => i.group)));

  const hasActiveFilters = Object.values(filters).some((v) => v !== null) || !!searchQuery;

  // Stats
  const totalSavings = completedIssues.reduce((sum, i) => sum + (i.savedAmount || 0), 0);
  const diyCount = completedIssues.filter((i) => i.resolvedBy === "diy").length;
  const proCount = completedIssues.filter((i) => i.resolvedBy === "pro").length;

  const handleIssueClick = (issueId: string) => {
    if (onNavigateToIssue) {
      onNavigateToIssue(issueId);
    }
  };

  return (
    <>
      {typeof window !== "undefined" && showNewIssueModal && createPortal(
        <NewIssueModal onClose={() => setShowNewIssueModal(false)} />,
        document.body
      )}

      {openFilterDropdown && (
        <div className="fixed inset-0 z-[9998]" onClick={() => setOpenFilterDropdown(null)} />
      )}

      <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1f1f1f]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Issue History</h1>
              <p className="text-sm text-[#666] mt-0.5">
                {filteredIssues.length} issues · {activeIssues.length} active · {completedIssues.length} resolved
              </p>
            </div>
            <button
              onClick={() => setShowNewIssueModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors font-medium"
            >
              <IoAddOutline className="w-5 h-5" />
              Report Issue
            </button>
          </div>

          {/* Stats Cards */}
          <StatsCards
            totalSavings={totalSavings}
            diyCount={diyCount}
            proCount={proCount}
            activeCount={activeIssues.length}
          />

          {/* Analytics Charts */}
          <AnalyticsCharts />

          {/* Search and Filters */}
          <IssueFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            openFilterDropdown={openFilterDropdown}
            setOpenFilterDropdown={setOpenFilterDropdown}
            allCategories={allCategories}
            allGroups={allGroups}
            hasActiveFilters={hasActiveFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Kanban View */}
          {viewMode === "kanban" && (
            <KanbanView issues={filteredIssues} onIssueClick={handleIssueClick} />
          )}

          {/* Cards View */}
          {viewMode === "cards" && filteredIssues.length > 0 && (
            <IssueCards
              activeIssues={activeIssues}
              completedIssues={completedIssues}
              onIssueClick={handleIssueClick}
            />
          )}

          {/* List View */}
          {viewMode === "list" && filteredIssues.length > 0 && (
            <IssueList
              activeIssues={activeIssues}
              completedIssues={completedIssues}
              onIssueClick={handleIssueClick}
            />
          )}

          {/* Empty State */}
          {viewMode !== "kanban" && filteredIssues.length === 0 && (
            <EmptyState
              hasFilters={hasActiveFilters}
              onReportIssue={() => setShowNewIssueModal(true)}
            />
          )}
        </div>
      </div>
    </>
  );
}
