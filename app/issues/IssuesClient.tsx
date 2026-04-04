// Tell Next.js this component runs in the browser (not on the server).
// This is required because it uses React hooks like useState and browser-only features like useRouter.
"use client";

// Import two React hooks:
// - useState: lets us store and update values that, when changed, cause the component to re-render
// - useMemo: lets us cache expensive computations so they only re-run when their inputs change
import { useState, useMemo } from "react";

// Import the "+" plus icon from the react-icons library.
// This will be displayed on the "Report Issue" button in the header.
import { IoAddOutline } from "react-icons/io5";

// Import the custom TanStack Query hook that fetches all issues-page data from the server.
// It returns the issues list, stats, charts data, and groups/categories for filters.
import { useIssuesPageData } from "@/lib/hooks";

// Import TypeScript type definitions for the shape of data used on this page:
// - IssueFilters: describes which filter dropdowns are currently active (status, priority, etc.)
// - ViewMode: which view the user has selected ("cards", "list", or "kanban")
// - SortBy: which field issues are currently sorted by ("updated", "created", "priority")
// - SortOrder: whether the sort is ascending or descending ("asc" or "desc")
// - PRIORITY_ORDER: a lookup table that maps priority strings ("low", "medium", etc.) to numbers
//   so we can sort issues numerically by priority
import type { IssueFilters, ViewMode, SortBy, SortOrder } from "./types";
import { PRIORITY_ORDER } from "./types";

// Import all the sub-components that make up the issues page:
// - IssuesStatsCards: the row of summary stat boxes at the top (total saved, active count, etc.)
// - IssuesCharts: the savings-over-time and category-distribution charts
// - IssuesFilters: the search box, filter dropdowns, view switcher, and sort controls
// - IssuesCardView: displays issues as a grid of cards (the default view)
// - IssuesListView: displays issues as a compact list
// - IssuesKanbanView: displays issues in a Kanban board grouped by status
// - IssuesSkeleton: a loading placeholder shown while data is being fetched
// - IssuesEmptyState: a message shown when no issues match the current filters
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

// Import Next.js's Link component, which navigates to a new page without a full browser reload.
// Used for the "Report Issue" button that takes the user to the diagnose page.
import Link from "next/link";

// Import Next.js's useRouter hook, which lets us programmatically navigate to a different URL.
// Used when the empty-state "Report Issue" button is clicked.
import { useRouter } from "next/navigation";

// Define and export the main IssuesClient component.
// This is the top-level component rendered by the /issues page.
export function IssuesClient() {
  // Get the router object so we can navigate to other pages programmatically (e.g., router.push).
  const router = useRouter();

  // Fetch all issues-page data from the server using TanStack Query.
  // - data: the issues list plus aggregated stats, chart data, groups, and categories
  // - isLoading: true while the request is in flight (not yet returned)
  // - error: set if the network request failed
  const { data, isLoading, error } = useIssuesPageData();

  // Store the current text the user has typed into the search box.
  // Starts as an empty string (no search active).
  const [searchQuery, setSearchQuery] = useState("");

  // Store the current state of all four filter dropdowns.
  // Each field starts as null, meaning "no filter applied" for that field.
  // When the user picks a value in a dropdown, the matching field is set to that value.
  const [filters, setFilters] = useState<IssueFilters>({
    status: null,
    priority: null,
    category: null,
    group: null,
  });

  // Store which view layout the user has selected.
  // Defaults to "cards" (the card-grid view).
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  // Store which field the issues list is currently sorted by.
  // Defaults to "updated" (most recently updated issues appear first).
  const [sortBy, setSortBy] = useState<SortBy>("updated");

  // Store the sort direction: "asc" (oldest/lowest first) or "desc" (newest/highest first).
  // Defaults to "desc" so the most relevant issues appear at the top.
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Compute the filtered and sorted list of issues.
  // useMemo caches this computation and only re-runs it when one of the listed dependencies changes
  // (the raw issues array, the search query, the active filters, or the sort settings).
  // This avoids re-filtering the entire list on every render for unrelated state changes.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filteredIssues = useMemo(() => {
    // If the data hasn't loaded yet or there are no issues, return an empty array
    // so the rest of the page safely renders with nothing to display.
    if (!data?.issues) return [];

    // Copy the full issues array into a new array so we can mutate it
    // without accidentally modifying the original cached data from the server.
    let result = [...data.issues];

    // If the user has typed something in the search box, keep only the issues
    // whose title, diagnosis text, or group name contains the search query.
    // We convert both sides to lowercase so the match is case-insensitive.
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.diagnosis?.toLowerCase().includes(query) ||
          issue.groupName.toLowerCase().includes(query)
      );
    }

    // If the user has chosen a status in the filter dropdown,
    // keep only issues whose status exactly matches the selected value
    // (e.g., only show "open" issues).
    if (filters.status) {
      result = result.filter((issue) => issue.status === filters.status);
    }

    // If the user has chosen a priority in the filter dropdown,
    // keep only issues with that exact priority level (e.g., only "critical" issues).
    if (filters.priority) {
      result = result.filter((issue) => issue.priority === filters.priority);
    }

    // If the user has chosen a category in the filter dropdown,
    // keep only issues in that category. We compare lowercase on both sides
    // so "Plumbing" and "plumbing" are treated as the same value.
    if (filters.category) {
      result = result.filter(
        (issue) =>
          issue.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // If the user has chosen a specific property group in the filter dropdown,
    // keep only issues that belong to that group (matched by groupId).
    if (filters.group) {
      result = result.filter((issue) => issue.groupId === filters.group);
    }

    // Sort the filtered list according to the current sortBy and sortOrder settings.
    // Array.sort() compares two items (a, b) at a time; returning a negative number puts a before b,
    // a positive number puts b before a, and 0 leaves their order unchanged.
    result.sort((a, b) => {
      // Start with a neutral comparison value of 0 (equal / no preference).
      let comparison = 0;

      if (sortBy === "priority") {
        // Look up each issue's priority as a number using PRIORITY_ORDER
        // (e.g., critical=4, high=3, medium=2, low=1). Fall back to 0 if not found.
        // Subtracting priorityA from priorityB means higher-priority issues sort first by default.
        const priorityA = PRIORITY_ORDER[a.priority] || 0;
        const priorityB = PRIORITY_ORDER[b.priority] || 0;
        comparison = priorityB - priorityA; // Higher priority first by default
      } else if (sortBy === "created") {
        // Convert the ISO date strings to millisecond timestamps so we can subtract them.
        // Subtracting dateA from dateB means newer (larger timestamp) issues sort first.
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateB - dateA; // Newest first by default
      } else {
        // Default sort: sort by the most-recently-updated date.
        // Same logic as the created sort — newer timestamps sort first.
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        comparison = dateB - dateA; // Newest first by default
      }

      // If the user has chosen ascending order, flip the sign so the default ordering reverses
      // (e.g., oldest first instead of newest first, or lowest priority first).
      return sortOrder === "asc" ? -comparison : comparison;
    });

    // Return the fully filtered and sorted list to be used by the view components.
    return result;
  }, [data?.issues, searchQuery, filters, sortBy, sortOrder]);

  // From the filtered list, pull out only the issues that are still "active"
  // (i.e., not yet completed or deferred). Used by card and list views to separate sections.
  const activeIssues = useMemo(
    () => filteredIssues.filter((i) => !["completed", "deferred"].includes(i.status)),
    [filteredIssues]
  );

  // From the filtered list, pull out only the issues that have been fully resolved ("completed").
  // These are shown in a separate "Resolved" section in the card and list views.
  const completedIssues = useMemo(
    () => filteredIssues.filter((i) => i.status === "completed"),
    [filteredIssues]
  );

  // Check whether the user currently has any filters or search text active.
  // This is used to decide whether to show a "clear filters" button in the empty state.
  // Object.values(filters) gives [statusValue, priorityValue, categoryValue, groupValue];
  // if any of them is not null, or the search box has text, then filters are active.
  const hasActiveFilters =
    Object.values(filters).some((v) => v !== null) || searchQuery.length > 0;

  // Define a helper function that resets all filter dropdowns and the search box back to their
  // default empty state. Called when the user clicks "Clear Filters" in the empty state.
  const clearFilters = () => {
    setFilters({ status: null, priority: null, category: null, group: null });
    setSearchQuery("");
  };

  // Define a helper function that navigates the user to the diagnose page
  // where they can report a new household issue.
  const handleReportIssue = () => {
    router.push("/dashboard/projects");
  };

  // If the data is still loading from the server, render the skeleton placeholder
  // (greyed-out boxes that mimic the page layout) instead of the real content.
  if (isLoading) {
    return <IssuesSkeleton />;
  }

  // If the server request failed, display a centered error message with the error text
  // so the user knows something went wrong.
  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading issues</p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // If for some reason the data object is missing even though loading finished
  // (e.g., a race condition or unexpected undefined), fall back to the skeleton
  // rather than crashing the page.
  if (!data) {
    return <IssuesSkeleton />;
  }

  // ── Main render ──
  // The data has loaded successfully, so render the full issues page.
  return (
    // Outer wrapper: full page height (minus the 48px top nav), dark background.
    <div className="min-h-[calc(100vh-48px)] bg-white">
      {/* Header section: contains the page title, stats cards, charts, and filter controls */}
      <div className="px-6 py-5 border-b border-gray-200">
        {/* Top row of the header: title/subtitle on the left, "Report Issue" button on the right */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {/* Page title */}
            <h1 className="text-xl font-semibold text-gray-900">Issue History</h1>
            {/* Subtitle showing a quick count of total, active, and resolved issues
                so the user can see at a glance how many issues match the current filters */}
            <p className="text-sm text-gray-400 mt-0.5">
              {filteredIssues.length} issues · {activeIssues.length} active ·{" "}
              {completedIssues.length} resolved
            </p>
          </div>
          {/* "Report Issue" button — navigates to the diagnose page.
              Rendered as a Next.js Link so the transition is instant (client-side navigation). */}
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors font-medium"
          >
            {/* Plus icon displayed to the left of the button label */}
            <IoAddOutline className="w-5 h-5" />
            Report Issue
          </Link>
        </div>

        {/* Stats Cards row: shows summary metrics like total money saved, DIY count, etc.
            Receives pre-aggregated numbers from the server so it doesn't need to recalculate them. */}
        <IssuesStatsCards
          totalSaved={data.totalSaved}
          diyCount={data.diyCount}
          proCount={data.proCount}
          activeIssueCount={data.activeIssueCount}
        />

        {/* Charts section: only rendered when there is chart data to display.
            If both arrays are empty (brand-new account with no history), the charts are hidden
            to avoid showing empty/blank chart containers. */}
        {(data.savingsOverTime.length > 0 || data.categoryDistribution.length > 0) && (
          <IssuesCharts
            savingsOverTime={data.savingsOverTime}
            categoryDistribution={data.categoryDistribution}
            resolutionBreakdown={data.resolutionBreakdown}
          />
        )}

        {/* Filters bar: contains the search input, all filter dropdowns, the view-mode toggle,
            and the sort controls. It receives both the current values and the setter functions
            so it can update this component's state when the user changes any control. */}
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

      {/* Content area: renders the correct view based on which viewMode is selected.
          Also shows the empty state if no issues match the current filters. */}
      <div className="p-6">
        {/* ── View routing logic ──
            We check viewMode first, then whether there are any issues to show.
            If there are no issues, we show the empty state regardless of view mode. */}

        {viewMode === "kanban" ? (
          // Kanban view: issues grouped into columns by status (open, in progress, etc.)
          filteredIssues.length > 0 ? (
            <IssuesKanbanView issues={filteredIssues} />
          ) : (
            // No issues match — show a helpful message with options to clear filters or report a new one
            <IssuesEmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onReportIssue={handleReportIssue}
            />
          )
        ) : viewMode === "list" ? (
          // List view: compact table-style rows, split into active and completed sections
          filteredIssues.length > 0 ? (
            <IssuesListView
              activeIssues={activeIssues}
              completedIssues={completedIssues}
            />
          ) : (
            // No issues match — show the empty state
            <IssuesEmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onReportIssue={handleReportIssue}
            />
          )
        ) : filteredIssues.length > 0 ? (
          // Default card view: a grid of issue cards split into active and completed sections
          <IssuesCardView
            activeIssues={activeIssues}
            completedIssues={completedIssues}
          />
        ) : (
          // No issues match — show the empty state for the card view too
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
