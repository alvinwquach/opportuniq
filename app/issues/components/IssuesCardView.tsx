// Tell Next.js this component runs in the browser (not on the server).
// Required because it renders interactive card components.
"use client";

// Import the IssueCard component, which renders a single issue as a clickable card.
// This view is responsible for laying out a grid of those cards.
import { IssueCard } from "./IssueCard";

// Import the TypeScript type that describes the shape of a single issue object.
// Using `type` ensures this import is erased at build time — it adds no runtime overhead.
import type { IssueWithDetails } from "@/lib/hooks/types";

// Import the checkmark-circle icon used as a visual indicator next to the "Resolved" section heading.
import { IoCheckmarkCircle } from "react-icons/io5";

// Define the props (inputs) this component accepts:
// - activeIssues: the list of issues that are still in progress (open, investigating, in_progress, deferred)
// - completedIssues: the list of issues that have been fully resolved
// Both are arrays of issue objects that have already been filtered and sorted by IssuesClient.
interface IssuesCardViewProps {
  activeIssues: IssueWithDetails[];
  completedIssues: IssueWithDetails[];
}

// IssuesCardView renders all issues as a responsive grid of cards.
// It splits the issues into two sections — "Active Issues" and "Resolved" — and
// only renders a section if it actually has issues to show (avoids empty headings).
export function IssuesCardView({ activeIssues, completedIssues }: IssuesCardViewProps) {
  return (
    // React Fragment (<>) is an invisible wrapper — it lets us return two sibling <div>s
    // without adding an extra DOM element around them.
    <>
      {/* Active Issues section — only rendered when there is at least one active issue */}
      {activeIssues.length > 0 && (
        // Bottom margin separates this section from the "Resolved" section below
        <div className="mb-8">
          {/* Section heading: small green dot + "Active Issues (N)" label */}
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {/* A small filled green circle used as a visual status indicator bullet */}
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Issues ({activeIssues.length})
          </h2>
          {/* Responsive grid: 1 column on mobile, 2 on medium screens, 3 on large screens.
              Each cell holds one IssueCard. The gap-4 adds spacing between cards. */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Loop over every active issue and render an IssueCard for each one.
                The `key` prop is required by React when rendering lists — it must be a unique,
                stable identifier so React can track which card is which across re-renders.
                We use the issue's database ID for this. */}
            {activeIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="active" />
            ))}
          </div>
        </div>
      )}

      {/* Resolved Issues section — only rendered when there is at least one completed issue */}
      {completedIssues.length > 0 && (
        <div>
          {/* Section heading: green checkmark icon + "Resolved (N)" label.
              The text is a muted grey to visually de-emphasize resolved issues relative to active ones. */}
          <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
            {/* Green checkmark icon signals that all issues in this section are done */}
            <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
            Resolved ({completedIssues.length})
          </h2>
          {/* Same responsive grid layout as the active section above */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Loop over every completed issue and render a completed-style IssueCard for each.
                The `key` must be unique and stable — again we use the issue's database ID. */}
            {completedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="completed" />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
