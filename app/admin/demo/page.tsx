"use client";

import { useState } from "react";
import { Sidebar } from "@/components/landing/dashboard-preview/Sidebar";
import { TopBar } from "@/components/landing/dashboard-preview/TopBar";
import { ViewType } from "@/components/landing/dashboard-preview/types";
import { DashboardView } from "@/components/landing/dashboard-preview/views/DashboardView";
import { DiagnoseView } from "@/components/landing/dashboard-preview/views/DiagnoseView";
import { IssuesView } from "@/components/landing/dashboard-preview/views/IssuesView";
import { GroupsView } from "@/components/landing/dashboard-preview/views/GroupsView";
import { CalendarView } from "@/components/landing/dashboard-preview/views/CalendarView";
import { FinancesView } from "@/components/landing/dashboard-preview/views/FinancesView";
import { GuidesView } from "@/components/landing/dashboard-preview/views/GuidesView";
import { SettingsView } from "@/components/landing/dashboard-preview/views/SettingsView";
import {
  IoGridOutline,
  IoScanOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
} from "react-icons/io5";

// View components that don't need props
const simpleViewComponents: Partial<Record<ViewType, React.ComponentType>> = {
  dashboard: DashboardView,
  diagnose: DiagnoseView,
  groups: GroupsView,
  calendar: CalendarView,
  finances: FinancesView,
  guides: GuidesView,
  settings: SettingsView,
};

const mobileNavItems = [
  { id: "dashboard" as ViewType, label: "Dashboard", icon: IoGridOutline },
  { id: "diagnose" as ViewType, label: "Diagnose", icon: IoScanOutline },
  { id: "issues" as ViewType, label: "Issues", icon: IoAlertCircleOutline },
  { id: "groups" as ViewType, label: "Groups", icon: IoPeopleOutline },
  { id: "calendar" as ViewType, label: "Calendar", icon: IoCalendarOutline },
  { id: "finances" as ViewType, label: "Finances", icon: IoWalletOutline },
  { id: "guides" as ViewType, label: "Guides", icon: IoBookOutline },
];

export default function AdminDemoPage() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  // Handle navigation from IssuesView to DiagnoseView
  const handleNavigateToIssue = (issueId: string) => {
    // Navigate to diagnose view (in real app, would also pass issueId)
    setActiveView("diagnose");
  };

  // Render active view with props where needed
  const renderActiveView = () => {
    if (activeView === "issues") {
      return <IssuesView onNavigateToIssue={handleNavigateToIssue} />;
    }
    const ViewComponent = simpleViewComponents[activeView];
    return ViewComponent ? <ViewComponent /> : null;
  };

  return (
    <div className="min-h-screen bg-[#111111] -m-3 sm:-m-4 lg:-m-5">
      {/* Mobile tab bar */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide border-b border-white/[0.06] bg-[#171717] sticky top-0 z-50">
        <div className="flex min-w-max">
          {mobileNavItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors relative
                  ${isActive ? "text-emerald-400" : "text-[#888]"}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-[#666]"}`} />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top bar - desktop only (fixed) */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <TopBar onNavigate={setActiveView} />
      </div>

      {/* Sidebar - desktop only (fixed like real dashboard) */}
      <div className="hidden lg:block fixed left-0 top-12 bottom-0 z-40">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Main content area */}
      <div className="lg:pl-14 lg:pt-12 min-h-screen">
        {renderActiveView()}
      </div>
    </div>
  );
}
