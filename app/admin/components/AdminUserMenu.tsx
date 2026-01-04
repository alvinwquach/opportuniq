"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IoPerson,
  IoSettings,
  IoCard,
  IoLocation,
  IoHelpCircle,
  IoLogOut,
  IoHome,
} from "react-icons/io5";
import { cn } from "@/lib/utils";

interface AdminUserMenuProps {
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    postalCode?: string | null;
  };
}

export function AdminUserMenu({ user }: AdminUserMenuProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          "flex items-center gap-2 p-1 rounded-md transition-colors",
          open ? "bg-[#1f1f1f]" : "hover:bg-[#1f1f1f]"
        )}
      >
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
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0c0c0c] border border-[#1f1f1f] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name || "Admin"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-sm font-medium text-[#888]">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || "Admin"}
                </p>
                <p className="text-[11px] text-[#666] truncate">{user.email}</p>
              </div>
            </div>
          </div>
          {user.postalCode && (
            <div className="px-4 py-2 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2 text-[#666]">
                <IoLocation className="w-3.5 h-3.5" />
                <span className="text-[11px]">{user.postalCode}</span>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="ml-auto text-[10px] text-[#555] hover:text-white transition-colors"
                >
                  Change
                </Link>
              </div>
            </div>
          )}
          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#888] hover:text-white hover:bg-[#161616] transition-colors"
            >
              <IoPerson className="w-4 h-4" />
              <span className="text-sm">Profile</span>
            </Link>
            <Link
              href="/dashboard/settings/income"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#888] hover:text-white hover:bg-[#161616] transition-colors"
            >
              <IoCard className="w-4 h-4" />
              <span className="text-sm">Income & Budget</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#888] hover:text-white hover:bg-[#161616] transition-colors"
            >
              <IoSettings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </Link>
            <Link
              href="/help"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#888] hover:text-white hover:bg-[#161616] transition-colors"
            >
              <IoHelpCircle className="w-4 h-4" />
              <span className="text-sm">Help & Support</span>
            </Link>
          </div>
          <div className="border-t border-[#1f1f1f] py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#00D4FF] hover:text-[#00D4FF]/80 hover:bg-[#00D4FF]/10 transition-colors"
            >
              <IoHome className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
          </div>
          <div className="border-t border-[#1f1f1f] py-1">
            <Link
              href="/auth/logout"
              className="flex items-center gap-3 px-4 py-2 text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <IoLogOut className="w-4 h-4" />
              <span className="text-sm">Sign out</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
