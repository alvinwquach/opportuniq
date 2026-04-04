/**
 * Types for the Issues Page
 */

export type IssueStatus = "open" | "investigating" | "options_generated" | "decided" | "in_progress" | "completed" | "deferred";

export type IssuePriority = "low" | "medium" | "high" | "urgent";

export type ViewMode = "cards" | "list" | "kanban";

export type SortBy = "updated" | "created" | "priority";

export type SortOrder = "asc" | "desc";

// Priority order for sorting (higher number = higher priority)
export const PRIORITY_ORDER: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export interface IssueFilters {
  status: string | null;
  priority: string | null;
  category: string | null;
  group: string | null;
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  open: { label: "Open", color: "bg-emerald-500/20 text-emerald-600", dotColor: "bg-emerald-500" },
  investigating: { label: "Investigating", color: "bg-amber-500/20 text-amber-600", dotColor: "bg-amber-500" },
  options_generated: { label: "Options Ready", color: "bg-purple-500/20 text-purple-600", dotColor: "bg-purple-500" },
  decided: { label: "Decided", color: "bg-amber-500/20 text-amber-600", dotColor: "bg-amber-500" },
  in_progress: { label: "In Progress", color: "bg-emerald-500/20 text-emerald-600", dotColor: "bg-emerald-500" },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-600", dotColor: "bg-emerald-500" },
  deferred: { label: "Deferred", color: "bg-gray-500/20 text-gray-500", dotColor: "bg-gray-500" },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-400" },
  medium: { label: "Medium", color: "text-amber-600" },
  high: { label: "High", color: "text-red-600" },
  urgent: { label: "Urgent", color: "text-red-500" },
};

// Category icon mapping
export const CATEGORY_ICONS: Record<string, string> = {
  plumbing: "IoWater",
  hvac: "IoSnow",
  electrical: "IoFlash",
  appliance: "IoConstruct",
  appliances: "IoConstruct",
  automotive: "IoCar",
  home_repair: "IoHome",
  cleaning: "IoSparkles",
  yard_outdoor: "IoLeaf",
  safety: "IoShield",
  security: "IoShield",
  maintenance: "IoConstruct",
  installation: "IoConstruct",
  garage: "IoHome",
  other: "IoConstruct",
};
