/**
 * ISSUE ACTION TYPES
 *
 * Shared types for issue server actions with E2E encryption.
 */

// Re-export types from hooks for convenience
export type {
  ProjectCategory,
  ProjectStatus,
  ProjectPriority,
  Severity,
  Urgency,
  ResolutionType,
  EvidenceType,
  IssueActivityType,
  EncryptedIssueInput,
  PlaintextIssueFields,
  EncryptedEvidenceInput,
  PlaintextEvidenceFields,
  EncryptedHypothesisInput,
  PlaintextHypothesisFields,
  EncryptedCommentInput,
  EncryptedActivityLogInput,
  PlaintextActivityLogFields,
} from "@/hooks/encrypted-issues/types";

// ============================================
// ACTION RESULT TYPES
// ============================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IssueActionResult {
  success: boolean;
  issueId?: string;
  error?: string;
}

export interface EvidenceActionResult {
  success: boolean;
  evidenceId?: string;
  error?: string;
}

export interface HypothesisActionResult {
  success: boolean;
  hypothesisId?: string;
  error?: string;
}

export interface CommentActionResult {
  success: boolean;
  commentId?: string;
  error?: string;
}

export interface ActivityLogActionResult {
  success: boolean;
  logId?: string;
  error?: string;
}
