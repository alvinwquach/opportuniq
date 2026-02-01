"use client";

import { useState } from "react";
import {
  IoSearchOutline,
  IoChevronDown,
  IoClose,
  IoGridOutline,
  IoListOutline,
  IoEaselOutline,
  IoSwapVertical,
} from "react-icons/io5";
import type { IssueFilters, ViewMode, SortBy, SortOrder } from "../types";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../types";

const SORT_BY_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "updated", label: "Updated" },
  { value: "created", label: "Created" },
  { value: "priority", label: "Priority" },
];
import type { GroupOption } from "@/lib/graphql/types";

interface IssuesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortBy;
  onSortByChange: (sortBy: SortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  groups: GroupOption[];
  categories: string[];
}

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
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);

  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  const updateFilter = (key: keyof IssueFilters, value: string | null) => {
    onFiltersChange({ ...filters, [key]: value });
    setOpenFilterDropdown(null);
  };

  const clearFilters = () => {
    onFiltersChange({ status: null, priority: null, category: null, group: null });
  };

  return (
    <>
      {openFilterDropdown && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setOpenFilterDropdown(null)}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            placeholder="Search issues, diagnoses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="relative">
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
              {filters.status
                ? STATUS_CONFIG[filters.status]?.label || filters.status
                : "Status"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {openFilterDropdown === "status" && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                <button
                  onClick={() => updateFilter("status", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.status ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Status
                </button>
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

          {/* Group Filter */}
          <div className="relative">
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
              {filters.group
                ? groups.find((g) => g.id === filters.group)?.name || "Group"
                : "All Groups"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {openFilterDropdown === "group" && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                <button
                  onClick={() => updateFilter("group", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.group ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Groups
                </button>
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

          {/* Category Filter */}
          <div className="relative">
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
              {filters.category || "Category"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {openFilterDropdown === "category" && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999] max-h-60 overflow-y-auto">
                <button
                  onClick={() => updateFilter("category", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.category ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Categories
                </button>
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

          {/* Priority Filter */}
          <div className="relative">
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
              {filters.priority
                ? PRIORITY_CONFIG[filters.priority]?.label || filters.priority
                : "Priority"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {openFilterDropdown === "priority" && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                <button
                  onClick={() => updateFilter("priority", null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${
                    !filters.priority ? "text-emerald-400" : "text-[#888]"
                  }`}
                >
                  All Priorities
                </button>
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

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <IoClose className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          <div className="h-6 w-px bg-[#2a2a2a] mx-1" />

          {/* View Toggle */}
          <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1">
            <button
              onClick={() => onViewModeChange("cards")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "cards"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#666] hover:text-white"
              }`}
              title="Cards"
            >
              <IoGridOutline className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#666] hover:text-white"
              }`}
              title="List"
            >
              <IoListOutline className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("kanban")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#666] hover:text-white"
              }`}
              title="Kanban"
            >
              <IoEaselOutline className="w-4 h-4" />
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenFilterDropdown(openFilterDropdown === "sortBy" ? null : "sortBy")
              }
              className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] rounded-xl hover:border-[#333] transition-colors"
            >
              <IoSwapVertical className="w-3.5 h-3.5" />
              {SORT_BY_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort"}
              <IoChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {openFilterDropdown === "sortBy" && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                {SORT_BY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortByChange(option.value);
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

          {/* Sort Order Toggle */}
          <button
            onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] rounded-xl hover:border-[#333] transition-colors"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortBy === "priority" ? (
              sortOrder === "asc" ? "Low First" : "High First"
            ) : (
              sortOrder === "asc" ? "Oldest" : "Newest"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
