/**
 * ISSUE ACTIONS
 *
 * Server actions for issue management with E2E encryption support.
 */

// Types
export * from "./types";

// Issue CRUD
export { createIssueEncrypted, createIssuePlaintext } from "./createIssue";
export { updateIssueEncrypted, updateIssuePlaintext } from "./updateIssue";
export { getIssuesForGroup, getIssueById, getIssuesByStatus, getActiveIssues } from "./getIssues";
export { deleteIssue } from "./deleteIssue";

// Evidence CRUD
export { createEvidenceEncrypted, createEvidencePlaintext } from "./createEvidence";
export { getEvidenceForIssue, getEvidenceById } from "./getEvidence";
export { deleteEvidence } from "./deleteEvidence";

// Hypothesis CRUD
export { createHypothesisEncrypted, createHypothesisPlaintext } from "./createHypothesis";
export { getHypothesesForIssue } from "./getHypotheses";

// Comment CRUD
export { createCommentEncrypted, createCommentPlaintext } from "./createComment";
export { getCommentsForIssue } from "./getComments";
export { updateCommentEncrypted, updateCommentPlaintext } from "./updateComment";
export { deleteComment } from "./deleteComment";

// Activity Log CRUD
export { createActivityLogEncrypted, createActivityLogPlaintext } from "./createActivityLog";
export { getActivityLogsForIssue } from "./getActivityLogs";
