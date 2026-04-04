"use client";

import { ViewType } from './types';

interface BrowserChromeProps {
  children: React.ReactNode;
  activeView: ViewType;
}

const viewPaths: Record<ViewType, string> = {
  dashboard: 'dashboard',
  projects:  'projects',
  calendar:  'calendar',
  finances:  'finances',
  guides:    'guides',
  groups:    'groups',
  settings:  'settings',
};

export function BrowserChrome({ children, activeView }: BrowserChromeProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-300/30">
      {/* Browser header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-500 min-w-[280px]">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>www.opportuniq.app/{viewPaths[activeView]}</span>
          </div>
        </div>

        {/* Spacer for symmetry */}
        <div className="w-[52px]" />
      </div>

      {/* Browser content */}
      <div className="bg-white">
        {children}
      </div>
    </div>
  );
}
