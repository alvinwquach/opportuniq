// Tell Next.js this component runs in the browser (not on the server).
// Required because it renders interactive card links and uses browser-side React features.
"use client";

// Import Next.js's Link component for client-side navigation.
// Each issue card in every Kanban column is wrapped in a Link so clicking it navigates
// to the issue detail page without a full browser reload.
import Link from "next/link";

// Import category icons from react-icons/io5, one per issue category:
// - IoWater: plumbing issues
// - IoSnow: HVAC (heating/cooling) issues
// - IoFlash: electrical issues
// - IoConstruct: appliance or general repair issues
// - IoHome: home repair, garage, or security issues
// - IoSparkles: AI analysis indicator shown on cards in the "Investigating" column
// - IoCheckmarkCircle: shown on completed-issue cards to signal the issue is resolved
import {
  IoWater,
  IoSnow,
  IoFlash,
  IoConstruct,
  IoHome,
  IoSparkles,
  IoCheckmarkCircle,
} from "react-icons/io5";

// Import the TypeScript type for a single issue object with all its details.
import type { IssueWithDetails } from "@/lib/hooks/types";

// Import PRIORITY_CONFIG: a lookup table that maps priority strings (e.g., "critical")
// to a human-readable label and a Tailwind color class, used in the card footer.
import { PRIORITY_CONFIG } from "../types";

// A lookup table that maps a category string to the React icon component for that category.
// The type annotation says: keys are strings, values are React components that accept
// an optional `className` string prop.
// This lets us pick the right icon at runtime based on the issue's category field.
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
  // Fallback for any category not listed above
  default: IoConstruct,
};

// Helper function: given a category string (or null), return the matching icon component.
// If the category is missing or unrecognised, fall back to the generic tool icon.
function getCategoryIcon(category: string | null) {
  // If no category is provided, return the default tool icon immediately.
  if (!category) return IoConstruct;

  // Normalize: lowercase and replace spaces with underscores so "Home Repair" → "home_repair"
  // and matches the key in CATEGORY_ICON_MAP.
  const key = category.toLowerCase().replace(/\s+/g, "_");

  // Return the matching icon, or the default if no match is found.
  return CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP.default;
}

// Helper function: converts an ISO date string into a short human-readable relative label
// like "Today", "3 days ago", or "2 weeks ago".
// This is a simplified version (only days/weeks, no hours/minutes) because Kanban cards
// have less space than the full IssueCard component.
function getRelativeTime(dateString: string): string {
  // Parse the ISO date string into a JavaScript Date object.
  const date = new Date(dateString);

  // Get the current time to calculate the elapsed duration.
  const now = new Date();

  // Compute the difference in milliseconds.
  const diffMs = now.getTime() - date.getTime();

  // Convert milliseconds to whole days (1 day = 86,400,000 ms).
  const diffDays = Math.floor(diffMs / 86400000);

  // Convert days to whole weeks.
  const diffWeeks = Math.floor(diffDays / 7);

  // Return the most appropriate label based on elapsed time.
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

// Define the props for the internal KanbanColumn sub-component:
// - title: the column heading text (e.g., "Open", "In Progress")
// - count: the number of issues in this column, shown next to the heading
// - dotColor: a Tailwind class for the colored status indicator dot (e.g., "bg-emerald-500")
// - hoverColor: a Tailwind class for the card's hover border color (differs per column theme)
// - issues: the array of issue objects to render as cards in this column
interface KanbanColumnProps {
  title: string;
  count: number;
  dotColor: string;
  hoverColor: string;
  issues: IssueWithDetails[];
}

// KanbanColumn is a reusable internal component that renders a single column in the Kanban board.
// It displays a column header and a vertical stack of issue cards.
// Not exported because it is only used within this file.
function KanbanColumn({ title, count, dotColor, hoverColor, issues }: KanbanColumnProps) {
  return (
    // Each column is a fixed-width flex column (320px / w-80).
    // flex-shrink-0 prevents the column from shrinking when the board overflows horizontally.
    <div className="flex-shrink-0 w-80">
      {/* Column header: colored status dot, column title, and issue count badge */}
      <div className="flex items-center gap-2 mb-3 px-1">
        {/* Small filled circle whose color is determined by the `dotColor` prop.
            For example, "Open" uses green, "Investigating" uses amber. */}
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        {/* Column title text */}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {/* Issue count displayed as a small dark pill badge */}
        <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>

      {/* Vertical stack of issue cards — space-y-3 adds a gap between each card */}
      <div className="space-y-3">
        {/* Loop over every issue in this column and render a card for each */}
        {issues.map((issue) => {
          // Get the icon component for this issue's category (e.g., IoWater for plumbing).
          const Icon = getCategoryIcon(issue.category);

          // Look up the display label and color for this issue's priority level.
          // Falls back to "medium" config if the priority value is unexpected.
          const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.medium;

          // Derive boolean flags for the issue's status to keep the JSX below readable.
          const isCompleted = issue.status === "completed";
          const isInvestigating = issue.status === "investigating";
          const isInProgress = issue.status === "in_progress";

          return (
            // Each card is a Next.js Link so the user can click anywhere to open the detail page.
            // The `hoverColor` prop controls the border color change on hover (varies by column theme).
            // Completed cards are dimmed (opacity-75) to visually de-emphasize them.
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 ${hoverColor} transition-all cursor-pointer group block ${
                isCompleted ? "opacity-75 hover:opacity-100" : ""
              }`}
            >
              {/* Card header: icon on the left, title + group name on the right */}
              <div className="flex items-start gap-3 mb-3">
                {/* Small icon box: shows a checkmark for completed issues,
                    or the category-specific icon for all other statuses */}
                <div
                  className={`w-8 h-8 rounded-lg ${
                    isCompleted ? "bg-emerald-500/20" : "bg-emerald-500/20"
                  } flex items-center justify-center flex-shrink-0`}
                >
                  {isCompleted ? (
                    // Completed: show a green checkmark circle
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    // All other statuses: show the category icon (e.g., water drop for plumbing)
                    <Icon className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Issue title — dimmed on completed cards, turns green on hover */}
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? "text-[#ccc]" : "text-white"
                    } group-hover:text-emerald-400 transition-colors line-clamp-2`}
                  >
                    {issue.title}
                  </p>
                  {/* Property group name shown in smaller muted text below the title */}
                  <p className="text-xs text-[#666] mt-0.5">{issue.groupName}</p>
                </div>
              </div>

              {/* "Investigating" status banner: shown only when the issue is being analyzed by AI.
                  Displays the AI's current confidence percentage in an amber (warning) style box. */}
              {isInvestigating && issue.confidence && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-amber-500/10 rounded-lg">
                  <IoSparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-400">{issue.confidence}% confident</span>
                </div>
              )}

              {/* "In Progress" status banner: shown when repair work has started.
                  Acts as a simple visual indicator that work is underway. */}
              {isInProgress && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-500/10 rounded-lg">
                  <IoConstruct className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400">In Progress</span>
                </div>
              )}

              {/* "Completed" resolution info row: shows how the issue was resolved (DIY or Pro)
                  and how much money was saved, if any. Only shown on completed issues. */}
              {isCompleted && (
                <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg mb-3">
                  {/* "DIY" or "Pro" label on the left */}
                  <span className="text-xs text-[#888]">
                    {issue.resolvedBy === "diy" ? "DIY" : "Pro"}
                  </span>
                  {/* Savings amount on the right — only shown if a positive amount was saved */}
                  {issue.savedAmount && issue.savedAmount > 0 && (
                    <span className="text-sm font-semibold text-emerald-400">
                      +${issue.savedAmount.toFixed(0)}
                    </span>
                  )}
                </div>
              )}

              {/* Diagnosis snippet: shown only on non-completed issues that have a diagnosis.
                  Clamped to 2 lines to keep card heights consistent. */}
              {issue.diagnosis && !isCompleted && (
                <p className="text-xs text-[#888] line-clamp-2 mb-3">{issue.diagnosis}</p>
              )}

              {/* Card footer: shows the priority label for active issues,
                  or the resolution date for completed issues */}
              <div className="flex items-center justify-between">
                {isCompleted ? (
                  // For completed issues: show when the issue was resolved (relative time)
                  <span className="text-xs text-[#555]">
                    {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
                  </span>
                ) : (
                  // For active issues: show the priority level in its themed color
                  <span className={`text-xs ${priority.color}`}>
                    {priority.label} priority
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Empty state placeholder shown when the column has no issues.
            The dashed border and low-opacity background visually distinguish it from an occupied card. */}
        {issues.length === 0 && (
          <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
            {/* The title is lowercased so it reads naturally: "No open issues", "No in progress issues", etc. */}
            <p className="text-xs text-[#555]">No {title.toLowerCase()} issues</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Define the props for the exported IssuesKanbanView component:
// - issues: the already-filtered and sorted list of all issues to display across all columns.
//   This component is responsible for splitting that list into the appropriate per-status columns.
interface IssuesKanbanViewProps {
  issues: IssueWithDetails[];
}

// IssuesKanbanView renders the full Kanban board: four side-by-side columns, one per status group.
// It receives the combined filtered issues list and splits it into per-status arrays
// to pass to each KanbanColumn.
// The "Completed" column is rendered inline (not via KanbanColumn) because it has
// an additional max-height + scroll behaviour to handle potentially long lists.
export function IssuesKanbanView({ issues }: IssuesKanbanViewProps) {
  // Filter the master issues list into four sub-lists, one per Kanban column.
  // These filters run every time the `issues` prop changes (e.g., after a filter is applied).
  const openIssues = issues.filter((i) => i.status === "open");
  const investigatingIssues = issues.filter((i) => i.status === "investigating");
  const inProgressIssues = issues.filter((i) => i.status === "in_progress");
  const completedIssues = issues.filter((i) => i.status === "completed");

  return (
    // Horizontal scrolling flex row: gap-4 between columns, pb-4 so the scrollbar doesn't overlap cards.
    // overflow-x-auto lets the board scroll horizontally on small screens where all 4 columns don't fit.
    <div className="flex gap-4 overflow-x-auto pb-4">

      {/* Open column: issues that have been reported but not yet started */}
      <KanbanColumn
        title="Open"
        count={openIssues.length}
        dotColor="bg-emerald-500"
        hoverColor="hover:border-emerald-500/30"
        issues={openIssues}
      />

      {/* Investigating column: issues where AI is currently analyzing the problem */}
      <KanbanColumn
        title="Investigating"
        count={investigatingIssues.length}
        // Amber (orange-yellow) dot and hover color to signal "needs attention / in analysis"
        dotColor="bg-amber-500"
        hoverColor="hover:border-amber-500/30"
        issues={investigatingIssues}
      />

      {/* In Progress column: issues where the repair has been started */}
      <KanbanColumn
        title="In Progress"
        count={inProgressIssues.length}
        dotColor="bg-emerald-500"
        hoverColor="hover:border-emerald-500/30"
        issues={inProgressIssues}
      />

      {/* ── Completed column (rendered inline, not via KanbanColumn) ──
          This column gets special treatment: it has a max-height and scrolls internally
          so that a long history of completed issues doesn't push the other columns off screen.
          It otherwise follows the same visual style as the other columns. */}
      <div className="flex-shrink-0 w-80">
        {/* Column header — same structure as KanbanColumn's header */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold text-white">Completed</h3>
          {/* Issue count badge */}
          <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
            {completedIssues.length}
          </span>
        </div>

        {/* Scrollable card list: max-height is calculated so the column fills the viewport
            minus the header/filter area (~320px), and pr-2 reserves space for the scrollbar */}
        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
          {/* Loop over completed issues and render a compact resolution card for each */}
          {completedIssues.map((issue) => {
            // Get the category icon (not actually displayed on completed cards,
            // but getCategoryIcon is called here consistently with the other columns).
            const Icon = getCategoryIcon(issue.category);

            return (
              // Clickable card that navigates to the issue detail page.
              // Dimmed to 75% opacity by default to de-emphasize resolved issues;
              // full opacity on hover to let the user inspect them if needed.
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group opacity-75 hover:opacity-100 block"
              >
                {/* Card header: checkmark icon + title + group name */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Green checkmark icon box — always shown on completed cards */}
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Issue title — dimmed by default, turns white on hover */}
                    <p className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors line-clamp-2">
                      {issue.title}
                    </p>
                    {/* Property group name */}
                    <p className="text-xs text-[#666] mt-0.5">{issue.groupName}</p>
                  </div>
                </div>

                {/* Resolution info row: how the issue was resolved and how much was saved */}
                <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg mb-3">
                  {/* "DIY" or "Pro" label */}
                  <span className="text-xs text-[#888]">
                    {issue.resolvedBy === "diy" ? "DIY" : "Pro"}
                  </span>
                  {/* Savings amount — only shown if positive */}
                  {issue.savedAmount && issue.savedAmount > 0 && (
                    <span className="text-sm font-semibold text-emerald-400">
                      +${issue.savedAmount.toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Card footer: when the issue was resolved (relative time) */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#555]">
                    {issue.resolvedAt ? getRelativeTime(issue.resolvedAt) : ""}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Empty state: shown when no issues have been completed yet */}
          {completedIssues.length === 0 && (
            <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
              <p className="text-xs text-[#555]">No completed issues</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
