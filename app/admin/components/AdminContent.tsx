"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IoNotifications, IoClose } from "react-icons/io5";
import { useSidebar } from "./SidebarContext";
import { AdminUserMenu } from "./AdminUserMenu";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { isCollapsed } = useSidebar();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

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
    <main className={cn(
      "flex-1 min-w-0 transition-[margin] duration-200 ease-out bg-[#0c0c0c]",
      isCollapsed ? "lg:ml-17" : "lg:ml-56"
    )}>
      <div className="hidden lg:flex h-12 items-center justify-between px-4 border-b border-[#1f1f1f] bg-[#0c0c0c] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <div ref={notificationsRef} className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    notificationsOpen
                      ? "text-white bg-[#1f1f1f]"
                      : "text-[#888] hover:text-white hover:bg-[#1f1f1f]"
                  )}
                >
                  <IoNotifications className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              {!notificationsOpen && (
                <TooltipContent side="bottom" sideOffset={8}>
                  Notifications
                </TooltipContent>
              )}
            </Tooltip>
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#0c0c0c] border border-[#1f1f1f] rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                  <span className="text-sm font-medium text-white">Notifications</span>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 rounded text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors"
                  >
                    <IoClose className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-8 text-center">
                    <IoNotifications className="h-8 w-8 text-[#333] mx-auto mb-2" />
                    <p className="text-sm text-[#666]">No notifications</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-5 bg-[#1f1f1f] mx-1" />
                    <AdminUserMenu user={user} />
        </div>
      </div>
      <div className="min-h-screen pt-12 lg:pt-0 bg-[#0c0c0c]">
        {children}
      </div>
    </main>
  );
}
