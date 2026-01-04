"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import {
  IoGrid,
  IoPeople,
  IoMail,
  IoBarChart,
  IoSettings,
  IoLogOut,
  IoShield,
  IoSend,
  IoShare,
  IoMenu,
  IoClose,
  IoRocket,
  IoChevronBack,
  IoChevronForward,
  IoChatbubble,
  IoHome,
} from "react-icons/io5";
import { MdSlideshow } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarLinks = [
  { href: "/admin", icon: IoGrid, label: "Admin Dashboard", exact: true },
  { href: "/admin/users", icon: IoPeople, label: "Users" },
  { href: "/admin/invites", icon: IoSend, label: "Invites" },
  { href: "/admin/referrals", icon: IoShare, label: "Referrals" },
  { href: "/admin/waitlist", icon: IoMail, label: "Waitlist" },
  { href: "/admin/analytics", icon: IoBarChart, label: "Analytics" },
  { href: "/admin/support", icon: IoChatbubble, label: "Support" },
  { href: "/admin/development", icon: IoRocket, label: "Development" },
  { href: "/admin/presentation", icon: MdSlideshow, label: "Presentation" },
  { href: "/admin/settings", icon: IoSettings, label: "Settings" },
];

interface AdminSidebarProps {
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile } = useSidebar();

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
          "fixed left-0 top-0 z-40 h-screen border-r border-[#1f1f1f] hidden lg:flex flex-col",
          "bg-[#0c0c0c] transition-[width] duration-200 ease-out",
          showExpanded ? "w-56" : "w-17"
        )}
      >
        <div className={cn(
          "flex h-12 items-center border-b border-[#1f1f1f] transition-all duration-200",
          showExpanded ? "px-3 justify-between" : "px-1.5 justify-center"
        )}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#1f1f1f] flex items-center justify-center flex-shrink-0">
              <OpportunIQLogo className="h-4 w-4" />
            </div>
            {showExpanded && (
              <span className="text-[13px] font-semibold text-white">OpportunIQ</span>
            )}
          </Link>
        </div>
        <div className={cn("py-2 transition-all duration-200", showExpanded ? "px-2" : "px-1.5")}>
          {showExpanded ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10">
              <IoShield className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-medium text-amber-500">Admin</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-9 h-9 mx-auto rounded-md bg-amber-500/10">
                  <IoShield className="h-4 w-4 text-amber-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Admin Panel
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <nav className={cn("flex-1 py-1", showExpanded ? "px-2" : "px-1.5")}>
          {showExpanded && (
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors mb-2 text-[#00D4FF] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 border border-[#00D4FF]/20"
              )}
            >
              <IoHome className="h-4 w-4 shrink-0" />
              <span className="text-[13px] font-medium">User Dashboard</span>
            </Link>
          )}
          {!showExpanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center w-9 h-9 mx-auto rounded-md text-[#00D4FF] hover:bg-[#00D4FF]/10 border border-[#00D4FF]/20 transition-colors mb-2"
                >
                  <IoHome className="h-4 w-4 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                User Dashboard
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
                  "flex items-center rounded-md transition-colors mb-0.5 relative",
                  showExpanded
                    ? "gap-2.5 px-2.5 py-2"
                    : "justify-center w-9 h-9 mx-auto",
                  active
                    ? "bg-[#1f1f1f] text-white"
                    : "text-[#888] hover:text-white hover:bg-[#161616]"
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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleCollapsed}
              className="absolute top-3 -right-3 w-6 h-6 flex items-center justify-center rounded-full bg-[#1f1f1f] border border-[#333] text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors shadow-md"
            >
              {showExpanded ? (
                <IoChevronBack className="h-3 w-3" />
              ) : (
                <IoChevronForward className="h-3 w-3" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {showExpanded ? "Collapse sidebar" : "Expand sidebar"}
          </TooltipContent>
        </Tooltip>
      </aside>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-[#1f1f1f] lg:hidden transition-transform duration-300 ease-in-out",
          "bg-[#0c0c0c]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-12 items-center justify-between border-b border-[#1f1f1f] px-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#1f1f1f] flex items-center justify-center">
                <OpportunIQLogo className="h-4 w-4" />
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
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10">
              <IoShield className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-medium text-amber-500">Admin</span>
            </div>
          </div>
          <div className="px-2 pb-2">
            <Link
              href="/dashboard"
              onClick={closeMobile}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-[#00D4FF] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 border border-[#00D4FF]/20"
            >
              <IoHome className="h-4 w-4" />
              <span className="text-[13px] font-medium">User Dashboard</span>
            </Link>
          </div>
          <nav className="flex-1 px-2 py-1">
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
                      ? "bg-[#1f1f1f] text-white"
                      : "text-[#888] hover:text-white hover:bg-[#161616]"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="text-[13px]">{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#1f1f1f] p-2">
            <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name || "Admin"}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[11px] font-medium text-[#888]">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">
                  {user.name || "Admin"}
                </p>
                <p className="text-[11px] text-[#666] truncate">{user.email}</p>
              </div>
            </div>
            <Link
              href="/auth/logout"
              className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-colors text-[13px]"
            >
              <IoLogOut className="h-4 w-4" />
              Sign out
            </Link>
          </div>
        </div>
      </aside>
      <header className="fixed top-0 left-0 right-0 z-30 h-12 border-b border-[#1f1f1f] bg-[#0c0c0c] flex items-center px-3 lg:hidden">
        <button
          onClick={toggleMobile}
          className="p-1.5 -ml-1 rounded-md text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors"
        >
          <IoMenu className="h-4 w-4" />
        </button>
        <Link href="/" className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-md bg-[#1f1f1f] flex items-center justify-center">
            <OpportunIQLogo className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-semibold text-white">OpportunIQ</span>
        </Link>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 ml-2">
          <IoShield className="h-2.5 w-2.5 text-amber-500" />
          <span className="text-[10px] font-medium text-amber-500">Admin</span>
        </div>
        <div className="ml-auto">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || "Admin"}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[10px] font-medium text-[#888]">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
