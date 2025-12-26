/**
 * GUIDES SCHEMA - AI-generated DIY repair instructions with progress tracking
 *
 * RELATIONS:
 * - Users (1) → (Many) Guides - One user can trigger many guide generations
 * - Issues (1) → (Many) Guides - One issue can generate many guides (AI variations)
 * - Guides (1) → (Many) GuideSteps - One guide has many sequential steps
 * - Guides (1) → (Many) UserGuideProgress - One guide has many user progress records
 * - Users (1) → (Many) UserGuideProgress - One user can follow many guides
 * - GuideSteps (1) → (Many) UserGuideProgress - One step can be current for many users
 * - DemoModels - Standalone table mapping demoId to 3D model files (no direct FK relations)
 *
 * PURPOSE:
 * AI generates step-by-step repair guides from user issues. Each guide has:
 * - Metadata (title, difficulty, tools, estimated duration)
 * - Source attribution (Reddit, YouTube, manuals - for legal/quality tracking)
 * - Sequential steps (with images, videos, 3D demos, warnings, tips)
 * - Progress tracking (users mark steps complete, rate guides)
 *
 * PRIVACY:
 * - Guides default to isPublic = false (household-only)
 * - Creator can make public after verification (no PII)
 * - Public guides are preserved forever (community knowledge base)
 *
 * WORKFLOW:
 * 1. AI researches issue (Firecrawl scrapes Reddit, YouTube, forums)
 * 2. AI generates guide with source attribution
 * 3. User starts guide → Creates progress record
 * 4. User completes steps → Updates completedStepIds
 * 5. All steps done → isCompleted = true
 * 6. User rates guide → Feedback for improvements
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
// import { relations } from "drizzle-orm/relations";
import { issues } from "./issues";
import { users } from "./users";

// ============================================
// TABLES
// ============================================

/**
 * GUIDES TABLE
 *
 * AI-generated DIY repair instructions with metadata (title, difficulty, tools, duration).
 * Relation: One guide → Many steps, One guide → Many user progress records
 */
export const guides = pgTable("guides", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Guide title - e.g., "Repair Washing Machine Door Seal Leak"
  title: text("title").notNull(),

  // Optional detailed description of what guide covers
  description: text("description"),

  // Difficulty level: "beginner", "intermediate", "advanced"
  difficulty: text("difficulty"),

  // Estimated completion time in minutes
  estimatedDuration: integer("estimated_duration"),

  // Required tools list - e.g., ["Phillips screwdriver", "Wrench"]
  requiredTools: jsonb("required_tools").$type<string[]>(),

  // Required skills list - e.g., ["Basic hand tools", "Electrical safety"]
  requiredSkills: jsonb("required_skills").$type<string[]>(),

  // Required parts list - e.g., ["Replacement seal", "Hose clamp"]
  requiredParts: jsonb("required_parts").$type<string[]>(),

  // Foreign key to source issue (if AI-generated from issue)
  // Relation: Many guides → One issue
  generatedFromIssueId: uuid("generated_from_issue_id").references(() => issues.id),

  // True if AI-generated, false if manually created
  aiGenerated: boolean("ai_generated").default(false).notNull(),

  // AI model used for generation - e.g., "gpt-4-turbo-2024-01-25", "claude-3-opus"
  aiModel: text("ai_model"),

  // AI confidence in guide quality (0-100) based on source quality/agreement
  aiConfidence: integer("ai_confidence"),

  // Sources where AI scraped information (Reddit, YouTube, manuals, forums, etc.)
  // Used for attribution, legal protection, and quality tracking
  sources: jsonb("sources").$type<{
    url: string;
    type: "reddit" | "youtube" | "forum" | "manual" | "article" | "blog";
    title: string;
    author?: string;
    scrapedAt: string; // ISO timestamp
    relevanceScore?: number; // 0-1, how relevant this source was
  }[]>(),

  // User who triggered guide generation (reported the issue)
  // Null for system-generated guides
  // Relation: Many guides → One user
  createdById: uuid("created_by_id").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Privacy flag - defaults to false (household-only)
  // Set true to share with all users (must not contain PII)
  isPublic: boolean("is_public").default(false).notNull(),

  // Analytics: How many times guide was viewed
  // Increment atomically on guide open
  viewCount: integer("view_count").default(0).notNull(),

  // Analytics: How many users completed all steps
  // Quality signal (completionCount / viewCount = completion rate)
  completionCount: integer("completion_count").default(0).notNull(),
});

/**
 * GUIDE_STEPS TABLE
 *
 * Sequential instructions for each guide with media, warnings, tips, and 3D demos.
 * Relation: Many steps → One guide (cascade delete)
 */
export const guideSteps = pgTable("guide_steps", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to parent guide - cascade delete removes steps when guide deleted
  // Relation: Many guideSteps → One guide
  guideId: uuid("guide_id").references(() => guides.id, { onDelete: "cascade" }).notNull(),

  // Step sequence number (1, 2, 3, ...) - defines display order
  stepNumber: integer("step_number").notNull(),

  // Step title - e.g., "Turn Off Water Supply", "Remove Front Panel"
  title: text("title").notNull(),

  // Detailed step instructions (supports Markdown formatting)
  description: text("description"),

  // Optional diagram/photo URL for visual reference
  imageUrl: text("image_url"),

  // Optional video URL (YouTube embed or hosted file)
  videoUrl: text("video_url"),

  // Optional 3D demo component ID - e.g., "thermal-paste-demo"
  // Links to Three.js interactive demo component
  demoId: text("demo_id"),

  // Default 3D camera mode: "first_person" or "orbit"
  defaultCamera: text("default_camera"),

  // Safety warnings - e.g., ["Unplug before servicing", "Water may spill"]
  // Displayed prominently in red with warning icon
  warnings: jsonb("warnings").$type<string[]>(),

  // Pro tips - e.g., ["Take photo before disassembly", "Use container for screws"]
  // Helpful hints to prevent common mistakes
  tips: jsonb("tips").$type<string[]>(),

  // Estimated duration for this step in seconds
  estimatedDuration: integer("estimated_duration"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * USER_GUIDE_PROGRESS TABLE
 *
 * Tracks user progress through guides (completed steps, ratings, timestamps).
 * Relation: Many progress → One user, Many progress → One guide
 */
export const userGuideProgress = pgTable("user_guide_progress", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to user - cascade delete removes progress when user deleted
  // Relation: Many userGuideProgress → One user
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

  // Foreign key to guide - cascade delete removes progress when guide deleted
  // Relation: Many userGuideProgress → One guide
  guideId: uuid("guide_id").references(() => guides.id, { onDelete: "cascade" }).notNull(),

  // Current step user is on (null if not started or completed all steps)
  // Relation: Many userGuideProgress → One guideStep
  currentStepId: uuid("current_step_id").references(() => guideSteps.id),

  // Array of completed step IDs - preserves completion order
  // Used to calculate progress percentage and resume functionality
  completedStepIds: jsonb("completed_step_ids").$type<string[]>().default([]),

  // True when all steps completed (triggers completionCount increment)
  isCompleted: boolean("is_completed").default(false).notNull(),

  // User rating (1-5 stars) - prompt after completion
  rating: integer("rating"),

  // Optional text feedback explaining rating
  // Used for guide improvements and testimonials
  feedback: text("feedback"),

  // When user first started following guide
  startedAt: timestamp("started_at").defaultNow().notNull(),

  // When user completed all steps (null if not completed)
  // Used to calculate actual duration: completedAt - startedAt
  completedAt: timestamp("completed_at"),

  // Last time user accessed guide (for abandoned guide detection)
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
});

/**
 * DEMO_MODELS TABLE
 *
 * Stores 3D model assets for interactive repair demos.
 * Maps demoId strings to actual 3D model files (.glb) and metadata.
 * Allows storing models in database instead of hardcoding in frontend components.
 */
export const demoModels = pgTable("demo_models", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Unique identifier used in guideSteps.demoId
  // Example: "brake-pad-demo", "thermal-paste-demo"
  demoId: text("demo_id").unique().notNull(),

  // Display name for this demo
  name: text("name").notNull(),

  // Optional description of what this demo teaches
  description: text("description"),

  // URL to 3D model file (.glb format) - stored in Supabase Storage or S3
  modelUrl: text("model_url").notNull(),

  // Optional thumbnail/preview image URL
  thumbnailUrl: text("thumbnail_url"),

  // Demo configuration and metadata
  // Includes camera positions, animations, interaction hints, etc.
  metadata: jsonb("metadata").$type<{
    defaultCameraPosition?: { x: number; y: number; z: number };
    animations?: string[]; // Animation names available in the model
    interactionHints?: string[]; // UI hints for user
    difficulty?: "beginner" | "intermediate" | "advanced";
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for type-safe queries
export type Guide = typeof guides.$inferSelect;
export type NewGuide = typeof guides.$inferInsert;

export type GuideStep = typeof guideSteps.$inferSelect;
export type NewGuideStep = typeof guideSteps.$inferInsert;

export type UserGuideProgress = typeof userGuideProgress.$inferSelect;
export type NewUserGuideProgress = typeof userGuideProgress.$inferInsert;

export type DemoModel = typeof demoModels.$inferSelect;
export type NewDemoModel = typeof demoModels.$inferInsert;
