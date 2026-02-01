import { IoCalendarOutline, IoListOutline, IoRepeat, IoLinkOutline } from "react-icons/io5";

export type CalendarTab = "calendar" | "timeline" | "recurring" | "linked";

interface CalendarTabsProps {
  activeTab: CalendarTab;
  onTabChange: (tab: CalendarTab) => void;
}

const tabs: { id: CalendarTab; label: string; shortLabel: string; icon: typeof IoCalendarOutline }[] = [
  { id: "calendar", label: "Calendar", shortLabel: "Calendar", icon: IoCalendarOutline },
  { id: "timeline", label: "Timeline", shortLabel: "Timeline", icon: IoListOutline },
  { id: "recurring", label: "Recurring", shortLabel: "Recurring", icon: IoRepeat },
  { id: "linked", label: "Linked Issues", shortLabel: "Linked", icon: IoLinkOutline },
];

export function CalendarTabs({ activeTab, onTabChange }: CalendarTabsProps) {
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
