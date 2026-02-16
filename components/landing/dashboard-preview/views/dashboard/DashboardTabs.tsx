import { IoGrid, IoAlertCircleOutline, IoCalendarOutline } from "react-icons/io5";

export type DashboardTab = "overview" | "issues" | "planning";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; shortLabel: string; icon: typeof IoGrid }[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", icon: IoGrid },
  { id: "issues", label: "Issues", shortLabel: "Issues", icon: IoAlertCircleOutline },
  { id: "planning", label: "Planning", shortLabel: "Plan", icon: IoCalendarOutline },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="mb-4 overflow-x-auto scrollbar-hide overscroll-x-contain touch-pan-x">
      <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg w-fit border border-[#2a2a2a]">
        {tabs.map(({ id, label, shortLabel, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === id
                ? "bg-[#2a2a2a] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
