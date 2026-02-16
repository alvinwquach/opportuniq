"use client";

import { IoCalendarOutline, IoListOutline, IoRepeat, IoLinkOutline } from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export type CalendarTab = "calendar" | "timeline" | "recurring" | "linked";

interface CalendarTabsProps {
  activeTab: CalendarTab;
  onTabChange: (tab: CalendarTab) => void;
}

const tabs: { id: CalendarTab; label: string; icon: typeof IoCalendarOutline }[] = [
  { id: "calendar", label: "Calendar", icon: IoCalendarOutline },
  { id: "timeline", label: "Timeline", icon: IoListOutline },
  { id: "recurring", label: "Recurring", icon: IoRepeat },
  { id: "linked", label: "Linked Issues", icon: IoLinkOutline },
];

export function CalendarTabs({ activeTab, onTabChange }: CalendarTabsProps) {
  return (
    <div className="mb-4">
      <div className="flex gap-0.5 p-1 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onTabChange(id)}
                className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-2 text-[11px] font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? "bg-[#2a2a2a] text-white"
                    : "text-[#888] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
