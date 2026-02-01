"use client";

import {
  IoGridOutline,
  IoScanOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { ViewType } from './types';
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: IoGridOutline },
  { id: 'diagnose' as ViewType, label: 'Diagnose', icon: IoScanOutline },
  { id: 'issues' as ViewType, label: 'Issues', icon: IoAlertCircleOutline },
  { id: 'groups' as ViewType, label: 'Groups', icon: IoPeopleOutline },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: IoCalendarOutline },
  { id: 'finances' as ViewType, label: 'Finances', icon: IoWalletOutline },
  { id: 'guides' as ViewType, label: 'Guides', icon: IoBookOutline },
];

const bottomNavItems = [
  { id: 'settings' as ViewType, label: 'Settings', icon: IoSettingsOutline },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-14 flex flex-col h-full bg-[#0d0d0d] border-r border-white/[0.06]">
      {/* Main Navigation */}
      <nav className="flex-1 py-3">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200 group relative",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-[#888] hover:bg-white/[0.04] hover:text-white"
                  )}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {/* Tooltip */}
                  <span className="absolute left-full ml-2 px-2 py-1 bg-[#171717] border border-white/[0.06] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings - at bottom */}
      <div className="py-3 border-t border-white/[0.06]">
        <ul className="space-y-0.5 px-2">
          {bottomNavItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200 group relative",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-[#888] hover:bg-white/[0.04] hover:text-white"
                  )}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {/* Tooltip */}
                  <span className="absolute left-full ml-2 px-2 py-1 bg-[#171717] border border-white/[0.06] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
