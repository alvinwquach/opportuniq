"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  IoSearchOutline,
  IoGridOutline,
  IoScanOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
  IoSettingsOutline,
  IoReturnDownBack,
  IoArrowUp,
  IoArrowDown,
} from "react-icons/io5";
import { ViewType } from "./types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (view: ViewType) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: "navigation" | "issues" | "actions";
}

const MOCK_ISSUES = [
  { id: "issue-1", title: "Kitchen faucet leaking", status: "In Progress" },
  { id: "issue-2", title: "HVAC filter replacement", status: "Scheduled" },
  { id: "issue-3", title: "Garage door squeaking", status: "Diagnosed" },
  { id: "issue-4", title: "Bathroom grout repair", status: "New" },
];

export function CommandPalette({ open, onOpenChange, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigationItems: CommandItem[] = [
    {
      id: "nav-dashboard",
      label: "Dashboard",
      description: "Overview and stats",
      icon: IoGridOutline,
      action: () => { onNavigate?.("dashboard"); onOpenChange(false); },
      category: "navigation",
    },
    {
      id: "nav-diagnose",
      label: "Diagnose",
      description: "Start a new diagnosis",
      icon: IoScanOutline,
      action: () => { onNavigate?.("diagnose"); onOpenChange(false); },
      category: "navigation",
    },
    {
      id: "nav-issues",
      label: "Issues",
      description: "View all issues",
      icon: IoAlertCircleOutline,
      action: () => { onNavigate?.("issues"); onOpenChange(false); },
      category: "navigation",
    },
    {
      id: "nav-groups",
      label: "Groups",
      description: "Household members",
      icon: IoPeopleOutline,
      action: () => { onNavigate?.("groups"); onOpenChange(false); },
      category: "navigation",
    },
    {
      id: "nav-calendar",
      label: "Calendar",
      description: "Scheduled tasks",
      icon: IoCalendarOutline,
      action: () => { onNavigate?.("calendar"); onOpenChange(false); },
      category: "navigation",
    },
    {
      id: "nav-finances",
      label: "Finances",
      description: "Budget and spending",
      icon: IoWalletOutline,
      action: () => { onNavigate?.("finances"); onOpenChange(false); },
      category: "navigation",
    },
    {
      id: "nav-guides",
      label: "Guides",
      description: "DIY tutorials",
      icon: IoBookOutline,
      action: () => { onNavigate?.("guides"); onOpenChange(false); },
      category: "navigation",
    },
    {
      id: "nav-settings",
      label: "Settings",
      description: "Preferences and account",
      icon: IoSettingsOutline,
      action: () => { onNavigate?.("settings"); onOpenChange(false); },
      category: "navigation",
    },
  ];

  // Filter items based on query
  const filteredNavigation = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredIssues = MOCK_ISSUES.filter((issue) =>
    issue.title.toLowerCase().includes(query.toLowerCase())
  );

  const allItems = [
    ...filteredNavigation,
    ...filteredIssues.map((issue) => ({
      id: issue.id,
      label: issue.title,
      description: issue.status,
      icon: IoAlertCircleOutline,
      action: () => { onNavigate?.("issues"); onOpenChange(false); },
      category: "issues" as const,
    })),
  ];

  // Reset selection when query changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Keyboard navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            allItems[selectedIndex].action();
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allItems, selectedIndex, onOpenChange]
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
          <DialogTitle>Command Palette</DialogTitle>
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
            placeholder="Search issues, guides, or type a command..."
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
            <>
              {/* Navigation Section */}
              {filteredNavigation.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#666]">
                    Navigation
                  </p>
                  {filteredNavigation.map((item, index) => {
                    const Icon = item.icon;
                    const isSelected = selectedIndex === index;
                    return (
                      <button
                        key={item.id}
                        data-index={index}
                        onClick={item.action}
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

              {/* Issues Section */}
              {filteredIssues.length > 0 && query.length > 0 && (
                <div className="p-2 border-t border-white/[0.06]">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#666]">
                    Issues
                  </p>
                  {filteredIssues.map((issue, idx) => {
                    const index = filteredNavigation.length + idx;
                    const isSelected = selectedIndex === index;
                    return (
                      <button
                        key={issue.id}
                        data-index={index}
                        onClick={() => { onNavigate?.("issues"); onOpenChange(false); }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isSelected ? "bg-emerald-500/10 text-emerald-400" : "text-[#888] hover:bg-white/[0.04]"
                        }`}
                      >
                        <IoAlertCircleOutline className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-[#666]"}`} />
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-[#ccc]"}`}>
                            {issue.title}
                          </p>
                          <p className="text-xs text-[#666]">{issue.status}</p>
                        </div>
                        {isSelected && (
                          <IoReturnDownBack className="w-4 h-4 text-[#666]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
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
