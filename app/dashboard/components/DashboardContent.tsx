"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IoSearch } from "react-icons/io5";
import { FiCommand } from "react-icons/fi";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { CalendarPreview } from "./CalendarPreview";
import { SearchCommand } from "./SearchCommand";
import { InlineIncomeSetup } from "./InlineIncomeSetup";
import { Breadcrumbs } from "./Breadcrumbs";
import { LiveChatWidget } from "@/components/chat/LiveChatWidget";
import { AmplitudeIdentify } from "./AmplitudeIdentify";

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
  const { isCollapsed } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Global keyboard shortcut for command palette
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <main
      className={cn(
        "flex-1 transition-[margin] duration-200 ease-out",
        isCollapsed ? "lg:ml-17" : "lg:ml-56"
      )}
    >
      <div className="hidden lg:flex h-12 items-center justify-between px-4 sticky top-0 z-30 bg-[#0c0c0c] border-b border-[#1f1f1f]">
        <div className="flex items-center gap-4 flex-1 min-w-0 ml-4">
          <div className="relative flex-1 max-w-[500px] min-w-[200px] xl:min-w-[300px]">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666] pointer-events-none" />
            <input
              type="text"
              placeholder="Search commands, issues, groups..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!searchOpen) {
                  setSearchOpen(true);
                }
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                  e.preventDefault();
                  setSearchOpen(true);
                }
              }}
              className={cn(
                "w-full pl-10 pr-20 py-2 rounded-lg bg-[#161616] border border-[#1f1f1f] text-white placeholder:text-[#666]",
                "hover:border-[#2a2a2a] focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/20",
                "transition-all text-[13px]"
              )}
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#888] border border-[#2a2a2a] pointer-events-none">
              <FiCommand className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CalendarPreview events={calendarEvents} />
          <NotificationDropdown notifications={notifications} />
          <div className="w-px h-5 mx-1 bg-[#1f1f1f]" />
          <UserMenu
            user={user}
            isAdmin={isAdmin}
            financials={financials}
            onAddIncome={() => setIncomeOpen(true)}
          />
        </div>
      </div>
      <div className="min-h-screen pt-12 lg:pt-0 bg-[#0c0c0c] relative">
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #5eead430 1px, transparent 1px)`,
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
        onOpenChange={(open) => {
          setSearchOpen(open);
          if (!open) {
            setSearchQuery("");
          }
        }}
        initialQuery={searchQuery}
        onAddIncome={() => {
          setSearchOpen(false);
          setIncomeOpen(true);
        }}
      />
      <InlineIncomeSetup
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
        userId={user.id}
      />
      {user.accessTier && user.role && (
        <LiveChatWidget
          userId={user.id}
          userEmail={user.email}
          userName={user.name}
          accessTier={user.accessTier}
          role={user.role}
        />
      )}
      <AmplitudeIdentify
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
