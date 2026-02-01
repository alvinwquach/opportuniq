"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IoNotificationsOutline,
  IoSearchOutline,
  IoClose,
  IoChevronDown,
  IoSettingsOutline,
  IoShield,
} from "react-icons/io5";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { AdminUserMenu } from "./AdminUserMenu";
import { cn } from "@/lib/utils";

interface AdminContentProps {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    postalCode?: string | null;
  };
}

export function AdminContent({ children, user }: AdminContentProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

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

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

  return (
    <>
      <main className="flex-1 min-w-0 bg-[#111111] lg:ml-14">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex h-12 items-center justify-between px-4 border-b border-white/[0.06] bg-[#111111] sticky top-0 z-20">
          {/* Left: Admin badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10">
              <IoShield className="h-3 w-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Admin Panel</span>
            </div>
          </div>

          {/* Center: Search trigger */}
          <div className="flex-1 max-w-md mx-8">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="relative w-full h-8 pl-9 pr-3 text-sm bg-[#171717] border border-white/10 rounded-lg text-[#555] hover:border-white/[0.1] hover:text-[#888] transition-colors text-left flex items-center justify-between"
            >
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <span>Search admin pages...</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#555] bg-[#111111] border border-white/[0.06] rounded">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={cn(
                  "relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
                  notificationsOpen
                    ? "text-white bg-white/[0.04]"
                    : "text-[#666] hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <IoNotificationsOutline className="w-5 h-5" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#171717] border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <span className="text-sm font-medium text-white">Notifications</span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 rounded text-[#666] hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <IoClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="px-4 py-8 text-center">
                      <IoNotificationsOutline className="h-8 w-8 text-[#333] mx-auto mb-2" />
                      <p className="text-sm text-[#666]">No notifications</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              href="/admin/settings"
              className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <IoSettingsOutline className="w-5 h-5" />
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-white/[0.06] mx-1" />

            {/* User Menu */}
            <AdminUserMenu user={user} />
          </div>
        </header>

        {/* Content */}
        <div className="min-h-screen pt-12 lg:pt-0 bg-[#111111]">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <AdminCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
}
