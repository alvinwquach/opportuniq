"use client";

import {
  IoDocumentTextOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoBookmark,
  IoVideocamOutline,
  IoStarOutline,
} from "react-icons/io5";
import type { GuidesTabsProps, TabType } from "./types";
import { getTabCounts } from "./utils";

const tabs: Array<{
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "all", label: "All", icon: IoDocumentTextOutline },
  { id: "featured", label: "Featured", icon: IoStarOutline },
  { id: "active", label: "Active", icon: IoPlayCircleOutline },
  { id: "completed", label: "Completed", icon: IoCheckmarkCircle },
  { id: "bookmarked", label: "Saved", icon: IoBookmark },
  { id: "videos", label: "Videos", icon: IoVideocamOutline },
  { id: "articles", label: "Articles", icon: IoDocumentTextOutline },
];

export function GuidesTabs({ activeTab, setActiveTab, guides }: GuidesTabsProps) {
  const counts = getTabCounts(guides);

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-[#2a2a2a] bg-[#1a1a1a] rounded-t-xl px-2 pt-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-[#666] hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                activeTab === tab.id ? "bg-emerald-500/20 text-emerald-400" : "bg-[#333] text-[#888]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
