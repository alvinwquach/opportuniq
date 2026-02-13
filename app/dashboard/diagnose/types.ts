/**
 * Diagnose Page Types
 *
 * Re-exports GraphQL types and adds page-specific types.
 */

// Re-export GraphQL types for consistency
export type {
  DiagnoseIssue,
  DiagnoseIssueDetail,
  DiagnoseChatMessage as ChatMessage,
  DiagnoseGuide as Guide,
  DiagnoseGuideStep as GuideStep,
  DiagnosePart as Part,
  DiagnosePro as Pro,
} from "@/lib/graphql/types";

export type TabType = "diy" | "hire";
