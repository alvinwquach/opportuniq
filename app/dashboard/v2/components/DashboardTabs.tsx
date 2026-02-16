"use client";

import { IoGrid, IoGitCompareOutline, IoWalletOutline } from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { DashboardTab } from "../types";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; icon: typeof IoGrid }[] = [
  { id: "overview", label: "Overview", icon: IoGrid },
  { id: "decisions", label: "Decisions", icon: IoGitCompareOutline },
  { id: "spending", label: "Spending", icon: IoWalletOutline },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex gap-0.5 p-1 bg-[#1a1a1a] rounded-lg mb-4 border border-[#2a2a2a]">
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
          <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
