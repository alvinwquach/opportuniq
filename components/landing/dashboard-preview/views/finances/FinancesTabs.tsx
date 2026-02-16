"use client";

import {
  IoGridOutline,
  IoWalletOutline,
  IoTrendingUpOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export type FinancesTab = "overview" | "budget" | "trends" | "income" | "expenses";

interface FinancesTabsProps {
  activeTab: FinancesTab;
  onTabChange: (tab: FinancesTab) => void;
}

const tabs: { id: FinancesTab; label: string; icon: typeof IoGridOutline }[] = [
  { id: "overview", label: "Overview", icon: IoGridOutline },
  { id: "budget", label: "Budget", icon: IoWalletOutline },
  { id: "trends", label: "Trends", icon: IoTrendingUpOutline },
  { id: "income", label: "Income", icon: IoArrowUpOutline },
  { id: "expenses", label: "Expenses", icon: IoArrowDownOutline },
];

export function FinancesTabs({ activeTab, onTabChange }: FinancesTabsProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-0.5 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onTabChange(id)}
                className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-2 text-[11px] font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? "bg-emerald-500/20 text-emerald-400"
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
