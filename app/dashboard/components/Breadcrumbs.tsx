"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoChevronForward, IoHome } from "react-icons/io5";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Map paths to readable labels
const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  issues: "Issues",
  decisions: "Decisions",
  groups: "Groups",
  calendar: "Calendar",
  expenses: "Expenses",
  assets: "Assets",
  guides: "Guides",
  settings: "Settings",
  income: "Income",
  notifications: "Notifications",
  new: "New",
  edit: "Edit",
  profile: "Profile",
  help: "Help",
};

function getLabel(segment: string): string {
  // Check if it's a known path
  if (pathLabels[segment]) {
    return pathLabels[segment];
  }

  // Check if it's a UUID (likely a detail page)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return "Details";
  }

  // Capitalize and clean up
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();

  // Don't show on root dashboard
  if (pathname === "/dashboard") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const items: BreadcrumbItem[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    items.push({
      label: getLabel(segment),
      href: currentPath,
    });
  }

  // Always start with home
  items.unshift({
    label: "Home",
    href: "/dashboard",
  });

  return (
    <nav className={cn("flex items-center gap-1 text-[12px]", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isHome = index === 0;

        return (
          <div key={item.href} className="flex items-center gap-1">
            {index > 0 && <IoChevronForward className="w-3 h-3 text-[#444]" />}
            {isLast ? (
              <span className="text-white font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 text-[#666] hover:text-white transition-colors",
                  isHome && "text-[#555]"
                )}
              >
                {isHome && <IoHome className="w-3 h-3" />}
                {!isHome && item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
