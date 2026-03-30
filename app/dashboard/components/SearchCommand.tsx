"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IoSearch,
  IoGrid,
  IoAlertCircle,
  IoThumbsUp,
  IoPeople,
  IoWallet,
  IoSettings,
  IoCube,
  IoBook,
  IoCalendar,
  IoAdd,
  IoCash,
  IoHelpCircle,
} from "react-icons/io5";
import { FiCommand } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";
import amplitude from "@/amplitude";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIncome?: () => void;
  initialQuery?: string;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  category: "navigation" | "action" | "help";
}

export function SearchCommand({ open, onOpenChange, onAddIncome, initialQuery = "" }: SearchCommandProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sync with initialQuery when modal opens
  useEffect(() => {
    if (open) {
      amplitude.track("Command Palette Opened");
      if (initialQuery) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearch(initialQuery);
      }
    }
  }, [open, initialQuery]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Go to dashboard",
      icon: IoGrid,
      action: () => router.push("/dashboard"),
      shortcut: "G D",
      category: "navigation",
    },
    {
      id: "issues",
      label: "Issues",
      description: "View all issues",
      icon: IoAlertCircle,
      action: () => router.push("/issues"),
      shortcut: "G I",
      category: "navigation",
    },
    {
      id: "decisions",
      label: "Decisions",
      description: "View pending decisions",
      icon: IoThumbsUp,
      action: () => router.push("/decisions"),
      shortcut: "G V",
      category: "navigation",
    },
    {
      id: "groups",
      label: "Groups",
      description: "Manage your groups",
      icon: IoPeople,
      action: () => router.push("/groups"),
      category: "navigation",
    },
    {
      id: "calendar",
      label: "Calendar",
      description: "View household calendar",
      icon: IoCalendar,
      action: () => router.push("/calendar"),
      shortcut: "G C",
      category: "navigation",
    },
    {
      id: "expenses",
      label: "Expenses",
      description: "Track expenses",
      icon: IoWallet,
      action: () => router.push("/expenses"),
      category: "navigation",
    },
    {
      id: "assets",
      label: "Assets",
      description: "Manage your assets",
      icon: IoCube,
      action: () => router.push("/assets"),
      category: "navigation",
    },
    {
      id: "guides",
      label: "Guides",
      description: "DIY guides and tutorials",
      icon: IoBook,
      action: () => router.push("/guides"),
      category: "navigation",
    },
    {
      id: "settings",
      label: "Settings",
      description: "Account settings",
      icon: IoSettings,
      action: () => router.push("/dashboard/settings"),
      category: "navigation",
    },

    // Actions
    {
      id: "new-issue",
      label: "New Issue",
      description: "Report a new issue",
      icon: IoAdd,
      action: () => router.push("/issues/new"),
      shortcut: "N",
      category: "action",
    },
    {
      id: "add-income",
      label: "Add Income",
      description: "Add a new income source",
      icon: IoCash,
      action: () => {
        onOpenChange(false);
        onAddIncome?.();
      },
      category: "action",
    },
    {
      id: "add-expense",
      label: "Add Expense",
      description: "Log a new expense",
      icon: IoWallet,
      action: () => router.push("/expenses/new"),
      category: "action",
    },
    {
      id: "invite-member",
      label: "Invite Member",
      description: "Invite someone to your group",
      icon: IoPeople,
      action: () => router.push("/groups?action=invite"),
      category: "action",
    },

    // Help
    {
      id: "help",
      label: "Help & Support",
      description: "Get help and documentation",
      icon: IoHelpCircle,
      action: () => router.push("/help"),
      shortcut: "?",
      category: "help",
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = {
    action: filteredCommands.filter((c) => c.category === "action"),
    navigation: filteredCommands.filter((c) => c.category === "navigation"),
    help: filteredCommands.filter((c) => c.category === "help"),
  };

  const flatFiltered = [
    ...groupedCommands.action,
    ...groupedCommands.navigation,
    ...groupedCommands.help,
  ];

  /* eslint-disable react-hooks/preserve-manual-memoization */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % flatFiltered.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + flatFiltered.length) % flatFiltered.length);
          break;
        case "Enter":
          e.preventDefault();
          if (flatFiltered[selectedIndex]) {
            const cmd = flatFiltered[selectedIndex];
            amplitude.track("Command Executed", {
              command: cmd.label,
              category: cmd.category,
              searchQuery: search || undefined,
              method: "keyboard",
            });
            cmd.action();
            onOpenChange(false);
          }
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    },
    [open, flatFiltered, selectedIndex, onOpenChange]
  );
  /* eslint-enable react-hooks/preserve-manual-memoization */

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
    }
  }, [open]);

  const renderGroup = (title: string, items: CommandItem[], startIndex: number) => {
    if (items.length === 0) return null;
    return (
      <div key={title}>
        <p className="text-[11px] uppercase tracking-wider text-[#bbb] font-semibold px-3 py-2 mb-1">
          {title}
        </p>
        {items.map((cmd, i) => {
          const index = startIndex + i;
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              onClick={() => {
                amplitude.track("Command Executed", {
                  command: cmd.label,
                  category: cmd.category,
                  searchQuery: search || undefined,
                  method: "click",
                });
                cmd.action();
                onOpenChange(false);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                index === selectedIndex
                  ? "bg-[#00D4FF]/15 border border-[#00D4FF]/30 text-white shadow-sm"
                  : "text-[#ddd] hover:bg-[#252525] hover:text-white border border-transparent"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 shrink-0",
                index === selectedIndex ? "text-[#00D4FF]" : "text-[#aaa]"
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">{cmd.label}</p>
                {cmd.description && (
                  <p className="text-[12px] text-[#aaa] truncate mt-0.5">{cmd.description}</p>
                )}
              </div>
              {cmd.shortcut && (
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#0c0c0c] text-[#bbb] border border-[#444] font-mono">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  let currentIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#1a1a1a] border-[#3a3a3a] sm:max-w-2xl p-0 gap-0 shadow-2xl"
        showCloseButton={false}
      >
        <VisuallyHidden asChild>
          <DialogTitle>Search Commands</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#3a3a3a] bg-[#1f1f1f]">
          <IoSearch className="w-5 h-5 text-[#aaa] shrink-0" />
          <input
            type="text"
            placeholder="Search commands, navigate to pages, create new items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white text-base placeholder:text-[#888] focus:outline-none"
          />
          <kbd className="text-[11px] px-2 py-1 rounded bg-[#0c0c0c] text-[#bbb] border border-[#444] flex items-center gap-0.5 shrink-0">
            <FiCommand className="w-3 h-3" />K
          </kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-3 space-y-2 bg-[#1a1a1a]">
          {flatFiltered.length === 0 ? (
            <p className="text-sm text-[#aaa] text-center py-8">No commands found</p>
          ) : (
            <>
              {renderGroup("Actions", groupedCommands.action, (currentIndex = 0))}
              {renderGroup(
                "Navigation",
                groupedCommands.navigation,
                (currentIndex += groupedCommands.action.length)
              )}
              {renderGroup(
                "Help",
                groupedCommands.help,
                (currentIndex += groupedCommands.navigation.length)
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-4 px-4 py-3 border-t border-[#3a3a3a] text-[11px] text-[#aaa] bg-[#1f1f1f]">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#0c0c0c] border border-[#333] text-[#aaa]">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#0c0c0c] border border-[#333] text-[#aaa]">↓</kbd>
            <span className="text-[#999]">navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#0c0c0c] border border-[#333] text-[#aaa]">↵</kbd>
            <span className="text-[#999]">select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#0c0c0c] border border-[#333] text-[#aaa]">esc</kbd>
            <span className="text-[#999]">close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
