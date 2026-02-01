"use client";

import {
  IoBookmark,
  IoTimeOutline,
  IoFolderOutline,
  IoTrashOutline,
} from "react-icons/io5";
import type { MixedGuide } from "../../mockData";

interface BookmarkedGuidesSidebarProps {
  bookmarkedGuides: MixedGuide[];
}

export function BookmarkedGuidesSidebar({ bookmarkedGuides }: BookmarkedGuidesSidebarProps) {
  // Group by category
  const byCategory = bookmarkedGuides.reduce((acc, guide) => {
    const cat = guide.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Calculate total estimated time
  const totalMinutes = bookmarkedGuides.reduce((sum, guide) => {
    const match = guide.timeEstimate?.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  return (
    <div className="space-y-4">
      {/* Bookmarks Summary */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Saved for Later</h3>
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 mb-2">
            <IoBookmark className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{bookmarkedGuides.length}</p>
          <p className="text-[10px] text-[#666]">Bookmarked Guides</p>
        </div>
        <div className="p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <IoTimeOutline className="w-4 h-4 text-[#888]" />
            <div>
              <p className="text-xs text-white">
                {totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`}
              </p>
              <p className="text-[9px] text-[#666]">Total estimated time</p>
            </div>
          </div>
        </div>
      </div>

      {/* By Category */}
      {categories.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoFolderOutline className="w-4 h-4 text-[#888]" />
            <h3 className="text-sm font-medium text-white">By Category</h3>
          </div>
          <div className="space-y-2">
            {categories.map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
              >
                <span className="text-xs text-[#888]">{category}</span>
                <span className="text-xs font-medium text-amber-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Preview */}
      {bookmarkedGuides.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-sm font-medium text-white mb-3">Up Next</h3>
          <div className="space-y-2">
            {bookmarkedGuides.slice(0, 3).map((guide, index) => (
              <div
                key={guide.id}
                className="flex items-center gap-2 p-2 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
              >
                <span className="text-[10px] text-[#666] w-4">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{guide.title}</p>
                  <p className="text-[9px] text-[#666]">{guide.timeEstimate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white rounded-lg transition-colors">
          <IoTrashOutline className="w-4 h-4" />
          Clear all bookmarks
        </button>
      </div>
    </div>
  );
}
