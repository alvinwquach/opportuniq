// Tell Next.js this component runs in the browser (not on the server).
// Required because it renders interactive linked rows that respond to user interaction.
"use client";

// Import Next.js's Link component for client-side navigation.
// Each row in the list is a Link so clicking anywhere on the row navigates to
// the issue detail page without a full browser reload.
import Link from "next/link";

// Import category icons and action icons from react-icons/io5:
// - IoWater: plumbing issues
// - IoSnow: HVAC (heating/cooling) issues
// - IoFlash: electrical issues
// - IoConstruct: appliance or general repair issues
// - IoHome: home repair, garage, or security issues
// - IoChevronForward: the small right-pointing arrow at the end of each row,
//   indicating the row is clickable and leads to a detail page
// - IoCheckmarkCircle: used as both the icon for completed-issue rows
//   and as the section heading icon for the "Resolved" group
import {
  IoWater,
  IoSnow,
  IoFlash,
  IoConstruct,
  IoHome,
  IoChevronForward,
  IoCheckmarkCircle,
} from "react-icons/io5";

// Import the TypeScript type for a single issue object with all its related details.
import type { IssueWithDetails } from "@/lib/hooks/types";

// Import STATUS_CONFIG: a lookup table that maps status strings (e.g., "in_progress")
// to a human-readable label and a Tailwind color class.
// Used to render the colored status badge on each active-issue row.
import { STATUS_CONFIG } from "../types";

// A lookup table mapping category strings to their React icon components.
// The type annotation says keys are strings and values are React components
// that accept an optional `className` prop for styling.
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  plumbing: IoWater,
  hvac: IoSnow,
  electrical: IoFlash,
  appliance: IoConstruct,
  // "appliances" is an alternate plural form some records may use — same icon
  appliances: IoConstruct,
  home_repair: IoHome,
  garage: IoHome,
  security: IoHome,
  // Fallback for any category not in the list
  default: IoConstruct,
};

// Helper function: given a category string (or null), return the appropriate icon component.
// Normalizes the string to lowercase with underscores to match the keys in CATEGORY_ICON_MAP.
function getCategoryIcon(category: string | null) {
  // If no category is provided, return the generic tool icon as a safe fallback.
  if (!category) return IoConstruct;

  // Normalize: lowercase and replace spaces with underscores so "Home Repair" → "home_repair".
  const key = category.toLowerCase().replace(/\s+/g, "_");

  // Return the matching icon, or the default if none is found.
  return CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP.default;
}

// Helper function: converts an ISO date string to a short human-readable relative time string.
// Returns values like "Just now", "5m ago", "2h ago", "3 days ago", or "2 weeks ago".
function getRelativeTime(dateString: string): string {
  // Parse the ISO date string into a JavaScript Date object.
  const date = new Date(dateString);

  // Capture the current time for comparison.
  const now = new Date();

  // Calculate the raw elapsed time in milliseconds.
  const diffMs = now.getTime() - date.getTime();

  // Convert to minutes (1 min = 60,000 ms).
  const diffMins = Math.floor(diffMs / 60000);

  // Convert to hours (1 hour = 3,600,000 ms).
  const diffHours = Math.floor(diffMs / 3600000);

  // Convert to days (1 day = 86,400,000 ms).
  const diffDays = Math.floor(diffMs / 86400000);

  // Convert to weeks.
  const diffWeeks = Math.floor(diffDays / 7);

  // Return the most precise and readable label for the elapsed time.
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

// Define the props (inputs) this component accepts:
// - activeIssues: issues that are still open / in progress / investigating / deferred
// - completedIssues: issues that have been fully resolved
// Both arrays have already been filtered and sorted by IssuesClient before being passed here.
interface IssuesListViewProps {
  activeIssues: IssueWithDetails[];
  completedIssues: IssueWithDetails[];
}

// IssuesListView renders all issues as a compact list (table-like rows).
// It is split into two sections: "Active Issues" and "Resolved".
// Each section only renders if it has at least one issue to show.
export function IssuesListView({ activeIssues, completedIssues }: IssuesListViewProps) {
  return (
    // React Fragment — lets us return two sibling <div>s without an extra wrapper element.
    <>
      {/* ── Active Issues section ──
          Only rendered when there is at least one active issue to display. */}
      {activeIssues.length > 0 && (
        // Bottom margin separates this section from the "Resolved" section below it.
        <div className="mb-8">
          {/* Section heading: small green dot + "Active Issues (N)" label */}
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            {/* Small filled green circle as a status indicator bullet */}
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Issues ({activeIssues.length})
          </h2>

          {/* The list container: a single dark rounded box that wraps all the rows.
              overflow-hidden ensures the rounded corners clip the top and bottom rows. */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            {/* Loop over every active issue and render one row per issue.
                `idx` (the array index) is needed to determine whether to draw a bottom border
                (we skip the border on the last row to avoid a double-border effect at the bottom). */}
            {activeIssues.map((issue, idx) => {
              // Get the icon component for this issue's category (e.g., IoWater for plumbing).
              const Icon = getCategoryIcon(issue.category);

              // Look up the display label and color class for this issue's status.
              // Falls back to the "open" config if the status value is unexpected.
              const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

              return (
                // Each row is a Next.js Link so the entire row is clickable.
                // A bottom border is added between rows but not after the last one.
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className={`flex items-center gap-4 p-4 hover:bg-[#1f1f1f] transition-colors cursor-pointer ${
                    idx !== activeIssues.length - 1 ? "border-b border-[#2a2a2a]" : ""
                  }`}
                >
                  {/* Category icon in a small green-tinted rounded box.
                      flex-shrink-0 prevents the icon box from getting squashed on narrow screens. */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>

                  {/* Title and subtitle — flex-1 makes this column expand to fill available space.
                      min-w-0 is required so the text can be truncated (without it, flex items
                      refuse to shrink below their content size, preventing truncation). */}
                  <div className="flex-1 min-w-0">
                    {/* Issue title — truncated with "..." if it overflows the available width */}
                    <p className="text-sm font-medium text-white truncate">{issue.title}</p>
                    {/* Secondary line: shows the diagnosis summary if available, otherwise the group name */}
                    <p className="text-xs text-[#666] truncate">
                      {issue.diagnosis || issue.groupName}
                    </p>
                  </div>

                  {/* Status badge: a colored pill showing the current status label.
                      flex-shrink-0 prevents the badge from being compressed when space is tight. */}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color} flex-shrink-0`}
                  >
                    {status.label}
                  </span>

                  {/* Last-updated time: right-aligned in a fixed-width column (w-20) so all
                      timestamps align vertically across rows for easy scanning. */}
                  <span className="text-xs text-[#555] flex-shrink-0 w-20 text-right">
                    {getRelativeTime(issue.updatedAt)}
                  </span>

                  {/* Right-pointing chevron arrow — a subtle visual affordance that the row is clickable */}
                  <IoChevronForward className="w-4 h-4 text-[#444] flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Resolved Issues section ──
          Only rendered when there is at least one completed issue to display. */}
      {completedIssues.length > 0 && (
        <div>
          {/* Section heading: green checkmark icon + "Resolved (N)" label.
              Text is muted grey to visually de-emphasize completed issues. */}
          <h2 className="text-sm font-semibold text-[#888] mb-4 flex items-center gap-2">
            <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
            Resolved ({completedIssues.length})
          </h2>

          {/* The resolved-issues list container.
              opacity-80 makes the entire section slightly dimmed to distinguish it from
              the active section above. Individual rows brighten on hover via hover:opacity-100. */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden opacity-80">
            {/* Loop over every completed issue and render one row per issue */}
            {completedIssues.map((issue, idx) => (
              // Clickable row — border between rows, none after the last row.
              // hover:opacity-100 overrides the container's opacity-80 so hovered rows look crisp.
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-[#1f1f1f] hover:opacity-100 transition-all cursor-pointer ${
                  idx !== completedIssues.length - 1 ? "border-b border-[#2a2a2a]" : ""
                }`}
              >
                {/* Green checkmark icon box — always shown on completed rows instead of a category icon */}
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Title and resolution summary */}
                <div className="flex-1 min-w-0">
                  {/* Issue title in slightly dimmed text — truncated if too long */}
                  <p className="text-sm font-medium text-[#ccc] truncate">{issue.title}</p>
                  {/* Shows "DIY · 3 days ago" or "Professional · 1 week ago".
                      The middot (·) acts as a separator between the resolution method and the date. */}
                  <p className="text-xs text-[#666]">
                    {issue.resolvedBy === "diy" ? "DIY" : "Professional"} ·{" "}
                    {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
                  </p>
                </div>

                {/* Savings amount — only shown if a positive amount was saved.
                    Displayed in large green text to celebrate the financial win. */}
                {issue.savedAmount && issue.savedAmount > 0 && (
                  <span className="text-sm font-semibold text-emerald-400 flex-shrink-0">
                    +${issue.savedAmount.toFixed(0)}
                  </span>
                )}

                {/* Property group name: right-aligned in a fixed-width column (w-24)
                    so it lines up consistently across all rows */}
                <span className="text-xs text-[#555] flex-shrink-0 w-24 text-right">
                  {issue.groupName}
                </span>

                {/* Right-pointing chevron arrow indicating the row is a link */}
                <IoChevronForward className="w-4 h-4 text-[#444] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
