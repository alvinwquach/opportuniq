"use client";

import { useState, useMemo } from "react";
import { IoAddOutline } from "react-icons/io5";
import { useIssuesPageData } from "@/lib/graphql/hooks";
import type { IssueFilters, ViewMode, SortBy, SortOrder } from "./types";
import { PRIORITY_ORDER } from "./types";
import {
  IssuesStatsCards,
  IssuesCharts,
  IssuesFilters,
  IssuesCardView,
  IssuesListView,
  IssuesKanbanView,
  IssuesSkeleton,
  IssuesEmptyState,
} from "./components";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function IssuesClient() {
  const router = useRouter();
  const { data, isLoading, error } = useIssuesPageData();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IssueFilters>({
    status: null,
    priority: null,
    category: null,
    group: null,
  });
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter and sort issues
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filteredIssues = useMemo(() => {
    if (!data?.issues) return [];

    let result = [...data.issues];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.diagnosis?.toLowerCase().includes(query) ||
          issue.groupName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((issue) => issue.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter((issue) => issue.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(
        (issue) =>
          issue.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Apply group filter
    if (filters.group) {
      result = result.filter((issue) => issue.groupId === filters.group);
    }

    // Sort issues
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "priority") {
        const priorityA = PRIORITY_ORDER[a.priority] || 0;
        const priorityB = PRIORITY_ORDER[b.priority] || 0;
        comparison = priorityB - priorityA; // Higher priority first by default
      } else if (sortBy === "created") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateB - dateA; // Newest first by default
      } else {
        // Default: sort by updated
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        comparison = dateB - dateA; // Newest first by default
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    return result;
  }, [data?.issues, searchQuery, filters, sortBy, sortOrder]);

  // Separate active and completed issues
  const activeIssues = useMemo(
    () => filteredIssues.filter((i) => !["completed", "deferred"].includes(i.status)),
    [filteredIssues]
  );

  const completedIssues = useMemo(
    () => filteredIssues.filter((i) => i.status === "completed"),
    [filteredIssues]
  );

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== null) || searchQuery.length > 0;

  const clearFilters = () => {
    setFilters({ status: null, priority: null, category: null, group: null });
    setSearchQuery("");
  };

  const handleReportIssue = () => {
    router.push("/dashboard/diagnose");
  };

  if (isLoading) {
    return <IssuesSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading issues</p>
          <p className="text-sm text-[#666]">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <IssuesSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Issue History</h1>
            <p className="text-sm text-[#666] mt-0.5">
              {filteredIssues.length} issues · {activeIssues.length} active ·{" "}
              {completedIssues.length} resolved
            </p>
          </div>
          <Link
            href="/dashboard/diagnose"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors font-medium"
          >
            <IoAddOutline className="w-5 h-5" />
            Report Issue
          </Link>
        </div>

        {/* Stats Cards */}
        <IssuesStatsCards
          totalSaved={data.totalSaved}
          diyCount={data.diyCount}
          proCount={data.proCount}
          activeIssueCount={data.activeIssueCount}
        />

        {/* Charts */}
        {(data.savingsOverTime.length > 0 || data.categoryDistribution.length > 0) && (
          <IssuesCharts
            savingsOverTime={data.savingsOverTime}
            categoryDistribution={data.categoryDistribution}
            resolutionBreakdown={data.resolutionBreakdown}
          />
        )}

        {/* Filters */}
        <IssuesFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          groups={data.groups}
          categories={data.categories}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "kanban" ? (
          filteredIssues.length > 0 ? (
            <IssuesKanbanView issues={filteredIssues} />
          ) : (
            <IssuesEmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onReportIssue={handleReportIssue}
            />
          )
        ) : viewMode === "list" ? (
          filteredIssues.length > 0 ? (
            <IssuesListView
              activeIssues={activeIssues}
              completedIssues={completedIssues}
            />
          ) : (
            <IssuesEmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onReportIssue={handleReportIssue}
            />
          )
        ) : filteredIssues.length > 0 ? (
          <IssuesCardView
            activeIssues={activeIssues}
            completedIssues={completedIssues}
          />
        ) : (
          <IssuesEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onReportIssue={handleReportIssue}
          />
        )}
      </div>
    </div>
  );
}
