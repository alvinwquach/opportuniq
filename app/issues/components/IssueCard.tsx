// Tell Next.js this component runs in the browser (not on the server).
// Required because it relies on React component rendering and interactive hover states.
"use client";

// Import the React library itself.
// Needed here specifically to call React.createElement(), which lets us dynamically
// render an icon component that is stored in a variable rather than written as JSX directly.
import React from "react";

// Import Next.js's Link component for client-side navigation.
// The entire card is wrapped in a Link so clicking anywhere on it navigates to the issue detail page.
import Link from "next/link";

// Import category and action icons from the react-icons/io5 package.
// Each icon is used to visually represent either an issue category or a UI action:
// - IoWater: represents plumbing issues
// - IoSnow: represents HVAC (heating/cooling) issues
// - IoFlash: represents electrical issues
// - IoConstruct: represents appliance or general repair issues
// - IoHome: represents home repair, garage, or security issues
// - IoSparkles: represents the AI diagnosis section (a "sparkle" or magic icon)
// - IoArrowForward: the "go to detail" arrow shown on active cards
// - IoCheckmarkCircle: the green checkmark shown on completed cards
// - IoCalendarOutline: the calendar icon next to the "Resolved" date on completed cards
// - IoOpenOutline: the "open external" icon shown on completed cards (indicates the card is clickable)
import {
  IoWater,
  IoSnow,
  IoFlash,
  IoConstruct,
  IoHome,
  IoSparkles,
  IoArrowForward,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoOpenOutline,
} from "react-icons/io5";

// Import the TypeScript type for a single issue object with all its related details
// (title, status, priority, category, costs, diagnosis, etc.).
// Using `type` here means this import only exists at compile time — it produces no runtime code.
import type { IssueWithDetails } from "@/lib/hooks/types";

// Import configuration lookup tables from the local types file:
// - STATUS_CONFIG: maps status strings (e.g., "open") to a display label and a Tailwind color class
// - PRIORITY_CONFIG: maps priority strings (e.g., "critical") to a display label and a color class
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../types";

// A lookup table that maps a category string to the React icon component that should represent it.
// The type says: keys are strings, values are React components that accept an optional "className" prop.
// This lets us pick the right icon dynamically at runtime based on the issue's category field.
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  plumbing: IoWater,
  hvac: IoSnow,
  electrical: IoFlash,
  appliance: IoConstruct,
  // "appliances" is a plural variant that some records may use — map it to the same icon
  appliances: IoConstruct,
  home_repair: IoHome,
  garage: IoHome,
  security: IoHome,
  // Fallback for any category not listed above — show the generic wrench/tool icon
  default: IoConstruct,
};

// Helper function: given a category string (or null), return the matching icon component.
// If no category is provided, or the category doesn't have a specific icon, return the default icon.
function getCategoryIcon(category: string | null) {
  // If category is null or empty, fall back to the generic tool icon immediately.
  if (!category) return IoConstruct;

  // Normalize the category string: lowercase everything and replace spaces with underscores
  // so "Home Repair" becomes "home_repair" and matches the key in CATEGORY_ICON_MAP.
  const key = category.toLowerCase().replace(/\s+/g, "_");

  // Look up the key in the map; if not found, use the "default" entry as a fallback.
  return CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP.default;
}

// Helper function: given an ISO date string, return a human-readable relative time string
// like "5m ago", "2 days ago", or "3 weeks ago".
function getRelativeTime(dateString: string): string {
  // Parse the ISO date string into a JavaScript Date object.
  const date = new Date(dateString);

  // Get the current date/time so we can compute the difference.
  const now = new Date();

  // Calculate the raw difference in milliseconds between now and the given date.
  const diffMs = now.getTime() - date.getTime();

  // Convert milliseconds to whole minutes (1 minute = 60,000 ms).
  const diffMins = Math.floor(diffMs / 60000);

  // Convert milliseconds to whole hours (1 hour = 3,600,000 ms).
  const diffHours = Math.floor(diffMs / 3600000);

  // Convert milliseconds to whole days (1 day = 86,400,000 ms).
  const diffDays = Math.floor(diffMs / 86400000);

  // Convert days to whole weeks.
  const diffWeeks = Math.floor(diffDays / 7);

  // Return the most appropriate short label based on how long ago the date was.
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

// Define the props (inputs) this component accepts:
// - issue: the full issue data object to display on the card
// - variant: an optional hint about which section the card is in ("active" or "completed").
//   Defaults to "active" if not provided. This affects the card's visual style.
interface IssueCardProps {
  issue: IssueWithDetails;
  variant?: "active" | "completed";
}

// The IssueCard component renders a single clickable card for one household issue.
// It has two visual modes: one for active/open issues and one for resolved/completed issues.
// The default value for variant is "active" if the caller doesn't pass it explicitly.
export function IssueCard({ issue, variant = "active" }: IssueCardProps) {
  // Look up the display configuration (label + color) for this issue's status.
  // If the status isn't found in the config (unexpected value), fall back to the "open" config
  // so the card never crashes or shows blank text.
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

  // Look up the display configuration (label + color) for this issue's priority.
  // Falls back to "medium" config if the priority value is unexpected.
  const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.medium;

  // Determine whether to render the "completed" card style.
  // True if the caller explicitly passed variant="completed" OR if the issue's own status is "completed".
  // This double-check ensures the card looks right even if the variant prop wasn't passed.
  const isCompleted = variant === "completed" || issue.status === "completed";

  // Calculate how much money the user could save by doing this repair DIY instead of hiring a pro.
  // This is only possible if both cost estimates are present on the issue.
  // If either cost is missing (null), potentialSavings stays null and the savings badge is hidden.
  const potentialSavings =
    issue.diyCost !== null && issue.proCost !== null
      ? issue.proCost - issue.diyCost
      : null;

  // ── Completed card layout ──
  // If this issue is resolved, render a different, more subdued card design
  // that highlights how it was resolved and how much was saved.
  if (isCompleted) {
    return (
      // The entire card is a Next.js Link so clicking anywhere navigates to the issue detail page.
      // Slightly dimmed (opacity-80) by default, brightens to full opacity on hover.
      <Link
        href={`/dashboard/projects/${issue.id}`}
        className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group opacity-80 hover:opacity-100 block"
      >
        {/* Card header: checkmark icon on the left, title + group/category below it, open-link icon on the right */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Green circle background with a checkmark icon — signals this issue is resolved */}
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              {/* Issue title — slightly dimmed normally, brightens to white on card hover */}
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {issue.title}
              </p>
              {/* Property group name and category — shown as secondary metadata below the title */}
              <p className="text-xs text-gray-400">
                {issue.groupName} · {issue.category || "General"}
              </p>
            </div>
          </div>
          {/* Small "open" icon in the top-right corner; turns green on hover to hint the card is clickable */}
          <IoOpenOutline className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors" />
        </div>

        {/* Resolution info box: shows who fixed it (DIY or professional) and how much was saved.
            Only the "Saved" dollar amount is conditionally shown — only if a non-zero amount was saved. */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Resolved by</p>
            {/* Show "DIY" if the user fixed it themselves, otherwise "Professional" */}
            <p className="text-sm font-medium text-gray-900">
              {issue.resolvedBy === "diy" ? "DIY" : "Professional"}
            </p>
          </div>
          {/* Only show the saved amount if it exists and is greater than $0 */}
          {issue.savedAmount && issue.savedAmount > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Saved</p>
              {/* Display the saved amount in large green text, rounded to whole dollars */}
              <p className="text-lg font-bold text-emerald-400">
                ${issue.savedAmount.toFixed(0)}
              </p>
            </div>
          )}
        </div>

        {/* Card footer: shows when the issue was resolved using human-readable relative time */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {/* Small calendar icon next to the resolution date */}
            <IoCalendarOutline className="w-3.5 h-3.5" />
            {/* Show "Resolved X days ago" — if resolvedAt is missing, show an empty string */}
            Resolved {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
          </div>
        </div>
      </Link>
    );
  }

  // ── Active card layout ──
  // Rendered for issues that are not yet resolved (open, investigating, in_progress, deferred).
  // More colorful and prominent than the completed card.
  return (
    // The entire card is a Next.js Link — clicking anywhere navigates to the issue detail page.
    // The background lightens slightly and the border turns green on hover.
    <Link
      href={`/dashboard/projects/${issue.id}`}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-gray-50 transition-all cursor-pointer group block"
    >
      {/* Card header: category icon on the left, title + group/category below it, arrow icon on the right */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Category icon in a rounded green-tinted box.
              We use React.createElement() here because the icon component is stored in a variable
              (returned by getCategoryIcon), not written directly as JSX. */}
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            {React.createElement(getCategoryIcon(issue.category), { className: "w-5 h-5 text-emerald-400" })}
          </div>
          <div>
            {/* Issue title — white normally, turns green on card hover to signal interactivity */}
            <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-400 transition-colors">
              {issue.title}
            </p>
            {/* Property group and category as secondary metadata */}
            <p className="text-xs text-gray-400">
              {issue.groupName} · {issue.category || "General"}
            </p>
          </div>
        </div>
        {/* Right-pointing arrow — turns green on hover to reinforce that the card is a link */}
        <IoArrowForward className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* AI Diagnosis section — only rendered if the issue has a diagnosis text.
          Uses an amber (yellow-orange) color scheme if the issue is still "investigating"
          to signal that analysis is ongoing, and a green scheme otherwise. */}
      {issue.diagnosis && (
        <div className={`mb-3 p-3 rounded-lg ${
          issue.status === "investigating" ? "bg-amber-500/10" : "bg-gray-50"
        }`}>
          {/* Header row of the diagnosis box: sparkle icon, label ("Analyzing" or "AI Diagnosis"), and confidence % */}
          <div className="flex items-center gap-2 mb-1">
            {/* Sparkle icon — amber if still analyzing, green if diagnosis is finalized */}
            <IoSparkles className={`w-3.5 h-3.5 ${
              issue.status === "investigating" ? "text-amber-600" : "text-emerald-400"
            }`} />
            {/* Label text changes based on whether analysis is still in progress */}
            <span className={`text-xs font-medium ${
              issue.status === "investigating" ? "text-amber-600" : "text-emerald-400"
            }`}>
              {issue.status === "investigating" ? "Analyzing" : "AI Diagnosis"}
            </span>
            {/* If the AI provided a confidence percentage, show it after a middot separator */}
            {issue.confidence && (
              <span className={`text-xs ${
                issue.status === "investigating" ? "text-amber-600/70" : "text-gray-400"
              }`}>
                · {issue.confidence}% confident
              </span>
            )}
          </div>
          {/* The diagnosis text itself — clamped to 2 lines so the cards stay a consistent height */}
          <p className="text-xs text-gray-500 line-clamp-2">{issue.diagnosis}</p>
        </div>
      )}

      {/* Card footer: status badge + priority label on the left; potential savings + time ago on the right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status badge — a small pill with the status label, colored according to STATUS_CONFIG */}
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color}`}>
            {status.label}
          </span>
          {/* Priority label — just text in the color defined by PRIORITY_CONFIG (no pill background) */}
          <span className={`text-xs ${priority.color}`}>{priority.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Only show the potential savings badge if there is a positive savings amount.
              This tells the user how much they could save by doing the repair DIY. */}
          {potentialSavings !== null && potentialSavings > 0 && (
            <span className="text-xs text-emerald-400 font-medium">
              Save ${potentialSavings.toFixed(0)}
            </span>
          )}
          {/* Show when the issue was last updated, using relative time (e.g., "3 days ago") */}
          <span className="text-xs text-gray-400">{getRelativeTime(issue.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
