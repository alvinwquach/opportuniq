"use client";

import { IoSearchOutline } from "react-icons/io5";

interface EmptyStateProps {
  hasFilters: boolean;
  onReportIssue: () => void;
}

export function EmptyState({ hasFilters, onReportIssue }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <IoSearchOutline className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">No issues found</h3>
      <p className="text-xs text-gray-500 mb-4">
        {hasFilters ? "Try adjusting your search or filters" : "Report an issue to get started"}
      </p>
      {!hasFilters && (
        <button
          onClick={onReportIssue}
          className="px-4 py-2 bg-blue-600 text-gray-900 text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
        >
          Report New Issue
        </button>
      )}
    </div>
  );
}
