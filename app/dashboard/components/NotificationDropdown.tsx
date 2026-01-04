"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  IoNotifications,
  IoAlertCircle,
  IoThumbsUp,
  IoCalendar,
  IoPeople,
  IoCheckmarkCircle,
  IoTime,
  IoClose,
} from "react-icons/io5";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "issue" | "decision" | "reminder" | "invite" | "completed";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  href?: string;
  groupName?: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const notificationIcons = {
  issue: IoAlertCircle,
  decision: IoThumbsUp,
  reminder: IoCalendar,
  invite: IoPeople,
  completed: IoCheckmarkCircle,
};

const notificationColors = {
  issue: "text-amber-400",
  decision: "text-purple-400",
  reminder: "text-blue-400",
  invite: "text-[#00D4FF]",
  completed: "text-green-400",
};

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "p-1.5 rounded-md transition-colors relative",
          open
            ? "bg-[#1f1f1f] text-white"
            : "text-[#888] hover:text-white hover:bg-[#1f1f1f]"
        )}
      >
        <IoNotifications className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-[#00D4FF] text-[#0c0c0c] rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0c0c0c] border border-[#1f1f1f] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-sm font-medium text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onMarkAllAsRead?.();
                }}
                className="text-[11px] text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-100 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <IoNotifications className="w-8 h-8 text-[#333] mx-auto mb-2" />
                <p className="text-sm text-[#555]">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1f1f1f]">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  const iconColor = notificationColors[notification.type];

                  const content = (
                    <div
                      className={cn(
                        "px-4 py-3 hover:bg-[#161616] transition-colors cursor-pointer relative group",
                        !notification.read && "bg-[#00D4FF]/5"
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkAsRead?.(notification.id);
                        }
                        setOpen(false);
                      }}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            notification.type === "issue" && "bg-amber-500/10",
                            notification.type === "decision" && "bg-purple-500/10",
                            notification.type === "reminder" && "bg-blue-500/10",
                            notification.type === "invite" && "bg-[#00D4FF]/10",
                            notification.type === "completed" && "bg-green-500/10"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-[11px] text-[#666] line-clamp-1 mt-0.5">
                            {notification.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <IoTime className="w-3 h-3 text-[#444]" />
                            <span className="text-[10px] text-[#555]">
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                              })}
                            </span>
                            {notification.groupName && (
                              <>
                                <span className="text-[#333]">·</span>
                                <span className="text-[10px] text-[#555]">
                                  {notification.groupName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#00D4FF] shrink-0 mt-1.5" />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead?.(notification.id);
                        }}
                        className="absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#1f1f1f] text-[#555] hover:text-white transition-all"
                      >
                        <IoClose className="w-3 h-3" />
                      </button>
                    </div>
                  );

                  if (notification.href) {
                    return (
                      <Link key={notification.id} href={notification.href}>
                        {content}
                      </Link>
                    );
                  }

                  return <div key={notification.id}>{content}</div>;
                })}
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-[#1f1f1f]">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-[11px] text-[#666] hover:text-white transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
