"use client";

import {
  IoDocumentTextOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoBookmark,
  IoVideocamOutline,
  IoStarOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
    <div className="flex items-center gap-0.5 border-b border-gray-200 bg-white rounded-t-xl px-1 sm:px-2 pt-1 sm:pt-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const count = counts[tab.id];
        return (
          <Tooltip key={tab.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-400 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span
                  className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{tab.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
