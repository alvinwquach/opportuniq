"use client";

import {
  IoSearchOutline,
  IoChevronDown,
  IoClose,
  IoSwapVertical,
  IoGridOutline,
  IoListOutline,
  IoEaselOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { statusConfig } from "./config";
import type { Filters } from "./types";

interface IssueFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  openFilterDropdown: string | null;
  setOpenFilterDropdown: (dropdown: string | null) => void;
  allCategories: string[];
  allGroups: string[];
  hasActiveFilters: boolean;
  viewMode: "cards" | "list" | "kanban";
  setViewMode: (mode: "cards" | "list" | "kanban") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

export function IssueFilters({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  openFilterDropdown,
  setOpenFilterDropdown,
  allCategories,
  allGroups,
  hasActiveFilters,
  viewMode,
  setViewMode,
  sortOrder,
  setSortOrder,
}: IssueFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Top Row: Search + View Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded transition-colors ${viewMode === "cards" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                <IoGridOutline className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Card View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                <IoListOutline className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">List View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded transition-colors ${viewMode === "kanban" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                <IoEaselOutline className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Kanban Board</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setOpenFilterDropdown(openFilterDropdown === "status" ? null : "status")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
              filters.status ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {filters.status ? statusConfig[filters.status]?.label : "Status"}
            <IoChevronDown className="w-3 h-3 opacity-50" />
          </button>
          {openFilterDropdown === "status" && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-[9999]">
              <button onClick={() => { setFilters({ ...filters, status: null }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 ${!filters.status ? "text-blue-600" : "text-gray-500"}`}>
                All Status
              </button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button key={key} onClick={() => { setFilters({ ...filters, status: key }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 ${filters.status === key ? "text-blue-600" : "text-gray-500"}`}>
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Group Filter */}
        <div className="relative">
          <button
            onClick={() => setOpenFilterDropdown(openFilterDropdown === "group" ? null : "group")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
              filters.group ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className="max-w-[80px] truncate">{filters.group || "All Groups"}</span>
            <IoChevronDown className="w-3 h-3 opacity-50 shrink-0" />
          </button>
          {openFilterDropdown === "group" && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-[9999]">
              <button onClick={() => { setFilters({ ...filters, group: null }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 ${!filters.group ? "text-blue-600" : "text-gray-500"}`}>
                All Groups
              </button>
              {allGroups.map((grp) => (
                <button key={grp} onClick={() => { setFilters({ ...filters, group: grp }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 truncate ${filters.group === grp ? "text-blue-600" : "text-gray-500"}`}>
                  {grp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setOpenFilterDropdown(openFilterDropdown === "category" ? null : "category")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
              filters.category ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {filters.category || "Category"}
            <IoChevronDown className="w-3 h-3 opacity-50" />
          </button>
          {openFilterDropdown === "category" && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-[9999]">
              <button onClick={() => { setFilters({ ...filters, category: null }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 ${!filters.category ? "text-blue-600" : "text-gray-500"}`}>
                All Categories
              </button>
              {allCategories.map((cat) => (
                <button key={cat} onClick={() => { setFilters({ ...filters, category: cat }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 ${filters.category === cat ? "text-blue-600" : "text-gray-500"}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-500 rounded-lg hover:border-gray-300 transition-colors"
            >
              <IoSwapVertical className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </TooltipContent>
        </Tooltip>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setFilters({ status: null, priority: null, category: null, group: null })}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <IoClose className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Clear Filters</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
