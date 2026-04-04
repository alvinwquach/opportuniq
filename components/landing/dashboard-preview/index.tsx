"use client";

import { useState, useCallback, useMemo } from 'react';
import { BrowserChrome } from './BrowserChrome';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ViewType } from './types';
import { NavigationContext } from './NavigationContext';
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { GroupsView } from './views/GroupsView';
import { CalendarView } from './views/CalendarView';
import { FinancesView } from './views/FinancesView';
import { GuidesView } from './views/GuidesView';
import { SettingsView } from './views/SettingsView';
import {
  IoGridOutline,
  IoFolderOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
} from "react-icons/io5";

const viewComponents: Record<ViewType, React.ComponentType> = {
  dashboard: DashboardView,
  projects:  ProjectsView,
  calendar:  CalendarView,
  finances:  FinancesView,
  guides:    GuidesView,
  groups:    GroupsView,
  settings:  SettingsView,
};

// Preview-mode ProjectsView — starts in complete state so visitors see full UI
const ProjectsViewPreview = () => <ProjectsView previewMode />;
const previewViewComponents: Record<ViewType, React.ComponentType> = {
  ...viewComponents,
  projects:  ProjectsViewPreview,
};

const mobileNavItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: IoGridOutline                },
  { id: 'projects'  as ViewType, label: 'Projects',  icon: IoFolderOutline               },
  { id: 'calendar'  as ViewType, label: 'Calendar',  icon: IoCalendarOutline             },
  { id: 'finances'  as ViewType, label: 'Finances',  icon: IoWalletOutline               },
  { id: 'guides'    as ViewType, label: 'Guides',    icon: IoBookOutline                 },
];

interface DashboardPreviewProps {
  variant?: 'light' | 'dark';
}

export function DashboardPreview({ variant = 'light' }: DashboardPreviewProps) {
  const [activeView, setActiveView] = useState<ViewType>('projects');

  const ActiveViewComponent = previewViewComponents[activeView];

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  const navigationContextValue = useMemo(() => ({
    navigate: handleViewChange,
  }), [handleViewChange]);

  return (
    <section id="demo" className="relative overflow-x-clip">
      <div className="relative">
        <BrowserChrome activeView={activeView}>
          {/* Mobile tab bar */}
          <div className="lg:hidden overflow-x-auto scrollbar-hide border-b border-gray-200 bg-white">
            <div className="flex min-w-max">
              {mobileNavItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors relative ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.label}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top bar - desktop only */}
          <div className="hidden lg:block">
            <TopBar onNavigate={handleViewChange} />
          </div>

          {/* Desktop layout with sidebar */}
          <div className="flex h-[560px] lg:h-[640px]">
            <div className="hidden lg:block h-full">
              <Sidebar activeView={activeView} onViewChange={handleViewChange} />
            </div>
            <div className="flex-1 min-w-0 h-full overflow-x-hidden scrollbar-auto-hide">
              <NavigationContext.Provider value={navigationContextValue}>
                <ActiveViewComponent />
              </NavigationContext.Provider>
            </div>
          </div>
        </BrowserChrome>
      </div>
    </section>
  );
}
