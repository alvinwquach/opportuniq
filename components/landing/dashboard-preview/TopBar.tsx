"use client";

import { useState, useEffect, useRef } from "react";
import {
  IoNotificationsOutline,
  IoSearchOutline,
  IoCamera,
  IoChevronDown,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTimeOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { OpportunIQLogo } from "../OpportunIQLogo";
import { CommandPalette } from "./CommandPalette";
import { ViewType } from "./types";

interface TopBarProps {
  onNewIssue?: () => void;
  onNavigate?: (view: ViewType) => void;
}

const mockNotifications = [
  { id: 1, title: "AC repair quote received", time: "2 min ago", type: "success" },
  { id: 2, title: "Leaky faucet marked urgent", time: "1 hour ago", type: "alert" },
  { id: 3, title: "New guide: Fix garbage disposal", time: "3 hours ago", type: "info" },
];

export function TopBar({ onNewIssue, onNavigate }: TopBarProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="md:hidden w-8 h-8 flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                <IoSearchOutline className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Search</TooltipContent>
          </Tooltip>

          {/* New Issue Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onNavigate?.("diagnose")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-[#111111] text-xs font-medium rounded-lg transition-colors"
              >
                <IoCamera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Issue</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">New Issue</TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative w-8 h-8 flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                >
                  <IoNotificationsOutline className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Notifications</TooltipContent>
            </Tooltip>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2a2a2a]">
                  <h3 className="text-sm font-medium text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-[#252525] transition-colors cursor-pointer border-b border-[#2a2a2a] last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          notification.type === "success" ? "bg-emerald-500/20" :
                          notification.type === "alert" ? "bg-amber-500/20" : "bg-blue-500/20"
                        }`}>
                          {notification.type === "success" && <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />}
                          {notification.type === "alert" && <IoAlertCircle className="w-4 h-4 text-amber-400" />}
                          {notification.type === "info" && <IoTimeOutline className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white">{notification.title}</p>
                          <p className="text-[10px] text-[#666] mt-0.5">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-[#2a2a2a]">
                  <button className="w-full text-xs text-emerald-400 hover:text-emerald-300 font-medium py-1">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[#171717] mx-1" />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-medium text-black">
                U
              </div>
              <IoChevronDown className={`w-3.5 h-3.5 text-[#666] hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-base font-medium text-black">
                      U
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">User</p>
                      <p className="text-xs text-[#666]">user@example.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate?.("settings");
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#888] hover:text-white hover:bg-[#252525] transition-colors"
                  >
                    <IoPersonOutline className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate?.("settings");
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#888] hover:text-white hover:bg-[#252525] transition-colors"
                  >
                    <IoSettingsOutline className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#888] hover:text-white hover:bg-[#252525] transition-colors"
                  >
                    <IoHelpCircleOutline className="w-4 h-4" />
                    Help & Support
                  </button>
                </div>

                {/* Sign Out */}
                <div className="border-t border-[#2a2a2a] py-1">
                  <button
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:bg-[#252525] transition-colors"
                  >
                    <IoLogOutOutline className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
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
