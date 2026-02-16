"use client";

import {
  IoDocumentTextOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoBookmark,
  IoVideocamOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { GuidesTabsProps, TabType } from "../types";
import { getTabCounts } from "../utils";

const tabs: Array<{
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "all", label: "All", icon: IoDocumentTextOutline },
  { id: "active", label: "Active", icon: IoPlayCircleOutline },
  { id: "completed", label: "Completed", icon: IoCheckmarkCircle },
  { id: "bookmarked", label: "Saved", icon: IoBookmark },
  { id: "videos", label: "Videos", icon: IoVideocamOutline },
  { id: "articles", label: "Articles", icon: IoDocumentTextOutline },
];

export function GuidesTabs({ activeTab, setActiveTab, guides }: GuidesTabsProps) {
  const counts = getTabCounts(guides);

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[#2a2a2a] bg-[#1a1a1a] rounded-t-xl px-2 pt-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const count = counts[tab.id];
        return (
          <Tooltip key={tab.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-[#666] hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    activeTab === tab.id ? "bg-emerald-500/20 text-emerald-400" : "bg-[#333] text-[#888]"
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
