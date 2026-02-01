"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import {
  IoSearchOutline,
  IoGrid,
  IoPeople,
  IoMail,
  IoBarChart,
  IoSettings,
  IoSend,
  IoShare,
  IoRocket,
  IoChatbubble,
  IoSparkles,
  IoReturnDownBack,
  IoArrowUp,
  IoArrowDown,
  IoHome,
} from "react-icons/io5";
import { MdSlideshow } from "react-icons/md";

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: "navigation" | "actions";
}

export function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigationItems: CommandItem[] = [
    {
      id: "nav-dashboard",
      label: "Admin Dashboard",
      description: "Overview and stats",
      icon: IoGrid,
      href: "/admin",
      category: "navigation",
    },
    {
      id: "nav-users",
      label: "Users",
      description: "Manage users",
      icon: IoPeople,
      href: "/admin/users",
      category: "navigation",
    },
    {
      id: "nav-invites",
      label: "Invites",
      description: "Manage invitations",
      icon: IoSend,
      href: "/admin/invites",
      category: "navigation",
    },
    {
      id: "nav-referrals",
      label: "Referrals",
      description: "Track referrals",
      icon: IoShare,
      href: "/admin/referrals",
      category: "navigation",
    },
    {
      id: "nav-waitlist",
      label: "Waitlist",
      description: "Manage waitlist",
      icon: IoMail,
      href: "/admin/waitlist",
      category: "navigation",
    },
    {
      id: "nav-analytics",
      label: "Analytics",
      description: "View analytics",
      icon: IoBarChart,
      href: "/admin/analytics",
      category: "navigation",
    },
    {
      id: "nav-ai-usage",
      label: "AI Usage",
      description: "AI metrics and usage",
      icon: IoSparkles,
      href: "/admin/ai-usage",
      category: "navigation",
    },
    {
      id: "nav-support",
      label: "Support",
      description: "Support tickets",
      icon: IoChatbubble,
      href: "/admin/support",
      category: "navigation",
    },
    {
      id: "nav-development",
      label: "Development",
      description: "Dev tools",
      icon: IoRocket,
      href: "/admin/development",
      category: "navigation",
    },
    {
      id: "nav-presentation",
      label: "Presentation",
      description: "Demo slides",
      icon: MdSlideshow,
      href: "/admin/presentation",
      category: "navigation",
    },
    {
      id: "nav-settings",
      label: "Settings",
      description: "Admin settings",
      icon: IoSettings,
      href: "/admin/settings",
      category: "navigation",
    },
    {
      id: "nav-user-dashboard",
      label: "User Dashboard",
      description: "Go to user area",
      icon: IoHome,
      href: "/dashboard",
      category: "navigation",
    },
  ];

  // Filter items based on query
  const filteredNavigation = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
  );

  const allItems = filteredNavigation;

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (allItems[selectedIndex]) {
            router.push(allItems[selectedIndex].href);
            onOpenChange(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [allItems, selectedIndex, onOpenChange, router]
  );

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 bg-[#171717] border-white/[0.06] max-w-xl overflow-hidden"
        showCloseButton={false}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Admin Command Palette</DialogTitle>
        </VisuallyHidden.Root>
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <IoSearchOutline className="w-5 h-5 text-[#666] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search admin pages..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-[#555] focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-[#666] bg-[#111111] border border-white/[0.06] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {allItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#666]">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-2">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#666]">
                Navigation
              </p>
              {allItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={item.id}
                    data-index={index}
                    onClick={() => {
                      router.push(item.href);
                      onOpenChange(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected ? "bg-emerald-500/10 text-emerald-400" : "text-[#888] hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-[#666]"}`} />
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-[#ccc]"}`}>
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-xs text-[#666]">{item.description}</p>
                      )}
                    </div>
                    {isSelected && (
                      <IoReturnDownBack className="w-4 h-4 text-[#666]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-[#111111]">
          <div className="flex items-center gap-4 text-[10px] text-[#666]">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-5 h-5 bg-[#171717] border border-white/[0.06] rounded text-[10px]">
                <IoArrowUp className="w-3 h-3" />
              </kbd>
              <kbd className="inline-flex items-center justify-center w-5 h-5 bg-[#171717] border border-white/[0.06] rounded text-[10px]">
                <IoArrowDown className="w-3 h-3" />
              </kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center px-1.5 h-5 bg-[#171717] border border-white/[0.06] rounded text-[10px]">
                ↵
              </kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <span className="text-[10px] text-[#666]">
            <kbd className="px-1.5 py-0.5 bg-[#171717] border border-white/[0.06] rounded text-[10px]">⌘K</kbd> to open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
