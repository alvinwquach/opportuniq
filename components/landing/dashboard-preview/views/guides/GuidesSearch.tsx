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
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#555]" />
        <input
          type="text"
          placeholder="Search guides..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg sm:rounded-xl text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
        />
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onSearch}
            disabled={isSearching}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
      <div className="flex items-center gap-0.5 border border-[#2a2a2a] rounded-lg p-0.5 bg-[#1a1a1a] shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-[#666] hover:text-white"
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
                viewMode === "list" ? "bg-emerald-500/20 text-emerald-400" : "text-[#666] hover:text-white"
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
