"use client";

import { useState } from "react";
import {
  IoGridOutline,
  IoFolderOutline,
  IoChatbubbleEllipsesOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
  IoScaleOutline,
  IoPeopleOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { ViewType } from './types';
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  darkMode?: boolean;
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: IoGridOutline               },
  { id: 'projects'  as ViewType, label: 'Projects',  icon: IoFolderOutline              },
  { id: 'diagnose'  as ViewType, label: 'Diagnose',  icon: IoChatbubbleEllipsesOutline  },
  { id: 'calendar'  as ViewType, label: 'Calendar',  icon: IoCalendarOutline            },
  { id: 'finances'  as ViewType, label: 'Finances',  icon: IoWalletOutline              },
  { id: 'guides'    as ViewType, label: 'Guides',    icon: IoBookOutline                },
  { id: 'decisions' as ViewType, label: 'Decisions', icon: IoScaleOutline               },
  { id: 'groups'    as ViewType, label: 'Groups',    icon: IoPeopleOutline              },
  { id: 'settings'  as ViewType, label: 'Settings',  icon: IoSettingsOutline            },
];

function SidebarToggleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.25"/>
      <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.25"/>
    </svg>
  );
}

export function Sidebar({ activeView, onViewChange, darkMode = false }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      "relative h-full flex-shrink-0 transition-[width] duration-200 ease-in-out",
      open ? "w-44" : "w-14"
    )}>
      <aside className={cn(
        "absolute inset-y-0 left-0 flex flex-col overflow-hidden z-20 transition-all duration-200 ease-in-out border-r",
        darkMode ? "bg-[#171717] border-white/[0.06]" : "bg-white border-gray-200",
        open ? "w-44" : "w-14"
      )}>
        {/* Toggle */}
        <div className={`h-10 flex items-center px-2 border-b flex-shrink-0 ${darkMode ? "border-white/[0.06]" : "border-gray-100"}`}>
          <button
            onClick={() => setOpen(!open)}
            className={`w-10 h-8 flex items-center justify-center rounded-md transition-colors ${
              darkMode
                ? "text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            aria-label={open ? "Close sidebar" : "Open sidebar"}
          >
            <SidebarToggleIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-hidden">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "w-full h-9 flex items-center gap-2.5 px-2 rounded-md transition-colors duration-150 whitespace-nowrap",
                      isActive
                        ? darkMode ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600"
                        : darkMode ? "text-gray-500 hover:bg-white/[0.06] hover:text-gray-300" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    )}
                    aria-label={item.label}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className={cn(
                      "text-xs font-medium transition-opacity duration-150",
                      open ? "opacity-100" : "opacity-0"
                    )}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
