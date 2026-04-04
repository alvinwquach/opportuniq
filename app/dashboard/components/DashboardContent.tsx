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
      <header className="hidden lg:flex h-12 items-center justify-between px-4 sticky top-0 z-30 bg-white border-b border-gray-200">
        {/* Center: Search trigger */}
        <div className="flex flex-1 max-w-md">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-full h-8 pl-9 pr-3 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-400 hover:border-white/[0.15] hover:text-gray-500 transition-colors text-left flex items-center justify-between"
          >
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <span>Search issues, guides...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded">
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
                onClick={() => router.push("/dashboard/projects?new=true")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
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
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoSettingsOutline className="w-5 h-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Settings</TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-100 mx-1" />

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
      <div className="min-h-screen pt-12 lg:pt-0 bg-gray-50 relative scrollbar-light">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #2563EB20 1px, transparent 1px)`,
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
