/**
 * GROUPS SCHEMA - Collaborative groups and shared financial tracking
 *
 * RELATIONS:
 * - Groups (1) → (Many) GroupMembers - One group has many members
 * - Groups (1) → (1) GroupConstraints - One group has one budget/preference record
 * - Groups (1) → (Many) GroupExpenses - One group has many shared expenses
 * - Groups (1) → (Many) BudgetContributions - One group has many member contributions
 * - Groups (1) → (Many) GroupInvitations - One group has many pending invitations
 * - Groups (1) → (Many) Issues - One group has many issues/projects
 * - Users (1) → (Many) GroupMembers - One user can belong to many groups
 * - Users (1) → (Many) GroupInvitations - One user can invite many people (invitedBy)
 * - GroupMembers (1) → (Many) BudgetContributions - One member makes many contributions
 *
 * PATTERN:
 * Many-to-many relationship: Users ↔ GroupMembers ↔ Groups
 * GroupMembers is the junction table with role information
 */

import { pgTable, uuid, text, timestamp, pgEnum, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { incomeFrequencyEnum } from "./income";

// ============================================
// ENUMS
// ============================================

// Permission levels for group members
// coordinator = full control, collaborator = can manage, participant/contributor/observer = varying access
export const groupRoleEnum = pgEnum("group_role", [
  "coordinator",
  "collaborator",
  "participant",
  "contributor",
  "observer",
]);

// Audit log action types for invitation tracking
export const invitationActionEnum = pgEnum("invitation_action", [
  "created",
  "resent",
  "role_updated",
  "extended",
  "revoked",
  "accepted",
  "expired",
  "bulk_created",
]);

// Audit log action types for member tracking (post-acceptance)
export const memberActionEnum = pgEnum("member_action", [
  "role_changed",
  "removed",
  "left",
  "approved",
  "rejected",
]);

// Membership status for group members
// pending = invited but not yet accepted, active = accepted and participating, inactive = left or removed
export const memberStatusEnum = pgEnum("member_status", [
  "pending",
  "active",
  "inactive",
]);

// Risk tolerance for AI decision recommendations
export const riskToleranceEnum = pgEnum("risk_tolerance", [
  "very_low",
  "low",
  "moderate",
  "high",
  "very_high",
]);

// Preference for DIY vs hiring professionals
export const diyPreferenceEnum = pgEnum("diy_preference", [
  "prefer_diy",
  "neutral",
  "prefer_hire",
]);

// ============================================
// TABLES
// ============================================

/**
 * GROUPS TABLE
 *
 * A group of people tracking expenses/issues together.
 * Can be solo (just yourself), couple, roommates, or family.
 */
export const groups = pgTable("groups", {
  // Primary identifier
  id: uuid("id").primaryKey().defaultRandom(),

  // Group display name - e.g., "My Projects", "Johnson Family", "Apartment 4B"
  name: text("name").notNull(),

  // Postal code for vendor proximity searches
  // Supports international formats: US (94132), UK (SW1A 1AA), Canada (K1A 0B1), etc.
  postalCode: text("postal_code"),

  // Default search radius in miles for finding contractors
  defaultSearchRadius: integer("default_search_radius").default(25),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * GROUP_MEMBERS TABLE (Junction Table)
 *
 * Links users to groups with role-based permissions.
 * Relation: Many users ↔ Many groups
 */
export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes memberships when group deleted
  // Relation: Many groupMembers → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Foreign key to users - cascade delete removes memberships when user deleted
  // Relation: Many groupMembers → One user
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Member's permission level - coordinator (full control), collaborator, participant, contributor, observer
  role: groupRoleEnum("role").notNull().default("participant"),

  // Membership status - pending (invited), active (accepted), inactive (left/removed)
  status: memberStatusEnum("status").notNull().default("pending"),

  // When invitation was sent
  invitedAt: timestamp("invited_at").defaultNow().notNull(),

  // When user accepted invitation - null if pending
  joinedAt: timestamp("joined_at"),

  // Who invited this member to the group
  // Relation: Many groupMembers → One user (the inviter)
  invitedBy: uuid("invited_by").references(() => users.id),
});

/**
 * GROUP_CONSTRAINTS TABLE
 *
 * Budget limits and decision-making preferences for the group.
 * Used by AI to filter and recommend options.
 * Relation: One-to-one with groups (unique groupId)
 */
export const groupConstraints = pgTable("group_constraints", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - unique constraint ensures one-to-one relation
  // Relation: One groupConstraints → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" })
    .unique(),

  // Maximum monthly spending on repairs/maintenance
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }),

  // Savings reserved for unexpected major repairs
  emergencyBuffer: decimal("emergency_buffer", { precision: 10, scale: 2 }),

  // Current balance in shared budget pool (actual money available)
  // Updated when members contribute (budgetContributions) or group pays expenses
  // Members contribute → balance increases, Group pays expense → balance decreases
  sharedBalance: decimal("shared_balance", { precision: 10, scale: 2 }).default("0").notNull(),

  // How comfortable with risk - influences AI recommendations
  riskTolerance: riskToleranceEnum("risk_tolerance").default("moderate"),

  // Preference for DIY vs hiring professionals
  diyPreference: diyPreferenceEnum("diy_preference").default("neutral"),

  // Categories the group will NEVER attempt DIY (e.g., ["electrical", "gas", "roof"])
  neverDIY: text("never_diy").array(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * GROUP_EXPENSES TABLE
 *
 * Shared expenses visible to all group members (not private like userExpenses).
 * Relation: One group → Many expenses
 */
export const groupExpenses = pgTable("group_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes expenses when group deleted
  // Relation: Many groupExpenses → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Expense category - flexible text: "Utilities", "Repairs", "Rent", etc.
  category: text("category").notNull(),

  // Expense amount
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  // When expense occurred (not when logged)
  date: timestamp("date").notNull(),

  // Optional description
  description: text("description"),

  // Flag for unexpected/urgent expenses
  isEmergency: boolean("is_emergency").default(false),

  // Whether expense repeats regularly
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: incomeFrequencyEnum("recurring_frequency"),
  nextDueDate: timestamp("next_due_date"),

  // Optional link to associated issue/repair
  issueId: uuid("issue_id"),

  // Which group member paid for this expense
  // Relation: Many groupExpenses → One groupMember
  paidBy: uuid("paid_by")
    .notNull()
    .references(() => groupMembers.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * BUDGET_CONTRIBUTIONS TABLE
 *
 * Tracks individual member contributions to the shared budget pool.
 * Used to record who contributed what amount and maintain group financial transparency.
 * Relation: One group → Many contributions
 */
export const budgetContributions = pgTable("budget_contributions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes contributions when group deleted
  // Relation: Many budgetContributions → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Which group member made this contribution
  // Relation: Many budgetContributions → One groupMember
  memberId: uuid("member_id")
    .notNull()
    .references(() => groupMembers.id, { onDelete: "cascade" }),

  // Amount contributed to shared pool
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  // Optional note - e.g., "Monthly rent contribution", "Emergency fund deposit"
  note: text("note"),

  // When contribution was made
  contributedAt: timestamp("contributed_at").defaultNow().notNull(),
});

/**
 * GROUP_INVITATIONS TABLE
 *
 * Manages magic link invitations for joining groups.
 * When an organizer invites someone, a unique token is generated for the magic link.
 * Relation: One group → Many invitations
 */
export const groupInvitations = pgTable("group_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes invitations when group deleted
  // Relation: Many groupInvitations → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Email of person being invited (before they sign up)
  inviteeEmail: text("invitee_email").notNull(),

  // Unique token for magic link - used in URL
  // Example URL: https://opportuniq.app/invite/abc123def456
  token: text("token").unique().notNull(),

  // Role the invitee will be assigned upon joining
  role: groupRoleEnum("role").notNull().default("participant"),

  // Optional personalized message from inviter
  message: text("message"),

  // Who sent the invitation
  // Relation: Many groupInvitations → One user
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id),

  // When invitation expires (typically 7 days from creation)
  expiresAt: timestamp("expires_at").notNull(),

  // When invitee accepted invitation (null if pending)
  acceptedAt: timestamp("accepted_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for type-safe queries
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;

export type GroupConstraints = typeof groupConstraints.$inferSelect;
export type NewGroupConstraints = typeof groupConstraints.$inferInsert;

export type GroupExpense = typeof groupExpenses.$inferSelect;
export type NewGroupExpense = typeof groupExpenses.$inferInsert;

export type BudgetContribution = typeof budgetContributions.$inferSelect;
export type NewBudgetContribution = typeof budgetContributions.$inferInsert;

export type GroupInvitation = typeof groupInvitations.$inferSelect;
export type NewGroupInvitation = typeof groupInvitations.$inferInsert;

/**
 * GROUP_INVITATION_AUDIT_LOG TABLE
 *
 * Tracks all actions performed on group invitations for history and auditing.
 * Provides a complete timeline of invitation lifecycle events.
 * Relation: One group → Many audit logs
 */
export const groupInvitationAuditLog = pgTable("group_invitation_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes logs when group deleted
  // Relation: Many auditLogs → One group
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Optional reference to the invitation (null if invitation was deleted)
  // Using text instead of UUID to preserve history even after invitation deletion
  invitationId: uuid("invitation_id"),

  // The type of action performed
  action: invitationActionEnum("action").notNull(),

  // Email address of the invitee
  inviteeEmail: text("invitee_email").notNull(),

  // Who performed this action (coordinator/collaborator)
  // Relation: Many auditLogs → One user
  performedBy: uuid("performed_by")
    .notNull()
    .references(() => users.id),

  // Optional: Previous value (for role changes, extensions)
  oldValue: text("old_value"),

  // Optional: New value (for role changes, extensions)
  newValue: text("new_value"),

  // Additional context as JSON (e.g., bulk invite batch ID, expiration dates)
  metadata: text("metadata"),

  // When this action occurred
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GroupInvitationAuditLog = typeof groupInvitationAuditLog.$inferSelect;
export type NewGroupInvitationAuditLog = typeof groupInvitationAuditLog.$inferInsert;

/**
 * GROUP_MEMBER_AUDIT_LOG TABLE
 *
 * Tracks all actions performed on group members after they join.
 * Provides a complete timeline of membership lifecycle events.
 * Relation: One group → Many audit logs
 */
export const groupMemberAuditLog = pgTable("group_member_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to groups - cascade delete removes logs when group deleted
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Reference to the member record
  memberId: uuid("member_id"),

  // The type of action performed
  action: memberActionEnum("action").notNull(),

  // User ID of the affected member
  targetUserId: uuid("target_user_id")
    .notNull()
    .references(() => users.id),

  // Email of the affected member (for historical reference)
  targetEmail: text("target_email").notNull(),

  // Who performed this action (coordinator/collaborator)
  performedBy: uuid("performed_by")
    .notNull()
    .references(() => users.id),

  // Optional: Previous value (for role changes)
  oldValue: text("old_value"),

  // Optional: New value (for role changes)
  newValue: text("new_value"),

  // Additional context as JSON
  metadata: text("metadata"),

  // When this action occurred
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GroupMemberAuditLog = typeof groupMemberAuditLog.$inferSelect;
export type NewGroupMemberAuditLog = typeof groupMemberAuditLog.$inferInsert;
