/**
 * ENCRYPTED ISSUES TYPES
 *
 * Type definitions for E2E encrypted issue-related data.
 * Separates encrypted (server-stored) from decrypted (display) types.
 */

// Infer enum types from the schema enums
export type ProjectCategory =
  | "automotive"
  | "home_repair"
  | "appliance"
  | "cleaning"
  | "yard_outdoor"
  | "safety"
  | "maintenance"
  | "installation"
  | "other";

export type ProjectStatus =
  | "open"
  | "investigating"
  | "options_generated"
  | "decided"
  | "in_progress"
  | "completed"
  | "deferred";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type Severity = "cosmetic" | "minor" | "moderate" | "serious" | "critical";

export type Urgency =
  | "monitor"
  | "this_month"
  | "this_week"
  | "today"
  | "now"
  | "emergency";

export type ResolutionType =
  | "diy"
  | "hired"
  | "replaced"
  | "abandoned"
  | "deferred"
  | "monitoring";

export type EvidenceType = "photo" | "video" | "audio" | "text" | "observation";

export type IssueActivityType =
  | "status_changed"
  | "issue_created"
  | "issue_reopened"
  | "evidence_added"
  | "evidence_removed"
  | "hypothesis_generated"
  | "diagnosis_updated"
  | "options_generated"
  | "decision_made"
  | "decision_voted"
  | "schedule_created"
  | "schedule_updated"
  | "schedule_deleted"
  | "comment_added"
  | "comment_edited"
  | "vendor_contacted"
  | "vendor_added"
  | "product_purchased"
  | "outcome_recorded"
  | "issue_completed"
  | "resolution_set";

// ============================================
// ENCRYPTED INPUT TYPES (Client → Server)
// ============================================

/**
 * Encrypted issue input for creating/updating issues
 */
export interface EncryptedIssueInput {
  // Encrypted fields (ciphertext + IV pairs)
  encryptedTitle: string;
  titleIv: string;
  encryptedDescription?: string;
  descriptionIv?: string;
  encryptedAssetName?: string;
  assetNameIv?: string;
  encryptedAssetDetails?: string;
  assetDetailsIv?: string;
  encryptedDiagnosis?: string;
  diagnosisIv?: string;
  encryptedIgnoreRisk?: string;
  ignoreRiskIv?: string;
  encryptedWarningSignsToWatch?: string;
  warningSignsToWatchIv?: string;
  encryptedWhenToEscalate?: string;
  whenToEscalateIv?: string;
  encryptedEmergencyInstructions?: string;
  emergencyInstructionsIv?: string;
  encryptedResolutionNotes?: string;
  resolutionNotesIv?: string;
  keyVersion?: number;
}

/**
 * Plaintext issue fields (needed for queries/filtering)
 */
export interface PlaintextIssueFields {
  category?: ProjectCategory;
  subcategory?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  confidenceLevel?: number;
  severity?: Severity;
  urgency?: Urgency;
  isEmergency?: boolean;
  emergencyType?: string;
  resolutionType?: ResolutionType;
  resolvedAt?: Date;
  resolvedBy?: string;
  completedAt?: Date;
}

/**
 * Encrypted evidence input
 */
export interface EncryptedEvidenceInput {
  encryptedFileName?: string;
  fileNameIv?: string;
  encryptedContent?: string;
  contentIv?: string;
  encryptedExtractedInfo?: string;
  extractedInfoIv?: string;
  keyVersion?: number;
}

/**
 * Plaintext evidence fields
 */
export interface PlaintextEvidenceFields {
  evidenceType: EvidenceType;
  storageUrl?: string;
  encryptionIv?: string; // IV for the encrypted file itself
  fileSize?: number;
  mimeType?: string;
}

/**
 * Encrypted hypothesis input
 */
export interface EncryptedHypothesisInput {
  encryptedHypothesis: string;
  hypothesisIv: string;
  encryptedReasoningChain?: string;
  reasoningChainIv?: string;
  keyVersion?: number;
}

/**
 * Plaintext hypothesis fields
 */
export interface PlaintextHypothesisFields {
  confidence: number;
  evidenceUsed?: string[];
}

/**
 * Encrypted comment input
 */
export interface EncryptedCommentInput {
  encryptedContent: string;
  contentIv: string;
  keyVersion?: number;
}

/**
 * Encrypted activity log input
 */
export interface EncryptedActivityLogInput {
  encryptedTitle: string;
  titleIv: string;
  encryptedDescription?: string;
  descriptionIv?: string;
  encryptedMetadata?: string;
  metadataIv?: string;
  keyVersion?: number;
}

/**
 * Plaintext activity log fields
 */
export interface PlaintextActivityLogFields {
  activityType: IssueActivityType;
  oldValue?: string;
  newValue?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// ============================================
// DECRYPTED TYPES (for display in UI)
// ============================================

/**
 * Decrypted issue for display
 */
export interface DecryptedIssue {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  assetName: string | null;
  assetDetails: Record<string, unknown> | null;
  category: ProjectCategory | null;
  subcategory: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  confidenceLevel: number | null;
  diagnosis: string | null;
  severity: Severity | null;
  urgency: Urgency | null;
  ignoreRisk: string | null;
  warningSignsToWatch: string[] | null;
  whenToEscalate: string | null;
  isEmergency: boolean;
  emergencyInstructions: string | null;
  emergencyType: string | null;
  resolutionType: ResolutionType | null;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

/**
 * Decrypted evidence for display
 */
export interface DecryptedEvidence {
  id: string;
  issueId: string;
  evidenceType: EvidenceType;
  storageUrl: string | null;
  encryptionIv: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  content: string | null;
  extractedInfo: Record<string, unknown> | null;
  uploadedBy: string;
  createdAt: Date;
}

/**
 * Decrypted hypothesis for display
 */
export interface DecryptedHypothesis {
  id: string;
  issueId: string;
  hypothesis: string;
  confidence: number;
  evidenceUsed: string[] | null;
  reasoningChain: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Decrypted comment for display
 */
export interface DecryptedComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Decrypted activity log entry for display
 */
export interface DecryptedActivityLog {
  id: string;
  issueId: string;
  activityType: IssueActivityType;
  performedBy: string | null;
  title: string;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  metadata: Record<string, unknown> | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: Date;
}

// ============================================
// RAW SERVER RESPONSE TYPES
// ============================================

/**
 * Raw issue from server (encrypted or plaintext)
 */
export interface RawIssue {
  id: string;
  groupId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedTitle: string | null;
  titleIv: string | null;
  encryptedDescription: string | null;
  descriptionIv: string | null;
  encryptedAssetName: string | null;
  assetNameIv: string | null;
  encryptedAssetDetails: string | null;
  assetDetailsIv: string | null;
  encryptedDiagnosis: string | null;
  diagnosisIv: string | null;
  encryptedIgnoreRisk: string | null;
  ignoreRiskIv: string | null;
  encryptedWarningSignsToWatch: string | null;
  warningSignsToWatchIv: string | null;
  encryptedWhenToEscalate: string | null;
  whenToEscalateIv: string | null;
  encryptedEmergencyInstructions: string | null;
  emergencyInstructionsIv: string | null;
  encryptedResolutionNotes: string | null;
  resolutionNotesIv: string | null;
  // Plaintext fields
  title: string | null;
  description: string | null;
  assetName: string | null;
  assetDetails: Record<string, unknown> | null;
  diagnosis: string | null;
  ignoreRisk: string | null;
  warningSignsToWatch: string[] | null;
  whenToEscalate: string | null;
  emergencyInstructions: string | null;
  resolutionNotes: string | null;
  // Always plaintext
  category: ProjectCategory | null;
  subcategory: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  confidenceLevel: number | null;
  severity: Severity | null;
  urgency: Urgency | null;
  isEmergency: boolean;
  emergencyType: string | null;
  resolutionType: ResolutionType | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

/**
 * Raw evidence from server
 */
export interface RawEvidence {
  id: string;
  issueId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  evidenceType: EvidenceType;
  storageUrl: string | null;
  encryptionIv: string | null;
  // Encrypted fields
  encryptedFileName: string | null;
  fileNameIv: string | null;
  encryptedContent: string | null;
  contentIv: string | null;
  encryptedExtractedInfo: string | null;
  extractedInfoIv: string | null;
  // Plaintext fields
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  content: string | null;
  extractedInfo: Record<string, unknown> | null;
  uploadedBy: string;
  createdAt: Date;
}

/**
 * Raw hypothesis from server
 */
export interface RawHypothesis {
  id: string;
  issueId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedHypothesis: string | null;
  hypothesisIv: string | null;
  encryptedReasoningChain: string | null;
  reasoningChainIv: string | null;
  // Plaintext fields
  hypothesis: string | null;
  confidence: number;
  evidenceUsed: string[] | null;
  reasoningChain: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Raw comment from server
 */
export interface RawComment {
  id: string;
  issueId: string;
  userId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedContent: string | null;
  contentIv: string | null;
  // Plaintext fields
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Raw activity log from server
 */
export interface RawActivityLog {
  id: string;
  issueId: string;
  activityType: IssueActivityType;
  performedBy: string | null;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedTitle: string | null;
  titleIv: string | null;
  encryptedDescription: string | null;
  descriptionIv: string | null;
  encryptedMetadata: string | null;
  metadataIv: string | null;
  // Plaintext fields
  title: string | null;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  metadata: Record<string, unknown> | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: Date;
}
