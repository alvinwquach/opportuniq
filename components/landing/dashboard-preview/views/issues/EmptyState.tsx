"use client";

import { IoSearchOutline } from "react-icons/io5";

interface EmptyStateProps {
  hasFilters: boolean;
  onReportIssue: () => void;
}

export function EmptyState({ hasFilters, onReportIssue }: EmptyStateProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
        <IoSearchOutline className="w-8 h-8 text-[#555]" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">No issues found</h3>
      <p className="text-xs text-[#666] mb-4">
        {hasFilters ? "Try adjusting your search or filters" : "Report an issue to get started"}
      </p>
      {!hasFilters && (
        <button
          onClick={onReportIssue}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors"
        >
          Report New Issue
        </button>
      )}
    </div>
  );
}
