"use client";

import { useState, useEffect, useRef } from "react";
import {
  IoNotificationsOutline,
  IoSearchOutline,
  IoAddOutline,
  IoChevronDown,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTimeOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoLogOutOutline,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { OpportunIQLogo } from "../OpportunIQLogo";
import { CommandPalette } from "./CommandPalette";
import { ViewType } from "./types";

interface TopBarProps {
  onNewIssue?: () => void;
  onNavigate?: (view: ViewType) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const mockNotifications = [
  { id: 1, title: "AC repair quote received", body: "Johnson HVAC submitted a quote for $380", time: "2 min ago", type: "success", unread: true },
  { id: 2, title: "Leaky faucet marked urgent", body: "Kitchen faucet issue escalated by Jamie", time: "1 hr ago", type: "alert", unread: true },
  { id: 3, title: "New guide available", body: "Fix garbage disposal in 20 min \u2014 DIY", time: "3 hrs ago", type: "info", unread: false },
  { id: 4, title: "Garage door repair done", body: "Issue resolved \u2014 saved $215 vs pro quote", time: "Yesterday", type: "success", unread: false },
];

export function TopBar({ onNewIssue, onNavigate, darkMode = false, onToggleDarkMode }: TopBarProps) {
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
      <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <OpportunIQLogo className="w-7 h-7 text-blue-500" />
          <span className="font-semibold text-gray-900 text-sm hidden sm:block">OpportunIQ</span>
        </div>

        {/* Center: Search trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="relative w-full h-8 pl-9 pr-3 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors text-left flex items-center justify-between"
          >
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <span>Search issues, guides...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 rounded">
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
                className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                onClick={() => onNavigate?.("projects")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <IoAddOutline className="w-3.5 h-3.5" />
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
                  className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoNotificationsOutline className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Notifications</TooltipContent>
            </Tooltip>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    {mockNotifications.filter(n => n.unread).length} new
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-3 ${notification.unread ? "bg-blue-50/30" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notification.type === "success" ? "bg-green-50" :
                        notification.type === "alert" ? "bg-amber-50" : "bg-blue-50"
                      }`}>
                        {notification.type === "success" && <IoCheckmarkCircle className="w-4 h-4 text-green-600" />}
                        {notification.type === "alert" && <IoAlertCircle className="w-4 h-4 text-amber-600" />}
                        {notification.type === "info" && <IoTimeOutline className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-medium leading-snug ${notification.unread ? "text-gray-900" : "text-gray-700"}`}>
                            {notification.title}
                          </p>
                          {notification.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{notification.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                  <button className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-0.5">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          {onToggleDarkMode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleDarkMode}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {darkMode
                    ? <IoSunnyOutline className="w-4 h-4 text-amber-500" />
                    : <IoMoonOutline className="w-4 h-4" />
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{darkMode ? "Light mode" : "Dark mode"}</TooltipContent>
            </Tooltip>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                JM
              </div>
              <IoChevronDown className={`w-3.5 h-3.5 text-gray-500 hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-md z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                      JM
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Jamie M.</p>
                      <p className="text-xs text-gray-500">jamie@example.com</p>
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
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <IoPersonOutline className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate?.("settings");
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <IoSettingsOutline className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <IoHelpCircleOutline className="w-4 h-4" />
                    Help & Support
                  </button>
                </div>

                {/* Sign Out */}
                <div className="border-t border-gray-200 py-1">
                  <button
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-600 hover:text-red-700 hover:bg-gray-50 transition-colors"
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
