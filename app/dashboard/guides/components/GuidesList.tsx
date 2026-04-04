"use client";

import { useState, useEffect } from "react";
import { IoSearchOutline, IoChevronDown } from "react-icons/io5";
import type { GuidesListProps } from "../types";
import { GuideCard } from "./GuideCard";

const INITIAL_ITEMS = 6;
const LOAD_MORE_COUNT = 6;

export function GuidesList({
  guides,
  viewMode,
  searchQuery,
  activeTab,
  onClearFilters,
  onBookmark,
  onClick,
}: GuidesListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);

  // Reset visible count when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(INITIAL_ITEMS);
  }, [searchQuery, activeTab, guides.length]);

  const visibleGuides = guides.slice(0, visibleCount);
  const hasMore = guides.length > visibleCount;
  const remaining = guides.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, guides.length));
  };

  if (guides.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center mx-auto mb-4">
          <IoSearchOutline className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">No guides found</p>
        <p className="text-xs text-gray-500 mb-4">
          {searchQuery
            ? `No results for "${searchQuery}". Try different keywords.`
            : "No guides match your current filters."}
        </p>
        <button
          onClick={onClearFilters}
          className="text-xs text-blue-600 font-medium hover:text-blue-500"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  const getTitle = () => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (activeTab === "all") return "All Guides";
    return `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Guides`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{getTitle()}</h3>
        <span className="text-xs text-gray-500">
          Showing {visibleGuides.length} of {guides.length} guides
        </span>
      </div>

      <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-3"}>
        {visibleGuides.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            viewMode={viewMode}
            onBookmark={onBookmark}
            onClick={onClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-200 hover:border-blue-500/50 transition-all"
          >
            <span>Load More</span>
            <span className="text-xs text-gray-500">({remaining} remaining)</span>
            <IoChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}
