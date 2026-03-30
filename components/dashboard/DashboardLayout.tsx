"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IoChevronForward,
  IoMenu,
  IoClose,
  IoHome,
  IoConstruct,
  IoCash,
  IoPeople,
  IoSettings,
  IoCamera,
  IoMic,
  IoVideocam,
  IoText,
  IoLogOut,
  IoNotifications,
  IoSearch,
} from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IoHome,
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: IoConstruct,
    badge: "3",
    children: [
      { label: "Active", href: "/dashboard/projects/active", icon: IoNotifications },
      { label: "Completed", href: "/dashboard/projects/completed", icon: IoConstruct },
      { label: "New Project", href: "/dashboard/projects/new", icon: IoCamera },
    ],
  },
  {
    label: "Finances",
    href: "/dashboard/finances",
    icon: IoCash,
    children: [
      { label: "Income", href: "/dashboard/finances/income", icon: IoCash },
      { label: "Expenses", href: "/dashboard/finances/expenses", icon: IoCash },
      { label: "Budgets", href: "/dashboard/finances/budgets", icon: IoCash },
    ],
  },
  {
    label: "Workspace",
    href: "/dashboard/workspace",
    icon: IoPeople,
    badge: "4",
    children: [
      { label: "Collaborators", href: "/dashboard/workspace/members", icon: IoPeople },
      { label: "Shared Expenses", href: "/dashboard/workspace/expenses", icon: IoCash },
      { label: "Schedule", href: "/dashboard/workspace/schedule", icon: IoHome },
    ],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: IoSettings,
    children: [
      { label: "Profile", href: "/dashboard/settings/profile", icon: IoSettings },
      { label: "Integrations", href: "/dashboard/settings/integrations", icon: IoSettings },
      { label: "Calendar", href: "/dashboard/settings/calendar", icon: IoSettings },
    ],
  },
];

interface SidebarContentProps {
  expandedItems: string[];
  toggleExpanded: (href: string) => void;
  setSidebarOpen: (open: boolean) => void;
  isActive: (href: string) => boolean;
}

function SidebarContent({ expandedItems, toggleExpanded, setSidebarOpen, isActive }: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <IoConstruct className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">OpportuniQ</span>
        </Link>
      </div>

      {/* Quick Capture */}
      <div className="p-4 border-b border-border">
        <div className="p-3 rounded-xl border border-dashed border-border bg-background/50">
          <p className="text-xs text-muted-foreground mb-2">Quick capture</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <IoCamera className="h-4 w-4" />
              Photo
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <IoVideocam className="h-4 w-4" />
              Video
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <IoMic className="h-4 w-4" />
              Voice
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <IoText className="h-4 w-4" />
              Text
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.href);
          const active = isActive(item.href);

          return (
            <div key={item.href}>
              <Link
                href={hasChildren ? "#" : item.href}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault();
                    toggleExpanded(item.href);
                  } else {
                    setSidebarOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <IoChevronForward
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "transform rotate-90"
                      )}
                    />
                  )}
                </div>
              </Link>

              {/* Nested items */}
              {hasChildren && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg text-sm transition-colors",
                        isActive(child.href)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <child.icon className="h-3.5 w-3.5" />
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@example.com</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <IoLogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <IoClose className="h-5 w-5" />
        </Button>

        <SidebarContent
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
          setSidebarOpen={setSidebarOpen}
          isActive={isActive}
        />
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center h-full px-6 gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <IoMenu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, expenses..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <IoNotifications className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
