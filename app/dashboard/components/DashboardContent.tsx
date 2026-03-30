"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IoSearchOutline,
  IoSettingsOutline,
  IoCamera,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { CalendarPreview } from "./CalendarPreview";
import { SearchCommand } from "./SearchCommand";
import { InlineIncomeSetup } from "./InlineIncomeSetup";
import { PostHogIdentify } from "./PostHogIdentify";

interface DashboardContentProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    postalCode?: string | null;
    accessTier?: "johatsu" | "alpha" | "beta" | "public";
    role?: "admin" | "moderator" | "user" | "banned";
  };
  isAdmin?: boolean;
  financials?: {
    monthlyIncome: number;
    hourlyRate: number;
  } | null;
  notifications?: {
    id: string;
    type: "issue" | "decision" | "reminder" | "invite" | "completed";
    title: string;
    description: string;
    timestamp: Date;
    read: boolean;
    href?: string;
    groupName?: string;
  }[];
  calendarEvents?: {
    id: string;
    date: Date;
    type: "contractor" | "diy" | "wfh" | "away";
    title: string;
    time?: string;
    groupName?: string;
  }[];
}

export function DashboardContent({
  children,
  user,
  isAdmin = false,
  financials,
  notifications = [],
  calendarEvents = [],
}: DashboardContentProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  // Global keyboard shortcut for command palette
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  const handleSearchOpenChange = useCallback((open: boolean) => {
    setSearchOpen(open);
  }, []);

  const handleIncomeOpenChange = useCallback((open: boolean) => {
    setIncomeOpen(open);
  }, []);

  const handleAddIncomeFromSearch = useCallback(() => {
    setSearchOpen(false);
    setIncomeOpen(true);
  }, []);

  const handleAddIncomeFromMenu = useCallback(() => {
    setIncomeOpen(true);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <main className="flex-1 lg:ml-14">
      {/* Desktop TopBar */}
      <header className="hidden lg:flex h-12 items-center justify-between px-4 sticky top-0 z-30 bg-[#111111] border-b border-white/[0.06]">
        {/* Center: Search trigger */}
        <div className="flex flex-1 max-w-md">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-full h-8 pl-9 pr-3 text-sm bg-[#171717] border border-white/10 rounded-lg text-[#555] hover:border-white/[0.15] hover:text-[#888] transition-colors text-left flex items-center justify-between"
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
          {/* New Issue Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => router.push("/dashboard/diagnose?new=true")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-[#111111] text-xs font-medium rounded-lg transition-colors"
              >
                <IoCamera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Issue</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">New Issue</TooltipContent>
          </Tooltip>

          {/* Calendar */}
          <CalendarPreview events={calendarEvents} />

          {/* Notifications */}
          <NotificationDropdown notifications={notifications} />

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                <IoSettingsOutline className="w-5 h-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Settings</TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-6 bg-[#171717] mx-1" />

          {/* Profile */}
          <UserMenu
            user={user}
            isAdmin={isAdmin}
            financials={financials}
            onAddIncome={handleAddIncomeFromMenu}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="min-h-screen pt-12 lg:pt-0 bg-[#0f0f0f] relative scrollbar-dark">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #3ECF8E20 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          {children}
        </div>
      </div>
      <SearchCommand
        open={searchOpen}
        onOpenChange={handleSearchOpenChange}
        onAddIncome={handleAddIncomeFromSearch}
      />
      <InlineIncomeSetup
        open={incomeOpen}
        onOpenChange={handleIncomeOpenChange}
        userId={user.id}
      />
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        name={user.name}
        accessTier={user.accessTier || "alpha"}
        role={user.role || "user"}
        hasIncomeSetup={!!financials}
        hasLocation={!!user.postalCode}
        groupCount={0}
      />
    </main>
  );
}
