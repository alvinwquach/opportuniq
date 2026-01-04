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

// ============================================
// TABLES
// ============================================

/**
 * ISSUES TABLE
 *
 * Tracks repair/maintenance projects from creation to completion.
 * "Issue" and "Project" used interchangeably - table named "projects" in DB.
 */
export const issues = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes issues when group deleted
  // Relation: Many issues → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Short problem summary - e.g., "Dishwasher not draining", "Car won't start"
  title: text("title").notNull(),

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
});

/**
 * ISSUE_EVIDENCE TABLE
 *
 * Stores evidence for AI analysis (photos/videos/audio/text/observations).
 * CRITICAL: Media files are encrypted end-to-end for privacy.
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

  // Evidence format - see evidenceTypeEnum
  evidenceType: evidenceTypeEnum("evidence_type").notNull(),

  // Path to encrypted file in Supabase Storage (photo/video/audio only)
  // Format: "evidence/{groupId}/{issueId}/{uuid}.enc"
  storageUrl: text("storage_url"),

  // AES-GCM initialization vector for decryption (Base64 encoded)
  // Required to decrypt media files along with household key
  encryptionIv: text("encryption_iv"),

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
});

/**
 * ISSUE_HYPOTHESES TABLE
 *
 * AI-generated diagnostic hypotheses (possible causes) ranked by confidence.
 * AI analyzes all evidence and generates 3-5 hypotheses.
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

  // Description of possible problem/root cause
  // Examples: "Dead battery", "Clogged filter", "Failed HVAC capacitor"
  hypothesis: text("hypothesis").notNull(),

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
});

/**
 * ISSUE_COMMENTS TABLE
 *
 * Household member discussions and coordination.
 * Real-time collaboration on repair projects.
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

  // Which household member wrote this comment
  // Relation: Many issueComments → One groupMember
  userId: uuid("user_id")
    .notNull()
    .references(() => groupMembers.id),

  // Comment text - supports markdown formatting
  // Validation: 1-10,000 characters, sanitize HTML
  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  // For edit tracking - show "edited" indicator if updatedAt > createdAt
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
