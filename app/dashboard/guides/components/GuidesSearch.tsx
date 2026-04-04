"use client";

import {
  IoSearchOutline,
  IoRefreshOutline,
  IoGridOutline,
  IoListOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { GuidesSearchProps } from "../types";

export function GuidesSearch({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onSearch,
  isSearching,
}: GuidesSearchProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-lg">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search guides (e.g., 'fix leaky faucet', 'AC repair')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>
      <button
        onClick={onSearch}
        disabled={isSearching}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-gray-900 text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isSearching ? (
          <IoRefreshOutline className="w-4 h-4 animate-spin" />
        ) : (
          <IoSearchOutline className="w-4 h-4" />
        )}
        Search
      </button>
      <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-gray-100 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
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
              className={`p-2 rounded-lg transition-colors ${
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
