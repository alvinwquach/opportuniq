"use client";

import { IoBookOutline, IoAddCircleOutline } from "react-icons/io5";

interface GuidesEmptyStateProps {
  onAddGuide?: () => void;
}

export function GuidesEmptyState({ onAddGuide }: GuidesEmptyStateProps) {
  return (
    <div className="min-h-[calc(100vh-48px)] bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-gray-100 rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <IoBookOutline className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No guides yet
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Start a conversation about a home issue and we&apos;ll automatically find
            relevant DIY guides from YouTube, iFixit, Reddit, and trusted sources.
            You can bookmark the most helpful ones to save them here.
          </p>
          {onAddGuide && (
            <button
              onClick={onAddGuide}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-gray-900 text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <IoAddCircleOutline className="w-5 h-5" />
              Find Guides
            </button>
          )}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <h4 className="text-sm font-medium text-blue-600 mb-2">
            How guides work
          </h4>
          <ul className="text-xs text-gray-500 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              Search for any home repair topic to find video tutorials and articles
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              We pull from YouTube, iFixit, This Old House, and community forums
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              Track your progress as you follow along step-by-step
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              Bookmark favorites for quick access later
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
