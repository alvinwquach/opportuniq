"use client";

import {
  IoSearchOutline,
  IoRefreshOutline,
  IoGridOutline,
  IoListOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { GuidesSearchProps } from "./types";

export function GuidesSearch({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onSearch,
  isSearching,
}: GuidesSearchProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-4">
      <div className="relative flex-1 min-w-0">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Search guides..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg sm:rounded-xl text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onSearch}
            disabled={isSearching}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-gray-900 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSearching ? (
              <IoRefreshOutline className="w-4 h-4 animate-spin" />
            ) : (
              <IoSearchOutline className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="sm:hidden">Search</TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <IoGridOutline className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Grid View</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <IoListOutline className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">List View</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
