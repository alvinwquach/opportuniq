// Tell Next.js this component runs in the browser (not on the server).
// Required because it uses useState to track which dropdown is open,
// and it renders interactive form controls (inputs, buttons).
"use client";

// Import useState so we can track local UI state within this component
// (specifically, which dropdown panel is currently open, if any).
import { useState } from "react";

// Import icons from react-icons/io5 for the filter controls:
// - IoSearchOutline: the magnifying glass icon inside the search input
// - IoChevronDown: the small downward arrow indicating a dropdown button
// - IoClose: the "X" icon on the "Clear" button that resets all filters
// - IoGridOutline: the grid/card view icon for the view-mode toggle
// - IoListOutline: the list view icon for the view-mode toggle
// - IoEaselOutline: the kanban/board view icon for the view-mode toggle
// - IoSwapVertical: the swap/sort icon on the "Sort By" dropdown button
import {
  IoSearchOutline,
  IoChevronDown,
  IoClose,
  IoGridOutline,
  IoListOutline,
  IoEaselOutline,
  IoSwapVertical,
} from "react-icons/io5";

// Import Tooltip components from the app's shared UI library.
// - Tooltip: the overall tooltip container
// - TooltipTrigger: wraps the element that triggers the tooltip on hover
// - TooltipContent: the popup text that appears when hovering
// Used on the view-mode buttons and the sort-order toggle so users know what each icon does.
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Import TypeScript types for the values managed by this filter bar:
// - IssueFilters: the object shape for all four filter dropdowns (status, priority, category, group)
// - ViewMode: the currently selected layout ("cards", "list", or "kanban")
// - SortBy: which field to sort by ("updated", "created", or "priority")
// - SortOrder: direction of sorting ("asc" or "desc")
import type { IssueFilters, ViewMode, SortBy, SortOrder } from "../types";

// Import configuration lookup tables from the local types file:
// - STATUS_CONFIG: maps status keys to display labels (used to populate the status dropdown)
// - PRIORITY_CONFIG: maps priority keys to display labels (used to populate the priority dropdown)
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../types";

// Define the list of options for the "Sort By" dropdown.
// Each entry has a machine-readable value (used in logic) and a human-readable label (shown in the UI).
const SORT_BY_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "updated", label: "Updated" },
  { value: "created", label: "Created" },
  { value: "priority", label: "Priority" },
];

// Import the TypeScript type for a single property group option (id + name).
// Used to populate the "Group" filter dropdown with the user's actual property groups.
import type { GroupOption } from "@/lib/hooks/types";

// Define the props (inputs) this component accepts.
// All state is "lifted up" to the parent IssuesClient — this component receives
// the current values AND the setter functions to update them.
// This is a common React pattern called "controlled components".
interface IssuesFiltersProps {
  // The current text in the search input
  searchQuery: string;
  // Called with the new value whenever the user types in the search box
  onSearchChange: (query: string) => void;
  // The current state of all four filter dropdowns
  filters: IssueFilters;
  // Called with the updated filters object whenever the user selects a filter option
  onFiltersChange: (filters: IssueFilters) => void;
  // Which view layout is currently selected
  viewMode: ViewMode;
  // Called with the new view mode when the user clicks a view-toggle button
  onViewModeChange: (mode: ViewMode) => void;
  // Which field the issues are currently sorted by
  sortBy: SortBy;
  // Called with the new sort field when the user picks from the Sort By dropdown
  onSortByChange: (sortBy: SortBy) => void;
  // Whether sorting is ascending or descending
  sortOrder: SortOrder;
  // Called with the toggled sort direction when the user clicks the sort-order button
  onSortOrderChange: (order: SortOrder) => void;
  // The list of property groups available to filter by (populated from the server)
  groups: GroupOption[];
  // The list of category strings available to filter by (populated from the server)
  categories: string[];
}

// IssuesFilters renders the entire filter/sort/view control bar.
// It contains: search input, status/group/category/priority dropdowns,
// a clear-filters button, a view-mode toggle, a sort-by dropdown, and a sort-order toggle.
export function IssuesFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  groups,
  categories,
}: IssuesFiltersProps) {
  // Track which dropdown is currently open by storing its name as a string.
  // Possible values: "status", "group", "category", "priority", "sortBy", or null (all closed).
  // Only one dropdown can be open at a time — opening a new one closes the previous one.
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);

  // Check whether any filter dropdown currently has a non-null (active) value.
  // Used to decide whether to show the "Clear" button.
  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  // Helper: update a single filter key to a new value, then close any open dropdown.
  // `key` is the filter name (e.g., "status"), `value` is the selected option or null for "all".
  // We spread the existing filters object (`...filters`) so the other three filters are preserved,
  // then override only the one that changed using computed property syntax (`[key]: value`).
  const updateFilter = (key: keyof IssueFilters, value: string | null) => {
    onFiltersChange({ ...filters, [key]: value });
    setOpenFilterDropdown(null);
  };

  // Helper: reset all four filter dropdowns back to null (no filter active).
  // Called when the user clicks the red "Clear" button.
  const clearFilters = () => {
    onFiltersChange({ status: null, priority: null, category: null, group: null });
  };

  return (
    // React Fragment — lets us return two sibling elements (the backdrop div and the filter bar)
    // without adding an extra DOM wrapper element.
    <>
      {/* Invisible full-screen backdrop rendered behind any open dropdown.
          When the user clicks anywhere outside the dropdown, this div receives the click
          and closes the dropdown by setting openFilterDropdown to null.
          The z-index of 9998 places it just below the dropdown panels (z-index 9999)
          but above all other page content. */}
      {openFilterDropdown && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setOpenFilterDropdown(null)}
        />
      )}

      {/* The filter bar itself: a flex row that wraps onto multiple lines on small screens */}
      <div className="flex flex-wrap items-center gap-3">

        {/* ── Search input ── */}
        {/* flex-1 makes the search box grow to fill available space; min/max-width keeps it reasonable */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          {/* Magnifying glass icon absolutely positioned inside the left side of the input */}
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          {/* Controlled text input: value is always driven by the searchQuery prop from the parent.
              onChange fires on every keystroke, calling onSearchChange with the new text
              so the parent can update its state and re-filter the issues list. */}
          <input
            type="text"
            placeholder="Search issues, diagnoses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* ── Filter dropdown buttons ── */}
        {/* Flex row that wraps so all the controls fit on smaller screens */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* ── Status Filter dropdown ── */}
          {/* `relative` on the wrapper positions the dropdown panel relative to this button */}
          <div className="relative">
            {/* The trigger button: clicking it toggles the "status" dropdown open/closed.
                If "status" is already open, clicking again closes it (sets to null).
                Button styling changes when a status filter is active: green tint instead of grey. */}
            <button
              onClick={() =>
                setOpenFilterDropdown(openFilterDropdown === "status" ? null : "status")
              }
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border rounded-xl transition-colors ${
                filters.status
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:border-[#333]"
              }`}
            >
              {/* Show the active filter's human-readable label, or the placeholder "Status" */}
              {filters.status
                ? STATUS_CONFIG[filters.status]?.label || filters.status
                : "Status"}
              {/* Small downward arrow to indicate this is a dropdown */}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {/* The dropdown panel: only rendered when "status" is the open dropdown.
                z-index 9999 places it above the backdrop (9998) so it's clickable. */}
            {openFilterDropdown === "status" && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                {/* "All Status" option: clears the status filter (sets it back to null) */}
                <button
                  onClick={() => updateFilter("status", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.status ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Status
                </button>
                {/* Dynamically generate one option button for every entry in STATUS_CONFIG.
                    Object.entries() converts the config object to an array of [key, config] pairs.
                    The currently selected option is highlighted in green. */}
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => updateFilter("status", key)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                      filters.status === key ? "text-emerald-400" : "text-[#888]"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Group Filter dropdown ── */}
          <div className="relative">
            {/* Trigger button: shows the selected group's name, or "All Groups" if none selected */}
            <button
              onClick={() =>
                setOpenFilterDropdown(openFilterDropdown === "group" ? null : "group")
              }
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border rounded-xl transition-colors ${
                filters.group
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:border-[#333]"
              }`}
            >
              {/* Look up the selected group's name by finding the group object whose id matches.
                  If somehow the group id isn't found, fall back to the label "Group". */}
              {filters.group
                ? groups.find((g) => g.id === filters.group)?.name || "Group"
                : "All Groups"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {/* Group dropdown panel */}
            {openFilterDropdown === "group" && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                {/* "All Groups" option: clears the group filter */}
                <button
                  onClick={() => updateFilter("group", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.group ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Groups
                </button>
                {/* One button per property group — the list comes from the server via the `groups` prop */}
                {groups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => updateFilter("group", grp.id)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                      filters.group === grp.id ? "text-emerald-400" : "text-[#888]"
                    }`}
                  >
                    {grp.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Category Filter dropdown ── */}
          <div className="relative">
            {/* Trigger button: shows the selected category, or the placeholder "Category" */}
            <button
              onClick={() =>
                setOpenFilterDropdown(
                  openFilterDropdown === "category" ? null : "category"
                )
              }
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border rounded-xl transition-colors ${
                filters.category
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:border-[#333]"
              }`}
            >
              {/* Show the raw category string if one is selected, otherwise the placeholder */}
              {filters.category || "Category"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {/* Category dropdown panel: max-h-60 + overflow-y-auto allows it to scroll
                if there are many categories, keeping the panel from going off screen */}
            {openFilterDropdown === "category" && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999] max-h-60 overflow-y-auto">
                {/* "All Categories" option: clears the category filter */}
                <button
                  onClick={() => updateFilter("category", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.category ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Categories
                </button>
                {/* One button per unique category string from the server.
                    `capitalize` makes the first letter uppercase for display.
                    `replace(/_/g, " ")` converts underscores to spaces (e.g., "home_repair" → "home repair"). */}
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter("category", cat)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] capitalize ${
                      filters.category === cat ? "text-emerald-400" : "text-[#888]"
                    }`}
                  >
                    {cat.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Priority Filter dropdown ── */}
          <div className="relative">
            {/* Trigger button: shows the selected priority's label, or the placeholder "Priority" */}
            <button
              onClick={() =>
                setOpenFilterDropdown(
                  openFilterDropdown === "priority" ? null : "priority"
                )
              }
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border rounded-xl transition-colors ${
                filters.priority
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:border-[#333]"
              }`}
            >
              {/* Look up the human-readable label from PRIORITY_CONFIG, or fall back to the raw value */}
              {filters.priority
                ? PRIORITY_CONFIG[filters.priority]?.label || filters.priority
                : "Priority"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {/* Priority dropdown panel */}
            {openFilterDropdown === "priority" && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                {/* "All Priorities" option: clears the priority filter */}
                <button
                  onClick={() => updateFilter("priority", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.priority ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Priorities
                </button>
                {/* One button per priority level, generated from PRIORITY_CONFIG.
                    Object.entries() gives us the [key, config] pairs to iterate over. */}
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => updateFilter("priority", key)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                      filters.priority === key ? "text-emerald-400" : "text-[#888]"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* "Clear" button — only shown when at least one filter dropdown has an active value.
              Clicking it calls clearFilters() which resets all four filter values to null. */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <IoClose className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          {/* Vertical divider line — a thin grey bar that visually separates the filter dropdowns
              from the view-mode toggle and sort controls to the right */}
          <div className="h-6 w-px bg-[#2a2a2a] mx-1" />

          {/* ── View Mode Toggle ── */}
          {/* A pill-shaped container holding three icon buttons (Cards / List / Kanban).
              The active button is highlighted with a slightly lighter background. */}
          <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1">

            {/* Cards view button — wrapped in a Tooltip so hovering shows "Card View" */}
            <Tooltip>
              {/* TooltipTrigger wraps the element that activates the tooltip.
                  asChild means the Tooltip uses the button itself as its trigger element
                  rather than adding a new wrapper DOM element. */}
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange("cards")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "cards"
                      ? "bg-[#2a2a2a] text-white"
                      : "text-[#666] hover:text-white"
                  }`}
                >
                  {/* Grid icon representing the card layout */}
                  <IoGridOutline className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              {/* Tooltip text shown on hover */}
              <TooltipContent side="bottom">Card View</TooltipContent>
            </Tooltip>

            {/* List view button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-[#2a2a2a] text-white"
                      : "text-[#666] hover:text-white"
                  }`}
                >
                  {/* Lines icon representing the compact list layout */}
                  <IoListOutline className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">List View</TooltipContent>
            </Tooltip>

            {/* Kanban view button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange("kanban")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "kanban"
                      ? "bg-[#2a2a2a] text-white"
                      : "text-[#666] hover:text-white"
                  }`}
                >
                  {/* Easel/board icon representing the Kanban column layout */}
                  <IoEaselOutline className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Kanban Board</TooltipContent>
            </Tooltip>
          </div>

          {/* ── Sort By dropdown ── */}
          <div className="relative">
            {/* Trigger button: shows the swap icon, the current sort field label, and a chevron */}
            <button
              onClick={() =>
                setOpenFilterDropdown(openFilterDropdown === "sortBy" ? null : "sortBy")
              }
              className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] rounded-xl hover:border-[#333] transition-colors"
            >
              {/* Sort icon to visually identify this as a sort control */}
              <IoSwapVertical className="w-3.5 h-3.5" />
              {/* Find the human-readable label for the current sortBy value in SORT_BY_OPTIONS.
                  Falls back to "Sort" if somehow no match is found. */}
              {SORT_BY_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {/* Sort By dropdown panel: positioned to the right (right-0) so it doesn't overflow
                off the left edge of the screen on small viewports */}
            {openFilterDropdown === "sortBy" && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                {/* One button per sort option (Updated / Created / Priority) */}
                {SORT_BY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      // Update the parent's sortBy state with the chosen value
                      onSortByChange(option.value);
                      // Close the dropdown after selection
                      setOpenFilterDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                      sortBy === option.value ? "text-emerald-400" : "text-[#888]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Sort Order toggle button ── */}
          {/* Clicking this button flips the sort direction:
              if it is currently "asc" it becomes "desc", and vice versa.
              The label shown changes based on both sortBy and sortOrder so it's always descriptive. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] rounded-xl hover:border-[#333] transition-colors"
              >
                {/* Context-sensitive label:
                    - When sorting by priority: "Low First" or "High First"
                    - When sorting by date: "Oldest" or "Newest" */}
                {sortBy === "priority" ? (
                  sortOrder === "asc" ? "Low First" : "High First"
                ) : (
                  sortOrder === "asc" ? "Oldest" : "Newest"
                )}
              </button>
            </TooltipTrigger>
            {/* Tooltip hint that tells the user what clicking will do (switch direction) */}
            <TooltipContent side="bottom">
              {sortOrder === "asc" ? "Switch to Descending" : "Switch to Ascending"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
