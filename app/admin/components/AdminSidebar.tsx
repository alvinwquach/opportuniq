"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import {
  IoGridOutline,
  IoPeopleOutline,
  IoMailOutline,
  IoBarChartOutline,
  IoSettingsOutline,
  IoSendOutline,
  IoShareOutline,
  IoRocketOutline,
  IoChatbubbleOutline,
  IoSparklesOutline,
  IoMenu,
  IoClose,
  IoLogOut,
  IoShield,
} from "react-icons/io5";
import { MdSlideshow } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import Image from "next/image";

const mainNavItems = [
  { href: "/admin", icon: IoGridOutline, label: "Dashboard", exact: true },
  { href: "/admin/users", icon: IoPeopleOutline, label: "Users" },
  { href: "/admin/invites", icon: IoSendOutline, label: "Invites" },
  { href: "/admin/referrals", icon: IoShareOutline, label: "Referrals" },
  { href: "/admin/waitlist", icon: IoMailOutline, label: "Waitlist" },
  { href: "/admin/analytics", icon: IoBarChartOutline, label: "Analytics" },
  { href: "/admin/ai-usage", icon: IoSparklesOutline, label: "AI Usage" },
  { href: "/admin/support", icon: IoChatbubbleOutline, label: "Support" },
  { href: "/admin/development", icon: IoRocketOutline, label: "Development" },
  { href: "/admin/presentation", icon: MdSlideshow, label: "Presentation" },
];

const bottomNavItems = [
  { href: "/admin/settings", icon: IoSettingsOutline, label: "Settings" },
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
  const { isMobileOpen, toggleMobile, closeMobile } = useSidebar();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <>
      {/* Desktop Sidebar - Icon only like demo */}
      <aside className="w-14 hidden lg:flex flex-col h-screen bg-[#0d0d0d] border-r border-white/[0.06] fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="h-12 flex items-center justify-center border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center justify-center">
            <OpportunIQLogo className="w-7 h-7 text-emerald-400" />
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-2">
          <ul className="space-y-0.5 px-2">
            {mainNavItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200 group relative mx-auto",
                      active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-[#888] hover:bg-white/[0.04] hover:text-white"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {/* Tooltip */}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-[#171717] border border-white/[0.06] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="py-3 border-t border-white/[0.06]">
          <ul className="space-y-0.5 px-2">
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200 group relative mx-auto",
                      active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-[#888] hover:bg-white/[0.04] hover:text-white"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {/* Tooltip */}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-[#171717] border border-white/[0.06] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar - Full width with labels */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/[0.06] lg:hidden transition-transform duration-300 ease-in-out",
          "bg-[#0d0d0d]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-3">
            <Link href="/admin" className="flex items-center gap-2">
              <OpportunIQLogo className="w-7 h-7 text-emerald-400" />
              <span className="text-[13px] font-semibold text-white">OpportunIQ</span>
            </Link>
            <button
              onClick={closeMobile}
              className="p-1.5 rounded-md text-[#888] hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <IoClose className="h-4 w-4" />
            </button>
          </div>

          {/* Admin Badge */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-500/10">
              <IoShield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">Admin Panel</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-1 overflow-y-auto">
            {mainNavItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors mb-0.5",
                    active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-[#888] hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
            <div className="h-px bg-white/[0.06] my-2" />
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors mb-0.5",
                    active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-[#888] hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-white/[0.06] p-3">
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
                <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[11px] font-medium text-[#888]">
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

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-12 border-b border-white/[0.06] bg-[#111111] flex items-center px-3 lg:hidden">
        <button
          onClick={toggleMobile}
          className="p-1.5 -ml-1 rounded-md text-[#888] hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <IoMenu className="h-4 w-4" />
        </button>
        <Link href="/admin" className="flex items-center gap-2 ml-2">
          <OpportunIQLogo className="w-6 h-6 text-emerald-400" />
          <span className="text-[13px] font-semibold text-white">OpportunIQ</span>
        </Link>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 ml-2">
          <IoShield className="h-2.5 w-2.5 text-emerald-400" />
          <span className="text-[10px] font-medium text-emerald-400">Admin</span>
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
            <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-medium text-[#888]">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
