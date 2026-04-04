"use client";

import { IoGrid, IoAlertCircleOutline, IoWallet, IoCalendarOutline } from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export type GroupTab = "overview" | "issues" | "budget" | "planning";

interface GroupTabsProps {
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
}

const tabs: { id: GroupTab; label: string; icon: typeof IoGrid }[] = [
  { id: "overview", label: "Overview", icon: IoGrid },
  { id: "issues", label: "Issues", icon: IoAlertCircleOutline },
  { id: "budget", label: "Budget", icon: IoWallet },
  { id: "planning", label: "Planning", icon: IoCalendarOutline },
];

export function GroupTabs({ activeTab, onTabChange }: GroupTabsProps) {
  return (
    <div className="mb-4">
      <div className="flex gap-0.5 p-1 bg-white rounded-lg border border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onTabChange(id)}
                className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-2 text-[11px] font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
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
