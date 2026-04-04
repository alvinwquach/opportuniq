/**
 * Diagnose Page Types
 *
 * Re-exports GraphQL types and adds page-specific types.
 */

// Re-export types that are defined centrally in the hooks layer so the diagnose
// page components can import from one local place instead of reaching into
// the hooks folder directly. Keeping imports local makes refactoring easier.
export type {
  // The summary shape of a single issue as it appears in the issues sidebar list.
  DiagnoseIssue,
  // The full detail shape of an issue (chat history, costs, guides, etc.)
  // shown when the user selects an issue to view.
  DiagnoseIssueDetail,
  // A single chat message (user or AI) in the diagnosis conversation.
  // Re-exported under the alias "ChatMessage" to keep local naming clean.
  DiagnoseChatMessage as ChatMessage,
  // A how-to guide linked to an issue (title, steps, source URL, etc.).
  // Re-exported as "Guide".
  DiagnoseGuide as Guide,
  // A single step inside a Guide (description, estimated time, etc.).
  // Re-exported as "GuideStep".
  DiagnoseGuideStep as GuideStep,
  // A parts/material item needed to complete a DIY repair.
  // Re-exported as "Part".
  DiagnosePart as Part,
  // A professional service provider recommendation tied to an issue.
  // Re-exported as "Pro".
  DiagnosePro as Pro,
} from "@/lib/hooks/types";

// TabType controls which cost-option panel is visible in the issue detail view:
//   "diy"  = show the do-it-yourself cost estimate and parts list
//   "hire" = show the professional service cost estimate
export type TabType = "diy" | "hire";
