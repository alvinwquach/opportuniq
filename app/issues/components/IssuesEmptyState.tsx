"use client";

import { IoSearchOutline, IoAddOutline } from "react-icons/io5";

interface IssuesEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onReportIssue?: () => void;
}

export function IssuesEmptyState({
  hasFilters,
  onClearFilters,
  onReportIssue,
}: IssuesEmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <IoSearchOutline className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">No issues found</h3>
      <p className="text-xs text-gray-400 mb-4">
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Report an issue to get started"}
      </p>
      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Clear Filters
        </button>
      ) : (
        <button
          onClick={onReportIssue}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors"
        >
          <IoAddOutline className="w-4 h-4" />
          Report New Issue
        </button>
      )}
    </div>
  );
}
