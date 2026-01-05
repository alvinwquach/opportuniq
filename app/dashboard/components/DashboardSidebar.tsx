"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoGrid,
  IoPeople,
  IoAlertCircle,
  IoSettings,
  IoLogOut,
  IoMenu,
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoBook,
  IoNotifications,
  IoCalendar,
  IoShield,
  IoPersonAdd,
  IoCamera,
  IoScan,
} from "react-icons/io5";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReportIssueModal } from "./sections/ReportIssueModal";
import { InviteFriendsModal } from "./InviteFriendsModal";

const sidebarLinks = [
  { href: "/dashboard", icon: IoGrid, label: "Dashboard", exact: true },
  { href: "/dashboard/diagnose", icon: IoScan, label: "Diagnose" },
  { href: "/issues", icon: IoAlertCircle, label: "Issues" },
  { href: "/groups", icon: IoPeople, label: "Groups" },
  { href: "/calendar", icon: IoCalendar, label: "Calendar" },
  { href: "/guides", icon: IoBook, label: "Guides" },
  { href: "/dashboard/settings", icon: IoSettings, label: "Settings" },
];

interface DashboardSidebarProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  isAdmin?: boolean;
  accessTier?: "johatsu" | "alpha" | "beta" | "public";
}

export function DashboardSidebar({ user, isAdmin = false, accessTier }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile } = useSidebar();

  // Check if user can invite (johatsu, alpha, or beta users)
  const canInvite = accessTier === "johatsu" || accessTier === "alpha" || accessTier === "beta";

  const showExpanded = !isCollapsed;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col bg-[#0c0c0c] border-r border-[#1f1f1f]",
          "transition-[width] duration-200 ease-out",
          showExpanded ? "w-56" : "w-17"
        )}
      >
        <div
          className={cn(
            "flex h-12 items-center border-b border-[#1f1f1f] transition-all duration-200 flex-shrink-0",
            showExpanded ? "px-3 justify-between" : "px-1.5 justify-center"
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-[#00D4FF]/10 border border-[#00D4FF]/20">
              <svg viewBox="0 0 100 100" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="#00D4FF" strokeWidth="4" fill="none" />
                <circle cx="50" cy="45" r="12" stroke="#00D4FF" strokeWidth="4" fill="none" strokeDasharray="60 25" transform="rotate(-90 50 45)" />
                <path d="M 58 53 L 68 63" stroke="#00D4FF" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="45" r="4" fill="#00D4FF" />
              </svg>
            </div>
            {showExpanded && (
              <span className="text-[13px] font-semibold text-white">OpportunIQ</span>
            )}
          </Link>
        </div>
        <div className={cn("py-2 transition-all duration-200 flex-shrink-0", showExpanded ? "px-2" : "px-1.5")}>
          {showExpanded ? (
            <ReportIssueModal
              variant="sidebar"
              trigger={
                <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-colors">
                  <IoCamera className="h-4 w-4 shrink-0" />
                  <span className="font-medium">New Issue</span>
                </button>
              }
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ReportIssueModal
                    variant="sidebar"
                    trigger={
                      <button className="flex items-center justify-center w-9 h-9 mx-auto rounded-md bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-colors">
                        <IoCamera className="h-4 w-4 shrink-0" />
                      </button>
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                New Issue
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <nav className={cn("flex-1 py-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent", showExpanded ? "px-2" : "px-1.5")}>
          {isAdmin && showExpanded && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors mb-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20"
              )}
            >
              <IoShield className="h-4 w-4 shrink-0" />
              <span className="text-[13px] font-medium">Admin</span>
            </Link>
          )}
          {isAdmin && !showExpanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin"
                  className="flex items-center justify-center w-9 h-9 mx-auto rounded-md text-amber-500 hover:bg-amber-500/10 border border-amber-500/20 transition-colors mb-2"
                >
                  <IoShield className="h-4 w-4 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Admin Dashboard
              </TooltipContent>
            </Tooltip>
          )}
          {/* Invite Friends - visible to johatsu, alpha, and beta users */}
          {canInvite && showExpanded && (
            <InviteFriendsModal userId={user.id} variant="sidebar" />
          )}
          {canInvite && !showExpanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <InviteFriendsModal userId={user.id} variant="sidebar-collapsed" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Invite Friends
              </TooltipContent>
            </Tooltip>
          )}
          {sidebarLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            const linkContent = (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-md transition-colors mb-0.5",
                  showExpanded
                    ? "gap-2.5 px-2.5 py-2"
                    : "justify-center w-9 h-9 mx-auto",
                  active
                    ? "bg-[#00D4FF]/10 text-[#00D4FF] font-medium"
                    : "text-[#888] hover:text-white hover:bg-[#1f1f1f]"
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {showExpanded && (
                  <span className="text-[13px]">{link.label}</span>
                )}
              </Link>
            );

            if (showExpanded) {
              return <div key={link.href}>{linkContent}</div>;
            }

            return (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {link.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        {/* Collapse/Expand button - positioned absolutely at top right, overlapping sidebar */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleCollapsed}
              className="absolute top-3 -right-3 w-6 h-6 flex items-center justify-center rounded-full bg-[#1f1f1f] border border-[#333] text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors shadow-md z-50"
              aria-label={showExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {showExpanded ? (
                <IoChevronBack className="h-3 w-3" />
              ) : (
                <IoChevronForward className="h-3 w-3" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="z-[60]">
            {showExpanded ? "Collapse sidebar" : "Expand sidebar"}
          </TooltipContent>
        </Tooltip>
      </aside>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 lg:hidden transition-transform duration-300 ease-in-out bg-[#0c0c0c] border-r border-[#1f1f1f]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-12 items-center justify-between px-3 border-b border-[#1f1f1f]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#00D4FF]/10 border border-[#00D4FF]/20">
                <svg viewBox="0 0 100 100" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="#00D4FF" strokeWidth="4" fill="none" />
                  <circle cx="50" cy="45" r="12" stroke="#00D4FF" strokeWidth="4" fill="none" strokeDasharray="60 25" transform="rotate(-90 50 45)" />
                  <path d="M 58 53 L 68 63" stroke="#00D4FF" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="50" cy="45" r="4" fill="#00D4FF" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-white">OpportunIQ</span>
            </Link>
            <button
              onClick={closeMobile}
              className="p-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors"
            >
              <IoClose className="h-4 w-4" />
            </button>
          </div>
          <div className="px-2 py-2">
            <ReportIssueModal
              variant="sidebar"
              trigger={
                <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] font-medium bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-colors">
                  <IoCamera className="h-4 w-4" />
                  New Issue
                </button>
              }
            />
          </div>
          <nav className="flex-1 px-2 py-1">
            {/* Invite Friends - mobile */}
            {canInvite && (
              <InviteFriendsModal userId={user.id} variant="sidebar" />
            )}
            {sidebarLinks.map((link) => {
              const active = isActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors mb-0.5",
                    active
                      ? "bg-[#00D4FF]/10 text-[#00D4FF] font-medium"
                      : "text-[#888] hover:text-white hover:bg-[#1f1f1f]"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="text-[13px]">{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-2 border-t border-[#1f1f1f]">
            <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium bg-[#1f1f1f] text-[#888]">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate text-white">
                  {user.name || "User"}
                </p>
                <p className="text-[11px] truncate text-[#888]">{user.email}</p>
              </div>
            </div>
            <Link
              href="/auth/logout"
              className="flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors text-[13px] text-red-400 hover:bg-red-500/10"
            >
              <IoLogOut className="h-4 w-4" />
              Sign out
            </Link>
          </div>
        </div>
      </aside>
      <header className="fixed top-0 left-0 right-0 z-30 h-12 flex items-center px-3 lg:hidden bg-[#0c0c0c] border-b border-[#1f1f1f]">
        <button
          onClick={toggleMobile}
          className="p-1.5 -ml-1 rounded-md text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors"
        >
          <IoMenu className="h-4 w-4" />
        </button>
        <Link href="/" className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#00D4FF]/10 border border-[#00D4FF]/20">
            <svg viewBox="0 0 100 100" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="#00D4FF" strokeWidth="4" fill="none" />
              <circle cx="50" cy="45" r="12" stroke="#00D4FF" strokeWidth="4" fill="none" strokeDasharray="60 25" transform="rotate(-90 50 45)" />
              <path d="M 58 53 L 68 63" stroke="#00D4FF" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="45" r="4" fill="#00D4FF" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-white">OpportunIQ</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/notifications"
            className="p-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors relative"
          >
            <IoNotifications className="h-4 w-4" />
          </Link>
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || "User"}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium bg-[#1f1f1f] text-[#888]">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
