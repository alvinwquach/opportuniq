/**
 * ISSUES SCHEMA - Project tracking from diagnosis to completion
 *
 * RELATIONS:
 * - Groups (1) → (Many) Issues - One group has many repair/maintenance projects
 * - Issues (1) → (Many) IssueEvidence - One issue has many pieces of evidence (photos/videos/audio)
 * - Issues (1) → (Many) IssueHypotheses - One issue has many AI diagnoses (ranked by confidence)
 * - Issues (1) → (Many) IssueComments - One issue has many discussion comments from household
 * - Issues (1) → (Many) DiySchedules - One issue can have many scheduled work sessions
 * - Issues (1) → (Many) DecisionOptions - One issue has many resolution options (see decisions.ts)
 * - Issues (1) → (1) Decision - One issue has one final decision (see decisions.ts)
 *
 * WORKFLOW:
 * 1. User describes problem → Create issue
 * 2. Upload evidence (photos/videos) → Encrypted storage
 * 3. AI analyzes evidence → Generate hypotheses
 * 4. Household discusses → Comments
 * 5. Choose option → Decision (decisions.ts)
 * 6. Execute repair → Track progress
 * 7. Mark complete → Outcome tracking (outcomes.ts)
 */

import { pgTable, uuid, text, timestamp, pgEnum, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { groups, groupMembers } from "./groups";

// ============================================
// ENUMS
// ============================================

// Lifecycle stages: open → investigating → options_generated → decided → in_progress → completed (or deferred)
export const projectStatusEnum = pgEnum("project_status", [
  "open",
  "investigating",
  "options_generated",
  "decided",
  "in_progress",
  "completed",
  "deferred",
]);

// Urgency levels: urgent (today), high (this week), medium (this month), low (whenever)
export const projectPriorityEnum = pgEnum("project_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// Evidence formats: photo/video/audio (encrypted files) or text/observation (plaintext)
export const evidenceTypeEnum = pgEnum("evidence_type", [
  "photo",
  "video",
  "audio",
  "text",
  "observation",
]);

// Safety/damage risk: low (safe DIY), medium (requires care), high (hire pro), critical (emergency)
export const riskLevelEnum = pgEnum("risk_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

// Assessment severity: how bad is this problem?
export const severityEnum = pgEnum("severity", [
  "cosmetic",      // Purely aesthetic, no functional impact
  "minor",         // Small issue, easy fix, no risk if delayed
  "moderate",      // Should address soon, could worsen
  "serious",       // Significant problem, address promptly
  "critical",      // Major issue, structural/safety concern
]);

// Assessment urgency: when does this need attention?
export const urgencyEnum = pgEnum("urgency", [
  "monitor",       // Watch and wait, check periodically
  "this_month",    // Address within 30 days
  "this_week",     // Address within 7 days
  "today",         // Address within 24 hours
  "now",           // Drop everything, do this immediately
  "emergency",     // Life safety - call 911 / evacuate / shut off utilities
]);

// High-level problem categories for filtering and AI model selection
export const projectCategoryEnum = pgEnum("project_category", [
  "automotive",
  "home_repair",
  "appliance",
  "cleaning",
  "yard_outdoor",
  "safety",
  "maintenance",
  "installation",
  "other",
]);

// Resolution type: how was this issue ultimately resolved?
export const resolutionTypeEnum = pgEnum("resolution_type", [
  "diy",        // User fixed it themselves
  "hired",      // Hired a professional
  "replaced",   // Replaced the item entirely
  "abandoned",  // Gave up / not worth fixing
  "deferred",   // Postponed for later (with revisit date)
  "monitoring", // Decided to watch and wait
]);

// Activity types for issue timeline/audit log
export const issueActivityTypeEnum = pgEnum("issue_activity_type", [
  // Status changes
  "status_changed",
  "issue_created",
  "issue_reopened",
  // Evidence/attachment actions
  "evidence_added",
  "evidence_removed",
  // Diagnosis actions
  "hypothesis_generated",
  "diagnosis_updated",
  // Decision actions
  "options_generated",
  "decision_made",
  "decision_voted",
  // DIY scheduling
  "schedule_created",
  "schedule_updated",
  "schedule_deleted",
  // Comments
  "comment_added",
  "comment_edited",
  // Vendor/product actions
  "vendor_contacted",
  "vendor_added",
  "product_purchased",
  // Outcome tracking
  "outcome_recorded",
  "issue_completed",
  // Resolution
  "resolution_set",
]);

// ============================================
// TABLES
// ============================================

/**
 * ISSUES TABLE
 *
 * Tracks repair/maintenance projects from creation to completion.
 * "Issue" and "Project" used interchangeably - table named "projects" in DB.
 *
 * ENCRYPTION: Supports E2E encryption for PII fields (title, description, etc.)
 * When isEncrypted=true, use encrypted* fields. When false, use plaintext fields.
 */
export const issues = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes issues when group deleted
  // Relation: Many issues → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // ============================================
  // ENCRYPTION METADATA
  // ============================================
  isEncrypted: boolean("is_encrypted").default(false).notNull(),
  keyVersion: integer("key_version").default(1),
  algorithm: text("algorithm"), // "AES-GCM-256"

  // ============================================
  // PLAINTEXT FIELDS (used when isEncrypted=false)
  // ============================================

  // Short problem summary - e.g., "Dishwasher not draining", "Car won't start"
  title: text("title"),

  // Detailed description with symptoms, context, timing
  description: text("description"),

  // High-level category - see projectCategoryEnum for options
  category: projectCategoryEnum("category"),

  // Specific problem type - flexible text field (no enum)
  // Examples: "won't start", "drainage", "plumbing", "electrical"
  subcategory: text("subcategory"),

  // Optional human-friendly name for tracked item
  // Examples: "2018 Honda Civic", "Kitchen Refrigerator", "Main House HVAC"
  assetName: text("asset_name"),

  // Flexible metadata about the broken item stored as JSON
  // Car: {make, model, year, vin, mileage}
  // Appliance: {brand, model, serialNumber, purchaseDate, warrantyExpires}
  assetDetails: jsonb("asset_details"),

  // Current lifecycle stage - see projectStatusEnum
  status: projectStatusEnum("status").default("open").notNull(),

  // Urgency level - see projectPriorityEnum
  priority: projectPriorityEnum("priority").default("medium").notNull(),

  // AI's confidence in its diagnosis (0-100)
  // 90-100: very confident, 70-89: confident, 50-69: moderate, <50: low
  confidenceLevel: integer("confidence_level"),

  // ============================================
  // ASSESSMENT FIELDS - "What am I looking at?"
  // ============================================

  // AI's diagnosis of what this is
  // Example: "Hairline crack from normal settling" or "Active roof leak from damaged flashing"
  diagnosis: text("diagnosis"),

  // How bad is this? See severityEnum
  severity: severityEnum("severity"),

  // How urgent? See urgencyEnum
  urgency: urgencyEnum("urgency"),

  // What happens if user ignores this?
  // Example: "Crack may widen slightly but remains cosmetic" or "Water damage will spread to insulation and drywall"
  ignoreRisk: text("ignore_risk"),

  // Signs that indicate the problem is getting worse
  // Example: ["Crack widening beyond 1/8 inch", "Stair-step crack pattern appearing", "Doors or windows sticking"]
  warningSignsToWatch: jsonb("warning_signs_to_watch").$type<string[]>(),

  // When user should escalate to professional / call for help
  // Example: "If crack exceeds 1/4 inch or you notice doors not closing properly, consult a structural engineer"
  whenToEscalate: text("when_to_escalate"),

  // ============================================
  // EMERGENCY HANDLING
  // ============================================

  // Is this a life-safety emergency? If true, skip all other assessment and show emergencyInstructions
  isEmergency: boolean("is_emergency").default(false).notNull(),

  // Immediate actions for emergencies - shown prominently
  // Example: "Gas smell detected: 1) Do NOT flip any switches 2) Leave house immediately 3) Call 911 from outside 4) Call gas company"
  emergencyInstructions: text("emergency_instructions"),

  // What type of emergency (for proper routing/response)
  // Example: "gas_leak", "electrical_fire", "water_main_burst", "structural_collapse"
  emergencyType: text("emergency_type"),

  // Which household member created this issue
  // Relation: Many issues → One groupMember
  createdBy: uuid("created_by")
    .notNull()
    .references(() => groupMembers.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // When issue was marked complete - null if not yet completed
  completedAt: timestamp("completed_at"),

  // ============================================
  // RESOLUTION TRACKING - "How was this resolved?"
  // ============================================

  // How was this issue ultimately resolved? See resolutionTypeEnum
  resolutionType: resolutionTypeEnum("resolution_type"),

  // User notes about the resolution
  // Example: "Fixed by replacing the capacitor - $15 part from Amazon"
  resolutionNotes: text("resolution_notes"),

  // When the resolution was set
  resolvedAt: timestamp("resolved_at"),

  // Which household member marked this resolved
  // Relation: Many issues → One groupMember
  resolvedBy: uuid("resolved_by")
    .references(() => groupMembers.id),

  // ============================================
  // ENCRYPTED FIELDS (used when isEncrypted=true)
  // Each field has ciphertext + IV for AES-GCM decryption
  // ============================================
  encryptedTitle: text("encrypted_title"),
  titleIv: text("title_iv"),

  encryptedDescription: text("encrypted_description"),
  descriptionIv: text("description_iv"),

  encryptedAssetName: text("encrypted_asset_name"),
  assetNameIv: text("asset_name_iv"),

  encryptedAssetDetails: text("encrypted_asset_details"), // JSON stringified then encrypted
  assetDetailsIv: text("asset_details_iv"),

  encryptedDiagnosis: text("encrypted_diagnosis"),
  diagnosisIv: text("diagnosis_iv"),

  encryptedIgnoreRisk: text("encrypted_ignore_risk"),
  ignoreRiskIv: text("ignore_risk_iv"),

  encryptedWarningSignsToWatch: text("encrypted_warning_signs_to_watch"), // JSON stringified then encrypted
  warningSignsToWatchIv: text("warning_signs_to_watch_iv"),

  encryptedWhenToEscalate: text("encrypted_when_to_escalate"),
  whenToEscalateIv: text("when_to_escalate_iv"),

  encryptedEmergencyInstructions: text("encrypted_emergency_instructions"),
  emergencyInstructionsIv: text("emergency_instructions_iv"),

  encryptedResolutionNotes: text("encrypted_resolution_notes"),
  resolutionNotesIv: text("resolution_notes_iv"),
});

/**
 * ISSUE_EVIDENCE TABLE
 *
 * Stores evidence for AI analysis (photos/videos/audio/text/observations).
 * CRITICAL: Media files are encrypted end-to-end for privacy.
 *
 * ENCRYPTION: Supports E2E encryption for PII fields (fileName, content, extractedInfo)
 * When isEncrypted=true, use encrypted* fields. When false, use plaintext fields.
 *
 * Relation: One issue → Many evidence pieces
 */
export const issueEvidence = pgTable("issue_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - cascade delete removes evidence when issue deleted
  // Relation: Many issueEvidence → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),

  // ============================================
  // ENCRYPTION METADATA
  // ============================================
  isEncrypted: boolean("is_encrypted").default(false).notNull(),
  keyVersion: integer("key_version").default(1),
  algorithm: text("algorithm"), // "AES-GCM-256"

  // Evidence format - see evidenceTypeEnum
  evidenceType: evidenceTypeEnum("evidence_type").notNull(),

  // Path to encrypted file in Supabase Storage (photo/video/audio only)
  // Format: "evidence/{groupId}/{issueId}/{uuid}.enc"
  storageUrl: text("storage_url"),

  // AES-GCM initialization vector for decryption (Base64 encoded)
  // Required to decrypt media files along with household key
  encryptionIv: text("encryption_iv"),

  // ============================================
  // PLAINTEXT FIELDS (used when isEncrypted=false)
  // ============================================

  // Original filename for user reference - e.g., "IMG_2034.jpg"
  fileName: text("file_name"),

  // File size in bytes - for storage quotas and upload validation
  fileSize: integer("file_size"),

  // MIME type - e.g., "image/jpeg", "video/mp4", "audio/mpeg"
  mimeType: text("mime_type"),

  // Text content for text/observation evidence types (no file upload)
  content: text("content"),

  // AI analysis results stored as JSON (plaintext, not encrypted)
  // Example: {diagnosis, confidence, symptoms, suggestedTests, nextSteps}
  extractedInfo: jsonb("extracted_info"),

  // Which household member uploaded this evidence
  // Relation: Many issueEvidence → One groupMember
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => groupMembers.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  // ============================================
  // ENCRYPTED FIELDS (used when isEncrypted=true)
  // Each field has ciphertext + IV for AES-GCM decryption
  // ============================================
  encryptedFileName: text("encrypted_file_name"),
  fileNameIv: text("file_name_iv"),

  encryptedContent: text("encrypted_content"),
  contentIv: text("content_iv"),

  encryptedExtractedInfo: text("encrypted_extracted_info"), // JSON stringified then encrypted
  extractedInfoIv: text("extracted_info_iv"),
});

/**
 * ISSUE_HYPOTHESES TABLE
 *
 * AI-generated diagnostic hypotheses (possible causes) ranked by confidence.
 * AI analyzes all evidence and generates 3-5 hypotheses.
 *
 * ENCRYPTION: Supports E2E encryption for PII fields (hypothesis, reasoningChain)
 * When isEncrypted=true, use encrypted* fields. When false, use plaintext fields.
 *
 * Relation: One issue → Many hypotheses
 */
export const issueHypotheses = pgTable("issue_hypotheses", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - cascade delete removes hypotheses when issue deleted
  // Relation: Many issueHypotheses → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),

  // ============================================
  // ENCRYPTION METADATA
  // ============================================
  isEncrypted: boolean("is_encrypted").default(false).notNull(),
  keyVersion: integer("key_version").default(1),
  algorithm: text("algorithm"), // "AES-GCM-256"

  // ============================================
  // PLAINTEXT FIELDS (used when isEncrypted=false)
  // ============================================

  // Description of possible problem/root cause
  // Examples: "Dead battery", "Clogged filter", "Failed HVAC capacitor"
  hypothesis: text("hypothesis"),

  // AI's confidence in this specific hypothesis (0-100)
  // Used to rank hypotheses (highest confidence first)
  confidence: integer("confidence").notNull(),

  // Array of evidence IDs that support this hypothesis
  // Example: ["evidence-uuid-1", "evidence-uuid-2"]
  evidenceUsed: jsonb("evidence_used"),

  // AI's step-by-step reasoning for transparency
  // Structure: {steps, keyObservations, rulesOut, likelihood, nextTests}
  reasoningChain: jsonb("reasoning_chain"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  // ============================================
  // ENCRYPTED FIELDS (used when isEncrypted=true)
  // Each field has ciphertext + IV for AES-GCM decryption
  // ============================================
  encryptedHypothesis: text("encrypted_hypothesis"),
  hypothesisIv: text("hypothesis_iv"),

  encryptedReasoningChain: text("encrypted_reasoning_chain"), // JSON stringified then encrypted
  reasoningChainIv: text("reasoning_chain_iv"),
});

/**
 * ISSUE_COMMENTS TABLE
 *
 * Household member discussions and coordination.
 * Real-time collaboration on repair projects.
 *
 * ENCRYPTION: Supports E2E encryption for PII fields (content)
 * When isEncrypted=true, use encrypted* fields. When false, use plaintext fields.
 *
 * Relation: One issue → Many comments
 */
export const issueComments = pgTable("issue_comments", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - cascade delete removes comments when issue deleted
  // Relation: Many issueComments → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),

  // ============================================
  // ENCRYPTION METADATA
  // ============================================
  isEncrypted: boolean("is_encrypted").default(false).notNull(),
  keyVersion: integer("key_version").default(1),
  algorithm: text("algorithm"), // "AES-GCM-256"

  // Which household member wrote this comment
  // Relation: Many issueComments → One groupMember
  userId: uuid("user_id")
    .notNull()
    .references(() => groupMembers.id),

  // ============================================
  // PLAINTEXT FIELDS (used when isEncrypted=false)
  // ============================================

  // Comment text - supports markdown formatting
  // Validation: 1-10,000 characters, sanitize HTML
  content: text("content"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  // For edit tracking - show "edited" indicator if updatedAt > createdAt
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // ============================================
  // ENCRYPTED FIELDS (used when isEncrypted=true)
  // Each field has ciphertext + IV for AES-GCM decryption
  // ============================================
  encryptedContent: text("encrypted_content"),
  contentIv: text("content_iv"),
});

/**
 * DIY_SCHEDULES TABLE
 *
 * Coordinate multi-person DIY tasks with calendar integration.
 * Examples: "Need 2 people to lift water heater", "Reserve Sunday for garage door repair"
 *
 * Relation: One issue → Many scheduled work sessions
 */
export const diySchedules = pgTable("diy_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - cascade delete removes schedules when issue deleted
  // Relation: Many diySchedules → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),

  // When DIY work is planned to start (UTC timestamp)
  scheduledTime: timestamp("scheduled_time").notNull(),

  // Expected task duration in minutes
  // Examples: 30 (quick fix), 120 (small project), 480 (full day)
  estimatedDuration: integer("estimated_duration"),

  // Array of household member UUIDs participating in this task
  // Example: ["member-uuid-1", "member-uuid-2"]
  participants: jsonb("participants"),

  // Google Calendar event ID for 2-way sync
  // Enables updating/deleting calendar events when schedule changes
  calendarEventId: text("calendar_event_id"),

  // Which household member created this schedule
  // Relation: Many diySchedules → One groupMember
  createdBy: uuid("created_by")
    .notNull()
    .references(() => groupMembers.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * ISSUE_ACTIVITY_LOG TABLE
 *
 * Comprehensive audit trail for all issue-related events.
 * Creates a complete timeline from creation to resolution.
 * Follows pattern from groupInvitationAuditLog/groupMemberAuditLog.
 *
 * ENCRYPTION: Supports E2E encryption for PII fields (title, description, metadata)
 * When isEncrypted=true, use encrypted* fields. When false, use plaintext fields.
 *
 * Relation: One issue → Many activity log entries
 */
export const issueActivityLog = pgTable("issue_activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - cascade delete removes logs when issue deleted
  // Relation: Many issueActivityLog → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),

  // ============================================
  // ENCRYPTION METADATA
  // ============================================
  isEncrypted: boolean("is_encrypted").default(false).notNull(),
  keyVersion: integer("key_version").default(1),
  algorithm: text("algorithm"), // "AES-GCM-256"

  // Type of activity - see issueActivityTypeEnum
  activityType: issueActivityTypeEnum("activity_type").notNull(),

  // Who performed this action (null for system/AI actions)
  // Relation: Many issueActivityLog → One groupMember (optional)
  performedBy: uuid("performed_by")
    .references(() => groupMembers.id),

  // ============================================
  // PLAINTEXT FIELDS (used when isEncrypted=false)
  // ============================================

  // Human-readable title for timeline display
  // Example: "Status changed to In Progress", "Added photo evidence"
  title: text("title"),

  // Optional longer description
  description: text("description"),

  // For state changes - what was the previous value?
  // Example: "open" (for status changes)
  oldValue: text("old_value"),

  // For state changes - what is the new value?
  // Example: "in_progress" (for status changes)
  newValue: text("new_value"),

  // Flexible metadata for activity-specific data
  metadata: jsonb("metadata").$type<{
    // For evidence_added
    evidenceId?: string;
    evidenceType?: string;
    fileName?: string;
    // For decision_made
    decisionId?: string;
    optionId?: string;
    optionType?: string;
    // For schedule actions
    scheduleId?: string;
    scheduledTime?: string;
    participants?: string[];
    // For vendor actions
    vendorId?: string;
    vendorName?: string;
    // For outcome
    outcomeId?: string;
    success?: boolean;
    actualCost?: number;
    // For resolution
    resolutionType?: string;
    resolutionReason?: string;
    // For comments
    commentId?: string;
    // For hypotheses
    hypothesisCount?: number;
    topHypothesis?: string;
    confidence?: number;
    // For issue creation
    severity?: string;
    urgency?: string;
    // For emergency
    emergencyType?: string;
  }>(),

  // Link to related entity for deep linking in UI
  relatedEntityType: text("related_entity_type"), // "evidence", "decision", "schedule", "vendor", "comment", "outcome"
  relatedEntityId: uuid("related_entity_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  // ============================================
  // ENCRYPTED FIELDS (used when isEncrypted=true)
  // Each field has ciphertext + IV for AES-GCM decryption
  // ============================================
  encryptedTitle: text("encrypted_title"),
  titleIv: text("title_iv"),

  encryptedDescription: text("encrypted_description"),
  descriptionIv: text("description_iv"),

  encryptedMetadata: text("encrypted_metadata"), // JSON stringified then encrypted
  metadataIv: text("metadata_iv"),
});

// Type exports for type-safe queries
export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;

export type IssueEvidence = typeof issueEvidence.$inferSelect;
export type NewIssueEvidence = typeof issueEvidence.$inferInsert;

export type IssueHypothesis = typeof issueHypotheses.$inferSelect;
export type NewIssueHypothesis = typeof issueHypotheses.$inferInsert;

export type IssueComment = typeof issueComments.$inferSelect;
export type NewIssueComment = typeof issueComments.$inferInsert;

export type DiySchedule = typeof diySchedules.$inferSelect;
export type NewDiySchedule = typeof diySchedules.$inferInsert;

export type IssueActivityLog = typeof issueActivityLog.$inferSelect;
export type NewIssueActivityLog = typeof issueActivityLog.$inferInsert;
