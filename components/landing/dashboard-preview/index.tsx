"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import { DecisionsView } from './views/DecisionsView';
import { DiagnoseView } from './views/DiagnoseView';
import {
  IoGridOutline,
  IoFolderOutline,
  IoChatbubbleEllipsesOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
  IoScaleOutline,
  IoPeopleOutline,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const viewComponents: Record<ViewType, React.ComponentType> = {
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

// Preview-mode ProjectsView — starts in complete state so visitors see full UI
const ProjectsViewPreview = () => <ProjectsView previewMode />;
const previewViewComponents: Record<ViewType, React.ComponentType> = {
  ...viewComponents,
  projects:  ProjectsViewPreview,
};

const mobileNavItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: IoGridOutline                },
  { id: 'projects'  as ViewType, label: 'Projects',  icon: IoFolderOutline               },
  { id: 'diagnose'  as ViewType, label: 'Diagnose',  icon: IoChatbubbleEllipsesOutline   },
  { id: 'calendar'  as ViewType, label: 'Calendar',  icon: IoCalendarOutline             },
  { id: 'finances'  as ViewType, label: 'Finances',  icon: IoWalletOutline               },
  { id: 'guides'    as ViewType, label: 'Guides',    icon: IoBookOutline                 },
  { id: 'decisions' as ViewType, label: 'Decisions', icon: IoScaleOutline                },
  { id: 'groups'    as ViewType, label: 'Groups',    icon: IoPeopleOutline               },
];

interface DashboardPreviewProps {
  variant?: 'light' | 'dark';
}

export function DashboardPreview({ variant = 'light' }: DashboardPreviewProps) {
  const [activeView, setActiveView] = useState<ViewType>('projects');
  const sectionRef = useRef<HTMLElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';
  const ActiveViewComponent = previewViewComponents[activeView];

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  const navigationContextValue = useMemo(() => ({
    navigate: handleViewChange,
  }), [handleViewChange]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Set initial state - tilted back like a laptop being opened
      gsap.set(browserRef.current, {
        rotateX: 45,
        scale: 0.85,
        opacity: 0.3,
        y: 100,
        transformOrigin: 'center bottom',
      });

      // Animate to flat as user scrolls
      gsap.to(browserRef.current, {
        rotateX: 0,
        scale: 1,
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          end: 'top 20%',
          scrub: 0.8,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="demo" className="relative overflow-x-clip">
      <div className="relative">
        {/* Browser mockup */}
        <div style={{ perspective: '1800px', perspectiveOrigin: 'center 30%' }}>
          <div
            ref={browserRef}
            className="relative will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
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
              <div className="flex h-[500px] lg:h-[530px]">
                <div className="hidden lg:block h-full">
                  <Sidebar activeView={activeView} onViewChange={handleViewChange} />
                </div>
                <div className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  <NavigationContext.Provider value={navigationContextValue}>
                    <ActiveViewComponent />
                  </NavigationContext.Provider>
                </div>
              </div>
            </BrowserChrome>
          </div>
        </div>
      </div>
    </section>
  );
}
