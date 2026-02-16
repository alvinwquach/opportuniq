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
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" />
        <input
          type="text"
          placeholder="Search guides (e.g., 'fix leaky faucet', 'AC repair')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
        />
      </div>
      <button
        onClick={onSearch}
        disabled={isSearching}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {isSearching ? (
          <IoRefreshOutline className="w-4 h-4 animate-spin" />
        ) : (
          <IoSearchOutline className="w-4 h-4" />
        )}
        Search
      </button>
      <div className="flex items-center gap-1 border border-[#2a2a2a] rounded-xl p-1 bg-[#1a1a1a] shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
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
              className={`p-2 rounded-lg transition-colors ${
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
