/**
 * Encrypted Issues Module
 *
 * Client-side encryption for issue-related data (issues, evidence, hypotheses,
 * comments, activity logs). All encryption/decryption happens in the browser
 * using AES-256-GCM.
 *
 * Usage:
 *   import { useIssueEncryption } from "@/hooks/encrypted-issues";
 *   const { encryptIssueData, decryptIssues } = useIssueEncryption();
 */

// Types
export * from "./types";

// Hooks
export { useIssueEncryption } from "./useIssueEncryption";
export { useEvidenceEncryption } from "./useEvidenceEncryption";
export { useHypothesisEncryption } from "./useHypothesisEncryption";
export { useCommentEncryption } from "./useCommentEncryption";
export { useActivityLogEncryption } from "./useActivityLogEncryption";
