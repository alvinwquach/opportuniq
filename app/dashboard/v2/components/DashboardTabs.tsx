"use client";

import { IoGrid, IoGitCompareOutline, IoWalletOutline } from "react-icons/io5";
import type { DashboardTab } from "../types";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; shortLabel: string; icon: typeof IoGrid }[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", icon: IoGrid },
  { id: "decisions", label: "Decisions", shortLabel: "Decide", icon: IoGitCompareOutline },
  { id: "spending", label: "Spending", shortLabel: "Spend", icon: IoWalletOutline },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-[#1a1a1a] rounded-lg mb-4 w-full sm:w-fit border border-[#2a2a2a] overflow-x-auto">
      {tabs.map(({ id, label, shortLabel, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start ${
            activeTab === id
              ? "bg-[#2a2a2a] text-white"
              : "text-[#888] hover:text-white"
          }`}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{shortLabel}</span>
        </button>
      ))}
    </div>
  );
}
