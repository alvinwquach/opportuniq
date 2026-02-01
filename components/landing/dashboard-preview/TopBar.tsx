"use client";

import { useState, useEffect } from "react";
import {
  IoSettingsOutline,
  IoNotificationsOutline,
  IoSearchOutline,
  IoCamera,
  IoChevronDown,
} from "react-icons/io5";
import { OpportunIQLogo } from "../OpportunIQLogo";
import { CommandPalette } from "./CommandPalette";
import { ViewType } from "./types";

interface TopBarProps {
  onNewIssue?: () => void;
  onNavigate?: (view: ViewType) => void;
}

export function TopBar({ onNewIssue, onNavigate }: TopBarProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-12 bg-[#111111] border-b border-white/[0.06] flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <OpportunIQLogo className="w-7 h-7 text-emerald-400" />
          <span className="font-semibold text-white text-sm hidden sm:block">OpportunIQ</span>
        </div>

        {/* Center: Search trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="relative w-full h-8 pl-9 pr-3 text-sm bg-[#171717] border border-white/10 rounded-lg text-[#555] hover:border-white/[0.1] hover:text-[#888] transition-colors text-left flex items-center justify-between"
          >
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <span>Search issues, guides...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#555] bg-[#111111] border border-white/[0.06] rounded">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
          >
            <IoSearchOutline className="w-5 h-5" />
          </button>

          {/* New Issue Button */}
          <button
            onClick={onNewIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-[#111111] text-xs font-medium rounded-lg transition-colors"
          >
            <IoCamera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Issue</span>
          </button>

          {/* Notifications */}
          <button className="relative w-8 h-8 flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors">
            <IoNotificationsOutline className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors">
            <IoSettingsOutline className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[#171717] mx-1" />

          {/* Profile */}
          <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-medium text-black">
              U
            </div>
            <IoChevronDown className="w-3.5 h-3.5 text-[#666] hidden sm:block" />
          </button>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={onNavigate}
      />
    </>
  );
}
