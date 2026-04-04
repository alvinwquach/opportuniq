"use client";

import { useState } from "react";
import { Sidebar } from "@/components/landing/dashboard-preview/Sidebar";
import { TopBar } from "@/components/landing/dashboard-preview/TopBar";
import { DarkModeContext } from "@/components/landing/dashboard-preview/DarkModeContext";
import { ViewType } from "@/components/landing/dashboard-preview/types";
import { DashboardView } from "@/components/landing/dashboard-preview/views/DashboardView";
import { ProjectsView } from "@/components/landing/dashboard-preview/views/ProjectsView";
import { GroupsView } from "@/components/landing/dashboard-preview/views/GroupsView";
import { CalendarView } from "@/components/landing/dashboard-preview/views/CalendarView";
import { FinancesView } from "@/components/landing/dashboard-preview/views/FinancesView";
import { GuidesView } from "@/components/landing/dashboard-preview/views/GuidesView";
import { SettingsView } from "@/components/landing/dashboard-preview/views/SettingsView";
import { DecisionsView } from "@/components/landing/dashboard-preview/views/DecisionsView";
import { DiagnoseView } from "@/components/landing/dashboard-preview/views/DiagnoseView";
import {
  IoGridOutline,
  IoFolderOutline,
  IoChatbubbleEllipsesOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
  IoScaleOutline,
  IoPeopleOutline,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";

const simpleViewComponents: Partial<Record<ViewType, React.ComponentType>> = {
  dashboard: DashboardView,
  projects:  ProjectsView,
  diagnose:  DiagnoseView,
  calendar:  CalendarView,
  finances:  FinancesView,
  guides:    GuidesView,
  decisions: DecisionsView,
  groups:    GroupsView,
  settings:  SettingsView,
};

const mobileNavItems = [
  { id: "dashboard" as ViewType, label: "Dashboard", icon: IoGridOutline               },
  { id: "projects"  as ViewType, label: "Projects",  icon: IoFolderOutline              },
  { id: "diagnose"  as ViewType, label: "Diagnose",  icon: IoChatbubbleEllipsesOutline  },
  { id: "calendar"  as ViewType, label: "Calendar",  icon: IoCalendarOutline            },
  { id: "finances"  as ViewType, label: "Finances",  icon: IoWalletOutline              },
  { id: "guides"    as ViewType, label: "Guides",    icon: IoBookOutline                },
  { id: "decisions" as ViewType, label: "Decisions", icon: IoScaleOutline               },
  { id: "groups"    as ViewType, label: "Groups",    icon: IoPeopleOutline              },
];

export default function AdminDemoPage() {
  const [activeView, setActiveView] = useState<ViewType>("projects");
  const [darkMode, setDarkMode] = useState(false);

  const renderActiveView = () => {
    const ViewComponent = simpleViewComponents[activeView];
    return ViewComponent ? <ViewComponent /> : null;
  };

  return (
    <DarkModeContext.Provider value={darkMode}>
    <div className={`min-h-screen -m-3 sm:-m-4 lg:-m-5 transition-colors duration-200 ${darkMode ? "bg-[#0f0f0f]" : "bg-gray-50"}`}>

      {/* Mobile tab bar */}
      <div className={`lg:hidden overflow-x-auto scrollbar-hide border-b sticky top-0 z-50 transition-colors duration-200 ${
        darkMode
          ? "bg-[#171717] border-white/[0.06]"
          : "bg-white border-gray-200"
      }`}>
        <div className="flex min-w-max items-center">
          {mobileNavItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors relative ${
                  isActive
                    ? darkMode ? "text-blue-400" : "text-blue-600"
                    : darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive
                    ? darkMode ? "text-blue-400" : "text-blue-600"
                    : darkMode ? "text-gray-500" : "text-gray-400"
                }`} />
                {item.label}
                {isActive && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${darkMode ? "bg-blue-500" : "bg-blue-600"}`} />
                )}
              </button>
            );
          })}

          {/* Dark mode toggle — mobile */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors ml-auto flex-shrink-0 ${
              darkMode ? "text-gray-400" : "text-gray-400"
            }`}
          >
            {darkMode
              ? <IoSunnyOutline className="w-5 h-5 text-amber-400" />
              : <IoMoonOutline className="w-5 h-5 text-gray-400" />
            }
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* Top bar - desktop only (fixed) */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <TopBar
          onNavigate={setActiveView}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      </div>

      {/* Sidebar - desktop only (fixed like real dashboard) */}
      <div className="hidden lg:block fixed left-0 top-12 bottom-0 z-40">
        <Sidebar activeView={activeView} onViewChange={setActiveView} darkMode={darkMode} />
      </div>

      {/* Main content area */}
      <div className={`lg:pl-14 lg:pt-12 min-h-screen transition-colors duration-200 ${darkMode ? "bg-[#0f0f0f]" : "bg-gray-50"}`}>
        <div className={`h-[calc(100vh-0px)] lg:h-[calc(100vh-48px)] overflow-hidden transition-colors duration-200 ${darkMode ? "bg-[#111111]" : "bg-white"}`}>
          {renderActiveView()}
        </div>
      </div>
    </div>
    </DarkModeContext.Provider>
  );
}
