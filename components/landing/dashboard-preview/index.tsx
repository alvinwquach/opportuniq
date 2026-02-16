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
import { DiagnoseView } from './views/DiagnoseView';
import { IssuesView } from './views/IssuesView';
import { GroupsView } from './views/GroupsView';
import { CalendarView } from './views/CalendarView';
import { FinancesView } from './views/FinancesView';
import { GuidesView } from './views/GuidesView';
import { SettingsView } from './views/SettingsView';
import {
  IoGridOutline,
  IoScanOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
  IoMedkitOutline,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const viewComponents: Record<ViewType, React.ComponentType> = {
  dashboard: DashboardView,
  diagnose: DiagnoseView,
  issues: IssuesView,
  groups: GroupsView,
  calendar: CalendarView,
  finances: FinancesView,
  guides: GuidesView,
  settings: SettingsView,
};

const mobileNavItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: IoGridOutline },
  { id: 'diagnose' as ViewType, label: 'Diagnose', icon: IoScanOutline },
  { id: 'issues' as ViewType, label: 'Issues', icon: IoAlertCircleOutline },
  { id: 'groups' as ViewType, label: 'Groups', icon: IoPeopleOutline },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: IoCalendarOutline },
  { id: 'finances' as ViewType, label: 'Finances', icon: IoWalletOutline },
  { id: 'guides' as ViewType, label: 'Guides', icon: IoBookOutline },
];

interface DashboardPreviewProps {
  variant?: 'light' | 'dark';
}

export function DashboardPreview({ variant = 'light' }: DashboardPreviewProps) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const sectionRef = useRef<HTMLElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';
  const ActiveViewComponent = viewComponents[activeView];

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
    <section ref={sectionRef} id="demo" className={`relative py-20 lg:py-28 overflow-x-clip ${isDark ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-gradient-to-b from-white/[0.02] via-transparent to-transparent' : 'bg-gradient-to-b from-white via-slate-50 to-slate-100'}`} />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Everything in one place
          </h2>
          <p className={`text-base lg:text-lg max-w-2xl mx-auto ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
            Track issues, manage projects, and get instant diagnoses—all from a single dashboard.
          </p>
        </div>

        {/* Browser mockup with perspective - laptop opening effect */}
        <div style={{ perspective: '1500px', perspectiveOrigin: 'center top' }}>
          <div
            ref={browserRef}
            className="relative will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <BrowserChrome activeView={activeView}>
            {/* Mobile tab bar */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide border-b border-white/[0.06] bg-[#111111]">
              <div className="flex min-w-max">
                {mobileNavItems.map((item) => {
                  const isActive = activeView === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.id)}
                      className={`
                        flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors relative
                        ${isActive ? 'text-emerald-400' : 'text-white/60'}
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-white/50'}`} />
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                      )}
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
              {/* Sidebar - desktop only */}
              <div className="hidden lg:block h-full">
                <Sidebar activeView={activeView} onViewChange={handleViewChange} />
              </div>

              {/* Main content area - scrollable */}
              <div className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <NavigationContext.Provider value={navigationContextValue}>
                  <ActiveViewComponent />
                </NavigationContext.Provider>
              </div>
            </div>
            </BrowserChrome>
          </div>
        </div>

        {/* Feature highlights below demo */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 lg:gap-8">
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${isDark ? 'bg-teal-500/10' : 'bg-emerald-100'}`}>
              <IoPeopleOutline className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-emerald-700'}`} />
            </div>
            <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Shared Collaboration</h3>
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Share issues and decisions with family or roommates</p>
          </div>
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${isDark ? 'bg-teal-500/10' : 'bg-emerald-100'}`}>
              <IoMedkitOutline className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-emerald-600'}`} />
            </div>
            <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Smart Diagnostics</h3>
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Get instant analysis with parts and cost estimates</p>
          </div>
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-100'}`}>
              <IoBookOutline className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            </div>
            <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Step-by-Step Guides</h3>
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Follow detailed instructions at your own pace</p>
          </div>
        </div>
      </div>
    </section>
  );
}
